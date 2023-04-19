import { connectionDB } from "./connection"
// import { RespuestaDB } from "@api/utils/response"
import { ResultsDB } from "@api/models/respuestas.model"

const queryDB = (query: string): Promise<ResultsDB> => {
  return new Promise((resolve, reject) => {
    connectionDB.query(query, (err, results, fields) => {
      if (err) reject(err)
      resolve(results)
    })
  })
}

const queryDBPlaceHolder = (
  query: string,
  placeHolders: Array<string | number>
): Promise<ResultsDB> => {
  return new Promise((resolve, reject) => {
    connectionDB.query(query, placeHolders, (err, results, fields) => {
      if (err) reject(err)
      resolve(results)
    })
  })
}

export { queryDB, queryDBPlaceHolder }
