import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Financiador,
  EnlaceFinanciador,
  DireccionFinanciador,
  NotaFinanciador,
} from "@models/financiador.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class FinanciadorDB {
  static async obtenerVminimalista() {
    let query = `SELECT id, nombre from financiadores`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(id: number) {
    let query = `SELECT f.id, f.id_alt, f.nombre, f.representante_legal, f.pagina_web, f.rfc, f.actividad, f.i_tipo, f.dt_constitucion, f.dt_registro,
      fe.id id_enlace, fe.nombre nombre_enlace, fe.apellido_paterno, fe.apellido_materno, fe.email, fe.telefono,
      fd.id id_direccion, fd.calle, fd.numero_ext, fd.numero_int, fd.colonia, fd.municipio, fd.cp, fd.id_estado, fd.estado, fd.id_pais,
      p.nombre pais
      FROM financiadores f
      JOIN financiador_enlace fe ON f.id = fe.id_financiador
      JOIN financiador_direccion fd ON f.id = fd.id_financiador
      JOIN paises p ON fd.id_pais = p.id
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
    const {
      id_alt,
      nombre,
      representante_legal,
      pagina_web,
      rfc,
      actividad,
      i_tipo,
      dt_constitucion,
    } = data

    const query = `INSERT INTO financiadores ( id_alt, nombre, representante_legal, pagina_web,
      rfc, actividad, i_tipo, dt_constitucion, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_alt,
      nombre,
      representante_legal,
      pagina_web,
      rfc,
      actividad,
      i_tipo,
      dt_constitucion,
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
    const {
      id_alt,
      nombre,
      representante_legal,
      pagina_web,
      rfc,
      actividad,
      i_tipo,
      dt_constitucion,
    } = data

    const query = `UPDATE financiadores SET id_alt=?, nombre=?, representante_legal=?,
      pagina_web=?, rfc=?, actividad=?, i_tipo=?, dt_constitucion=? WHERE id=? LIMIT 1`

    const placeHolders = [
      id_alt,
      nombre,
      representante_legal,
      pagina_web,
      rfc,
      actividad,
      i_tipo,
      dt_constitucion,
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

  static async crearNota(id_financiador: number, data: NotaFinanciador) {
    const { id_usuario, mensaje } = data

    const query = `INSERT INTO financiador_notas ( id_financiador, id_usuario,
      mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`

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

    const query = `INSERT INTO financiador_enlace ( id_financiador, nombre, apellido_paterno,
      apellido_materno, email, telefono ) VALUES ( ?, ?, ?, ?, ?, ? )`

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
    const query = `UPDATE financiador_enlace SET nombre=?, apellido_paterno=?,
      apellido_materno=?, email=?, telefono=? WHERE id=? LIMIT 1`

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

  static async crearDireccion(
    id_financiador: number,
    data: DireccionFinanciador
  ) {
    const {
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      estado,
      id_pais,
    } = data

    const query = `INSERT INTO financiador_direccion ( id_financiador, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado, estado, id_pais ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_financiador,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      estado,
      id_pais,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarDireccion(data: DireccionFinanciador) {
    const {
      id,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      estado,
      id_pais,
    } = data

    const query = `UPDATE financiador_direccion SET calle=?, numero_ext=?,
    numero_int=?, colonia=?, municipio=?, cp=?, id_estado=?, estado=?, id_pais=? WHERE id=? LIMIT 1`

    const placeHolders = [
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      estado,
      id_pais,
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
