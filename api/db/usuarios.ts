import { queryDB, queryDBPlaceHolder } from "./query"
import { Usuario, UsuarioCoparte } from "@models/usuario.model"
import { LoginUsuario } from "@api/models/usuario.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

class UsuarioDB {
  static async login({ email, password }: LoginUsuario) {
    const query =
      "SELECT * FROM usuarios WHERE email=? AND password=? AND b_activo=1"
    const placeHolders = [email, password]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async loggear( idUsuario: number ) {

  //     const query = `UPDATE usuarios SET login=1 WHERE id_usuario=${idUsuario} LIMIT 1`

  //     try {
  //         const res = await queryDB( query )
  //         return RespuestaDB.exitosa( res )
  //     } catch (error) {
  //         return RespuestaDB.fallida( error )
  //     }
  // }

  static async obtener(id: number, id_rol: number) {
    let query = `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.telefono, u.id_rol,
    r.nombre rol
    FROM usuarios u JOIN roles r ON u.id_rol = r.id
    WHERE u.b_activo=1`

    if (id) {
      query += ` AND u.id=${id} LIMIT 1`
    }

    if (id_rol) {
      query += ` AND u.id_rol=${id_rol}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Usuario) {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
      rol,
    } = data

    const query =
      "INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno, email, telefono, password, id_rol, dt_registro ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
      rol.id,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id: number, data: Usuario) {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
      rol,
    } = data

    const query = `UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=?, password=?, id_rol=? WHERE id=? LIMIT 1`
    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
      rol.id,
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
    const query = `UPDATE usuarios SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerCopartes(id: number) {
    let query = `SELECT uc.id, uc.id_coparte, c.nombre
    FROM usuario_copartes uc JOIN copartes c on uc.id_coparte = c.id
    WHERE uc.id_usuario=${id} AND uc.b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearCoparte(id_usuario: number, id_coparte: number) {
    const query = `INSERT INTO usuario_copartes ( id_usuario, id_coparte ) VALUES (?, ?)`
    const placeHolders = [id_usuario, id_coparte]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async limpiarCopartes(idUsuario: number) {
    const query = `UPDATE usuario_copartes SET b_activo = 0 WHERE id_usuario = ${idUsuario} AND b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async reactivarCoparte(ids: number[]) {
    const phInterrogacion = ids.map( id => '?').join(',')
    const query = `UPDATE usuario_copartes SET b_activo = 1 WHERE id IN (${phInterrogacion})`
    const placeHolders = ids

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { UsuarioDB }
