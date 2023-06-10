import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"

class CatalogosDB {
  static async obtenerPaises() {
    let query = `SELECT id, nombre FROM paises WHERE b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerEstados() {
    let query = `SELECT id, nombre FROM estados`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CatalogosDB }
