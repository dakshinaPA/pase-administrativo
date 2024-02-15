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

  static async fallida(
    status: number,
    mensaje: string,
    data: any
  ): Promise<ResController> {
    // enviar errores de sql
    if(data.sql){
      await enviarMail(JSON.stringify(data))
    }
    return {
      status,
      mensaje,
      error: true,
      data,
    }
  }
}

export { RespuestaDB, RespuestaController }
