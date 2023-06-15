import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Coparte,
  EnlaceCoparte,
  DireccionCoparte,
  CoparteUsuario,
} from "@models/coparte.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class CoparteDB {
  static async obtenerVmin() {
    let query = `SELECT id, nombre FROM copartes WHERE b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(id: number) {
    let query = `
      SELECT c.id, c.id_administrador, c.id_alt, c.nombre, c.i_estatus_legal, c.representante_legal, c.rfc, c.id_tema_social, c.dt_registro,
      cd.id id_coparte_direccion, cd.calle, cd.numero_ext, cd.numero_int, cd.colonia, cd.municipio, cd.cp, cd.id_estado,
      CONCAT(u.nombre, ' ', u.apellido_paterno) nombre_administrador,
      ts.nombre tema_social,
      e.nombre estado
      FROM copartes c
      JOIN coparte_direccion cd ON c.id = cd.id_coparte
      JOIN usuarios u ON c.id_administrador = u.id
      JOIN temas_sociales ts ON c.id_tema_social = ts.id
      JOIN estados e ON cd.id_estado = e.id
      WHERE c.b_activo=1`

    if (id) {
      query += ` AND c.id=${id} LIMIT 1`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Coparte) {
    const {
      administrador,
      id_alt,
      nombre,
      i_estatus_legal,
      representante_legal,
      rfc,
      id_tema_social,
    } = data

    const query = `INSERT INTO copartes ( id_administrador, id_alt, nombre, i_estatus_legal,
      representante_legal, rfc, id_tema_social, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      administrador.id,
      id_alt,
      nombre,
      i_estatus_legal,
      representante_legal,
      rfc,
      id_tema_social,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id_coparte: number, data: Coparte) {
    const {
      administrador,
      id_alt,
      nombre,
      i_estatus_legal,
      representante_legal,
      rfc,
      id_tema_social,
    } = data

    const query = `UPDATE copartes SET id_administrador=?, id_alt=?, nombre=?,
      i_estatus_legal=?, representante_legal=?, rfc=?, id_tema_social=? WHERE id=? LIMIT 1`

    const placeHolders = [
      administrador.id,
      id_alt,
      nombre,
      i_estatus_legal,
      representante_legal,
      rfc,
      id_tema_social,
      id_coparte,
    ]

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

  static async obtenerUsuarios(id_coparte: number) {
    let query = `SELECT cu.id, cu.id_usuario, cu.cargo, cu.b_enlace,
      u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.telefono
      FROM coparte_usuarios cu
      JOIN usuarios u ON cu.id_usuario = u.id
      WHERE cu.id_coparte = ${id_coparte} AND u.b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearUsuario(
    id_coparte: number,
    id_usuario: number,
    cargo: string,
    b_enlace: boolean
  ) {
    const query = `INSERT INTO coparte_usuarios ( id_coparte, id_usuario,
      cargo, b_enlace ) VALUES ( ?, ?, ?, ? )`

    const placeHolders = [id_coparte, id_usuario, cargo, Number(b_enlace)]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarUsuario(data: CoparteUsuario) {
    const { id, cargo, b_enlace } = data

    const query = `UPDATE coparte_usuarios SET cargo=? WHERE id=? LIMIT 1`

    const placeHolders = [cargo, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearDireccion(id_coparte: number, data: DireccionCoparte) {
    const { calle, numero_ext, numero_int, colonia, municipio, cp, id_estado } =
      data

    const query = `INSERT INTO coparte_direccion ( id_coparte, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_coparte,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarDireccion(data: DireccionCoparte) {
    const {
      id,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
    } = data

    const query = `UPDATE coparte_direccion SET calle=?, numero_ext=?, numero_int=?,
    colonia=?, municipio=?, cp=?, id_estado=? WHERE id=? LIMIT 1`

    const placeHolders = [
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearEnlace(data: EnlaceCoparte) {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
    } = data

    const query = `INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno, email,
      telefono, password, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async limpiarEnlace(id_coparte: number) {
    const query = `UPDATE coparte_usuarios SET b_enlace=0 WHERE id_coparte=?`

    const placeHolders = [id_coparte]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarEnlace(id_usuario: number) {
    const query = `UPDATE coparte_usuarios SET b_enlace=1 WHERE id_usuario=? LIMIT 1`

    const placeHolders = [id_usuario]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CoparteDB }
