import { ResController, ResDB } from "@api/models/respuestas.model"
import { ResultsDB } from "@api/models/respuestas.model"
import { enviarMail } from "./sendMails"

class RespuestaDB {
  static exitosa(data: ResultsDB): ResDB {
    return {
      data,
      error: false,
    }
  }

  static fallida(data: ResultsDB): ResDB {
    return {
      data,
      error: true,
    }
  }
}

class RespuestaController {
  static exitosa(status: number, mensaje: string, data: any): ResController {
    return {
      status,
      mensaje,
      error: false,
      data,
    }
  }

  static fallida(status: number, mensaje: string, data: any): ResController {
    enviarMail(JSON.stringify(data))

    return {
      status,
      mensaje,
      error: true,
      data,
    }
  }
}

export { RespuestaDB, RespuestaController }
