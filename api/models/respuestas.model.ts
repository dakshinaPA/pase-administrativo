import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2"
import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query"

export interface ResController {
  status: number
  mensaje: string
  error: boolean
  data: object[]
}

export interface ResDB {
  error: boolean
  data: object[]
}

export type ResultsDB =
  | Query.QueryError
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader
