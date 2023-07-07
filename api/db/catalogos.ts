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

  static async obtenerTemasSociales() {
    let query = `SELECT id, nombre FROM temas_sociales WHERE b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerRubrosPresupuestales() {
    let query = `SELECT id, nombre FROM rubros_presupuestales WHERE b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerBancos() {
    let query = `SELECT id, nombre FROM bancos WHERE b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerFormasPago() {
    let query = `SELECT id, clave, nombre FROM formas_pago`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerRegimenesFiscales() {
    let query = `SELECT id, clave, nombre FROM regimenes_fiscales`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CatalogosDB }
