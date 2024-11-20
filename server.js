require('dotenv').config()
const __ = require('lbm-helpers')
const app = require('./app')
const PORT = process.env.PORT || 3008
const os = require('os')
let icore = os.cpus().length - 1
icore = icore <= 0 ? 1 : icore
process.env.UV_THREADPOOL_SIZE = icore

app.listen(PORT, () => {
    console.log(`Hello, Server is running at ${PORT}, ${__.getNowDateTime()}`)
})

