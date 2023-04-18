import { ResController, ResDB } from "@api/models/respuestas.model"
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2"
import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query"

class RespuestaDB {
  static exitosa(
    data:
      | RowDataPacket[]
      | RowDataPacket[][]
      | OkPacket
      | OkPacket[]
      | ResultSetHeader
  ): ResDB {
    return {
      data,
      error: false,
    }
  }

  static fallida(data: Query.QueryError): ResDB {
    return {
      data,
      error: true,
    }
  }
}

class RespuestaController {
  static exitosa(
    status: number,
    mensaje: string,
    data: [] | object
  ): ResController {
    return {
      status,
      mensaje,
      error: false,
      data,
    }
  }

  static fallida(
    status: number,
    mensaje: string,
    data: [] | object
  ): ResController {
    return {
      status,
      mensaje,
      error: true,
      data,
    }
  }
}

export { RespuestaDB, RespuestaController }
