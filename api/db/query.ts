import { connectionDB } from './connection'
import { RespuestaDB } from '@api/utils/response'
import { ResDB } from '@api/models/respuestas.model'

const queryDB = ( query: string ): Promise<ResDB> => {
    return new Promise((resolve, reject) => {
        connectionDB.query( query, (err, results, fields) => {
            if(err) reject(RespuestaDB.fallida(err))
            resolve(RespuestaDB.exitosa(results as []))
        })
    })
}

export { queryDB }