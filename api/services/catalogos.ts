import { RespuestaController } from "@api/utils/response"
import { CatalogosDB } from "@api/db/catalogos"

class CatalogosServices {
  static async obtenerTodos() {
    try {
      const reCatalogos = await CatalogosDB.obtenerTodos()
      if (reCatalogos.error) throw reCatalogos.data

      const catalogosDB = reCatalogos.data

      const catalogos = {
        paises: catalogosDB[0],
        estados: catalogosDB[1],
        temas_sociales: catalogosDB[2],
        rubros_presupuestales: catalogosDB[3],
        bancos: catalogosDB[4],
        formas_pago: catalogosDB[5],
        regimenes_fiscales: catalogosDB[6],
      }

      return RespuestaController.exitosa(
        200,
        "Catálogos obtenidos con éxito",
        catalogos
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener catálogos",
        error
      )
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
