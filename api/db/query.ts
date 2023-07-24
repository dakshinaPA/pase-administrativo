import { connectionDB } from "./connectionPool"
import { ResultsDB } from "@api/models/respuestas.model"

const queryDB = (query: string): Promise<ResultsDB> => {
  return new Promise((resolve, reject) => {
    connectionDB.getConnection((err, connection) => {
      if (err) reject(err)
      connection.query(query, (err, results, fields) => {
        connection.destroy()
        if (err) reject(err)
        resolve(results)
      })
    })
  })
}

const queryDBPlaceHolder = (
  query: string,
  placeHolders: Array<string | number>
): Promise<ResultsDB> => {
  return new Promise((resolve, reject) => {
    connectionDB.getConnection((err, connection) => {
      if (err) reject(err)
      connection.query(query, placeHolders, (err, results, fields) => {
        connection.destroy()
        if (err) reject(err)
        resolve(results)
      })
    })
  })
}

export { queryDB, queryDBPlaceHolder }
