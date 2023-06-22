import { RespuestaController } from "@api/utils/response"
import { CatalogosDB } from "@api/db/catalogos"
// import { PaisDB } from "@api/models/catalogos.model"
// import { epochAFecha } from "@assets/utils/common"

class CatalogosServices {
  static async obtenerTodos() {
    try {
      const paises = CatalogosDB.obtenerPaises()
      const estados = CatalogosDB.obtenerEstados()
      const temas_sociales = CatalogosDB.obtenerTemasSociales()
      const rubros_presupuestales = CatalogosDB.obtenerRubrosPresupuestales()
      const bancos = CatalogosDB.obtenerBancos()

      const resCombinadas = await Promise.all([
        paises,
        estados,
        temas_sociales,
        rubros_presupuestales,
        bancos,
      ])

      for (const rc of resCombinadas) {
        if(rc.error) throw rc.data
      }

      const catalogos = {
        paises: resCombinadas[0].data,
        estados: resCombinadas[1].data,
        temas_sociales: resCombinadas[2].data,
        rubros_presupuestales: resCombinadas[3].data,
        bancos: resCombinadas[4].data
      }

      return RespuestaController.exitosa(200, "Catálogos obtenidos con éxito", catalogos)
    } catch (error) {
      return RespuestaController.fallida(400, "Error al obtener catálogos", error)
    }
  }

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

  static async obtenerTemasSociales() {
    const { error, data } = await CatalogosDB.obtenerTemasSociales()

    if (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener temas sociales",
        data
      )
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", data)
  }

  static async obtenerRubrosPresupuestales() {
    const { error, data } = await CatalogosDB.obtenerRubrosPresupuestales()

    if (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener rubros presupuestales",
        data
      )
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", data)
  }

  static async obtenerBancos() {
    const { error, data } = await CatalogosDB.obtenerBancos()

    if (error) {
      return RespuestaController.fallida(400, "Error al obtener bancos", data)
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", data)
  }
}

export { CatalogosServices }
