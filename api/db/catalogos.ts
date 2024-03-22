import { RespuestaDB } from "@api/utils/response"
import { queryDB } from "./query"

class CatalogosDB {
  static async obtenerTodos() {
    const queries = [
      "SELECT id, nombre FROM paises WHERE b_activo=1",
      "SELECT id, nombre FROM estados",
      "SELECT id, nombre FROM temas_sociales WHERE b_activo=1",
      "SELECT id, nombre, descripcion, importante FROM rubros_presupuestales WHERE b_activo=1 ORDER BY nombre",
      "SELECT id, nombre, clave FROM bancos WHERE b_activo=1 ORDER BY nombre",
      "SELECT id, clave, nombre FROM formas_pago",
      "SELECT id, clave, nombre FROM regimenes_fiscales",
    ]

    const query = queries.join(";")

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

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
    let query = `SELECT id, nombre, descripcion, importante FROM rubros_presupuestales WHERE b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerBancos() {
    let query = `SELECT id, nombre, clave FROM bancos WHERE b_activo=1 ORDER BY nombre`

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
