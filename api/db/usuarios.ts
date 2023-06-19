import { queryDB, queryDBPlaceHolder } from "./query"
import { Usuario } from "@models/usuario.model"
import { LoginUsuario } from "@api/models/usuario.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

class UsuarioDB {
  static async login({ email, password }: LoginUsuario) {
    const query = `SELECT id, nombre, apellido_paterno, apellido_materno, id_rol
      FROM usuarios WHERE email=? AND password=? AND b_activo=1`
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
  static async obtenerVmin(id_rol: number) {
    let query = `SELECT id, nombre, apellido_paterno, apellido_materno
      FROM usuarios WHERE id_rol=${id_rol} AND b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(id_rol: number, id_coparte: number, id_usuario: number) {
    let query = `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.telefono, u.password, u.id_rol,
      r.nombre rol,
      cu.b_enlace
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id
      LEFT JOIN coparte_usuarios cu ON u.id = cu.id_usuario
      WHERE u.b_activo=1`

    if (id_usuario) {
      query += ` AND u.id=${id_usuario} LIMIT 1`
    }

    if (id_rol) {
      query += ` AND u.id_rol=${id_rol}`
    }

    if (id_coparte) {
      query += ` AND cu.id_coparte=${id_coparte}`
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

    const query = `INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno,
    email, telefono, password, id_rol, dt_registro ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

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
    } = data

    const query = `UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=?, password=? WHERE id=? LIMIT 1`
    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      telefono,
      password,
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

  static async obtenerCoparteCoparte(id: number) {
    let query = `SELECT cu.id, cu.id_coparte, c.nombre, cu.cargo, cu.b_enlace
    FROM coparte_usuarios cu JOIN copartes c ON cu.id_coparte = c.id
    WHERE id_usuario=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerCopartesAdministrador(id_administrador: number) {
    let query = `SELECT id id_coparte, nombre FROM copartes WHERE id_administrador = ${id_administrador}`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { UsuarioDB }
