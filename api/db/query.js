const { connectionDB } = require('./connection')

const queryDB = ( query ) => {
    return new Promise((resolve, reject) => {
        connectionDB.query( query, (err, results, fields) => {
            if(err) reject(err)
            resolve(results)
        })
    })
}

export { queryDB }