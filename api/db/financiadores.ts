import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Financiador,
  EnlaceFinanciador,
  NotaFinanciador,
} from "@models/financiador.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class FinanciadorDB {
  static async obtener(id: number) {
    let query = `SELECT f.id, f.nombre, f.id_pais, f.representante_legal, f.pagina_web, f.i_tipo, f.dt_registro, 
    fe.id id_enlace, fe.nombre nombre_enlace, fe.apellido_paterno, fe.apellido_materno, fe.email, fe.telefono 
    FROM financiadores f 
    INNER JOIN financiador_enlace fe ON f.id = fe.id_financiador 
    WHERE f.b_activo=1`

    if (id) {
      query += ` AND f.id=${id} LIMIT 1`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Financiador) {
    const { nombre, id_pais, representante_legal, pagina_web, i_tipo } = data

    const query = `INSERT INTO financiadores ( nombre, id_pais, representante_legal, pagina_web, i_tipo, dt_registro) VALUES ( ?, ?, ?, ?, ?, ? )`
    const placeHolders = [
      nombre,
      id_pais,
      representante_legal,
      pagina_web,
      i_tipo,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id: number, data: Financiador) {
    const { nombre, id_pais, representante_legal, pagina_web, i_tipo } = data
    const query = `UPDATE financiadores SET nombre=?, id_pais=?, representante_legal=?, pagina_web=?, i_tipo=? WHERE id=? LIMIT 1`
    const placeHolders = [
      nombre,
      id_pais,
      representante_legal,
      pagina_web,
      i_tipo,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE financiadores SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerNotas(idFinanciador: number) {
    let query = `SELECT fn.id, fn.mensaje, fn.dt_registro,
    CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
    FROM financiador_notas fn JOIN usuarios u ON fn.id_usuario = u.id
    WHERE fn.id_financiador=${idFinanciador} AND fn.b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearNota(data: NotaFinanciador) {
    const { id_financiador, id_usuario, mensaje } = data

    const query = `INSERT INTO financiador_notas ( id_financiador, id_usuario, mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`
    const placeHolders = [
      id_financiador,
      id_usuario,
      mensaje,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearEnlace(idFinanciador: number, data: EnlaceFinanciador) {
    const { nombre, apellido_paterno, apellido_materno, email, telefono } = data

    const query = `INSERT INTO financiador_enlace ( id_financiador, nombre, apellido_paterno, apellido_materno, email, telefono ) VALUES ( ?, ?, ?, ?, ?, ? )`
    const placeHolders = [
      idFinanciador,
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarEnlace(data: EnlaceFinanciador) {
    const { id, nombre, apellido_paterno, apellido_materno, email, telefono } =
      data
    const query = `UPDATE financiador_enlace SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=? WHERE id=? LIMIT 1`
    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { FinanciadorDB }
