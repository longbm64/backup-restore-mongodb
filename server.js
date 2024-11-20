require('dotenv').config()
const tools = require('./tools')
const app = require('./app')
const PORT = process.env.PORT || 3008
const os = require('os')
let icore = os.cpus().length - 1
icore = icore <= 0 ? 1 : icore
process.env.UV_THREADPOOL_SIZE = icore

app.listen(PORT, () => {
    console.log(`Hello, Server is running at ${PORT}, ${tools.time_to_datetime(new Date().getTime(), true)}`)
})

