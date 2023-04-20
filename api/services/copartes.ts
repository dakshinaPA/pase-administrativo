import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { Coparte } from "@api/models/copartes.model"

class CopartesServices {
  static async obtener(id?: number) {
    const res = await CoparteDB.obtener(id)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener copartes",
        res.data
      )
    }

    const copartesDB = res.data as Coparte[]
    const copartesHidratadas: Coparte[] = copartesDB.map((cop) => {
      let tipo: string

      switch (Number(cop.i_tipo)) {
        case 1:
          tipo = "Constituida"
          break
        case 2:
          tipo = "No constituida"
          break
      }

      return { ...cop, tipo }
    })
    return RespuestaController.exitosa(
      200,
      "Consulta exitosa",
      copartesHidratadas
    )
  }

  static async crear(data: Coparte) {
    const res = await CoparteDB.crear(data)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear coparte",
        res.data
      )
    }
    return RespuestaController.exitosa(
      201,
      "Coparte creada con éxito",
      res.data
    )
  }

  static async actualizar(id: number, data: Coparte) {
    const res = await CoparteDB.actualizar(id, data)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar coparte",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Coparte actualizada con éxito",
      res.data
    )
  }

  static async borrar(id: number) {
    const res = await CoparteDB.borrar(id)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar coparte",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Coparte borrada con éxito",
      res.data
    )
  }
}

export { CopartesServices }
