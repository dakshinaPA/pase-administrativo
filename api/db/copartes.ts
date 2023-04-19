import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { Coparte } from "@api/models/copartes.model"

class CoparteDB {
  static async obtener(id: number) {
    let query =
      "SELECT id_coparte, nombre, id, id_tipo FROM `copartes` WHERE b_activo=1"

    if (id) {
      query += ` AND id_coparte=${id} LIMIT 1`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Coparte) {
    const { nombre, id, id_tipo } = data

    const query = `INSERT INTO copartes ( nombre, id, id_tipo ) VALUES ( ?, ?, ? )`
    const placeHolders = [nombre, id, id_tipo]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id_coparte: number, data: Coparte) {
    const { nombre, id, id_tipo } = data

    const query = `UPDATE copartes SET nombre=?, id=?, id_tipo=? WHERE id_coparte=? LIMIT 1`
    const placeHolders = [nombre, id, id_tipo, id_coparte]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE copartes SET b_activo=0 WHERE id_coparte=${id} LIMIT 1`
    
    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CoparteDB }
