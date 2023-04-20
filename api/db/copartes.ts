import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { Coparte } from "@api/models/copartes.model"

class CoparteDB {
  static async obtener(id: number) {
    let query =
      "SELECT id, nombre, vc_id, i_tipo FROM `copartes` WHERE b_activo=1"

    if (id) {
      query += ` AND id=${id} LIMIT 1`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Coparte) {
    const { nombre, vc_id, i_tipo } = data

    const query = `INSERT INTO copartes ( nombre, vc_id, i_tipo ) VALUES ( ?, ?, ? )`
    const placeHolders = [nombre, vc_id, i_tipo]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id: number, data: Coparte) {
    const { nombre, vc_id, i_tipo } = data

    const query = `UPDATE copartes SET nombre=?, vc_id=?, i_tipo=? WHERE id=? LIMIT 1`
    const placeHolders = [nombre, vc_id, i_tipo, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE copartes SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CoparteDB }
