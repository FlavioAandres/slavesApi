let express = require('express')
let bodyParser = require('body-parser')
let axios = require('axios')
let app = express();
const bcrypt = require('bcrypt');
const {
    port,
    masterPort,
    slavePort,
} = process.env

/**
 * 3251 Hashes 
 * Sync: 3.75 minutos
 * Async: 6.513 segundos
 */

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const splitNumberByLimit = (limit, current, array = []) => {
    if (current > limit) {
        const less = current - limit
        array.push(limit)
        return splitNumberByLimit(limit, less, array)
    } else {
        array.push(current)
        return array
    }
}

const callslavesAPI = batches => batches.map(batch => (axios.get(`http://localhost:${slavePort}/recieveData/dinamic/process/${batch}`)))

app.get('/recieveData/dinamic/process/:lines', async (req, res) => {
    console.log('started in port ' + port)
    let numberOfLines = req.params.lines
    const limit = 1000

    console.time('SyncProcess' + port)
    try {
        const AllObjects = []
        let asyncPromises = []
        //Delegating responsabilities to slaves api
        if (numberOfLines > limit && port == masterPort) {
            const arrayNumbers = splitNumberByLimit(limit, numberOfLines)
            asyncPromises = callslavesAPI(arrayNumbers)
        }

        //executing number limit or less 
        for (let index = 0; index < numberOfLines; index++) {
            //Heavy async here! 
            //code...
            const pass = bcrypt.hashSync('textToHasg' + port + index, 1)
            const objectToPush = { index, port, pass }
            AllObjects.push(objectToPush)
        }

        //Waiting anothers APIs responses  
        if (asyncPromises.length > 0) {
            console.log('waiting promises')
            let result = await Promise.all(asyncPromises)
            result.forEach(result => AllObjects.push(...result.data.objects))
            console.timeEnd('SyncProcess' + port)
            //Returning data when all was recivied
            return res.send({ objects: AllObjects })
        }
        console.timeEnd('SyncProcess' + port)

        //return when is limit or less
        return res.send({ objects: AllObjects })
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
})

//Sync process 
app.get('/recieveData/sync/:lines', async (req, res) => {
    console.log('started with ' + port)
    let numberOfLines = req.params.lines
    const AllObjects = []
    console.time('SyncProcess')
    for (let index = 0; index < numberOfLines; index++) {
        const pass = bcrypt.hashSync('textToHasg' + port + index, 10)
        const objectToPush = { index, port, pass }
        AllObjects.push(objectToPush)
    }
    console.timeEnd('SyncProcess')
    return res.send({ objects: AllObjects })
})

app.listen(port, () => console.info(`server started on port ${port}`))