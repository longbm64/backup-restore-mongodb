const express = require('express')
const helmet = require('helmet')
const app = express()
const bodyParser = require('body-parser')
const _ = require('lodash')
const __ = require('lbm-helpers')

app.use(express.static(__dirname + '/public'))
app.use('/dbs', express.static(__dirname + '/dbs'))
app.use(helmet())
app.use(express.json({ limit: '50000mb' }))
app.use(bodyParser.json({ limit: '50000mb' }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50000mb',
}))
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(function (req, res, next) {
    res.setHeader('Content-Security-Policy', "default-src *; style-src 'self' http://* 'unsafe-inline'; img-src 'self' data:; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    next()
})

app.get('/', (req, res) => {
    res.render('database')
})

//api
const { exec, execSync } = require('child_process')
const { MongoClient } = require('mongodb');
let client = null
const fs = require('fs');
const path = require('path');
const archiver = require('archiver')
const unzipper = require('unzipper')
const os = require('os');

const zipFolder = (source, out) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = fs.createWriteStream(out)

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)

        stream.on('close', () => resolve())
        archive.finalize()
    })
}
const getMongoPath = () => {
    const osType = os.type(); // 'Linux', 'Darwin', 'Windows_NT' 
    console.log(`OS Type: ${osType}`);
    let mongodump = ''
    let mongorestore = ''
    if (osType.indexOf('Windows') > -1) {
        ///windown 
        mongodump = path.join(__dirname, 'libs') + '/mongodump.exe'
        mongorestore = path.join(__dirname, 'libs') + '/mongorestore.exe'
    } else {
        mongodump = path.join(__dirname, 'libs') + '/mongodump'
        mongorestore = path.join(__dirname, 'libs') + '/mongorestore'
    }
    return {
        mongodump: mongodump,
        mongorestore: mongorestore
    }
}
const getAllFiles = (dirPath, arrayOfFiles) => {
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, file))
        }
    })
    return arrayOfFiles
}
const unzipFile = (zipPath, destPath) => {
    fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: destPath }))
        .on('close', () => {
            console.log('Extraction complete!')
        })
}
const removeFolder = async (folderPath) => {
    const fs = require('fs')
    const path = require('path')
    try {
        const files = await fs.promises.readdir(folderPath)
        await Promise.all(files.map(async (file) => {
            const filePath = path.join(folderPath, file)
            const stat = await fs.promises.lstat(filePath)

            if (stat.isDirectory()) {
                await removeFolder(filePath)
            } else {
                await fs.promises.unlink(filePath)
            }
        }))
        await fs.promises.rmdir(folderPath)
        console.log('Folder removed successfully!')
    } catch (error) {
        console.error('Error while removing folder:', error)
    }
}


app.post('/db/list', async (req, res) => {
    try {
        client = new MongoClient(req.body.uriMongoDB, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        });
        const databasesList = await client.db().admin().listDatabases();
        databasesList.databases.map(db => {
            let sizeOnDisk = db.sizeOnDisk
            db.sizeOnDisk = __.convertBytesToMegabytes(sizeOnDisk)
        })
        res.json({
            status: 'success',
            data: databasesList.databases
        })
    } catch (e) {
        res.json({
            status: 'error',
            message: e.message
        })
    }
})
app.post('/db/backup', async (req, res) => {
    const dbname = req.body.dbname
    let pathSave = path.join(__dirname, 'dbs') + '/' + dbname
    const filename = __.convertTimeToDateTime(__.getTime())
        .replace(/\//g, '_')
        .replace(/ /g, '_')
        .replace(/\:/g, '_')
    let backupPath = pathSave + '/' + filename
    //run backup
    let mongodump = getMongoPath().mongodump
    execSync(`"${mongodump}" --host=127.0.0.1 --port=27017 --db=${dbname} --out="${backupPath}"`)

    //zip folder
    zipFolder(backupPath, `${pathSave}/${filename}.zip`)
        .then(() => {
            fs.rmSync(backupPath, { recursive: true })
            console.log('Folder zipped successfully!')
            res.json({
                status: 'success',
                message: 'Backup successfully!'
            })
            return
        })
        .catch(err => console.error('Error while zipping folder:', err))



})
app.post('/db/files-backup', async (req, res) => {
    const dbname = req.body.dbname
    const pathDBs = path.join(__dirname, 'dbs')
    let folderDB = pathDBs + '/' + dbname
    try {
        let files = getAllFiles(folderDB).map(item => {
            let stat = fs.statSync(item)
            let at_time = __.convertTimeToDateTime(stat.mtimeMs)
            const link = item.replace(pathDBs, '/dbs').replace(/\\/g, '/')
            return {
                filename: link.split('/').reverse()[0],
                link: link,
                size: __.convertBytesToMegabytes(stat.size),
                time: at_time
            }
        })
        files = _.orderBy(files, 'time').reverse()
        res.json({
            status: 'success',
            data: files
        })
    } catch (e) {
        res.json({
            status: 'error',
            message: e.message,
        })
    }
})
app.post('/db/delete', (req, res) => {
    const link = req.body.link
    const pathDBs = path.join(__dirname, 'dbs')
    const pathFile = (pathDBs + link).replace(/\\/g, '/').replace('/dbs/dbs/', '/dbs/')
    console.log(pathFile)
    try {
        fs.unlinkSync(pathFile)
        res.json({
            status: 'success',
            message: 'Delete successfully!'
        })
    } catch (e) {
        res.json({
            status: 'error',
            message: e.message
        })
    }
})
app.post('/db/restore', async (req, res) => {
    const { dbname, link } = req.body
    const pathDBs = path.join(__dirname, 'dbs')

    const pathRestoreIn = (pathDBs + link).replace(/\\/g, '/').replace('/dbs/dbs/', '/dbs/')
    const pathRestoreOut = `${pathDBs}/${dbname}`.replace(/\\/g, '/')

    setTimeout(function () {
        //unzip
        unzipFile(pathRestoreIn, pathRestoreOut)
        setTimeout(function () {
            //run backup for windonw
            let mongorestore = getMongoPath().mongorestore
            execSync(`"${mongorestore}" --host=127.0.0.1 --port=27017 --db ${dbname} --drop "${pathRestoreOut}/${dbname}"`)
            setTimeout(function () {
                //remove folder unzip
                removeFolder(`${pathRestoreOut}/${dbname}`)

                res.json({
                    status: 'success',
                    message: 'Restore successfully!'
                })
            }, 200)
        }, 200)
    }, 200)

})

module.exports = app