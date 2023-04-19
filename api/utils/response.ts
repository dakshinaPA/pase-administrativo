import { ResController, ResDB } from "@api/models/respuestas.model"
import { ResultsDB } from "@api/models/respuestas.model"

class RespuestaDB {
  static exitosa(data: ResultsDB): ResDB {
    return {
      data: Array.isArray(data) ? data : [data],
      error: false,
    }
  }

  static fallida(data: ResultsDB): ResDB {
    return {
      data: [data],
      error: true,
    }
  }
}

class RespuestaController {
  static exitosa(
    status: number,
    mensaje: string,
    data: object[]
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
    data: object[]
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
