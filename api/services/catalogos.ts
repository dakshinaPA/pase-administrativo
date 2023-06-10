import { RespuestaController } from "@api/utils/response"
import { CatalogosDB } from "@api/db/catalogos"
import { PaisDB } from "@api/models/catalogos.model"
import { epochAFecha } from "@assets/utils/common"

class CatalogosServices {
  static async obtenerPaises() {
    const { error, data } = await CatalogosDB.obtenerPaises()

    if (error) {
      return RespuestaController.fallida(400, "Error al obtener países", data)
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", data)
  }

  static async obtenerEstados() {
    const { error, data } = await CatalogosDB.obtenerEstados()

    if (error) {
      return RespuestaController.fallida(400, "Error al obtener estados", data)
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", data)
  }
}

export { CatalogosServices }
