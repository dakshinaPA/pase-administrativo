import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { Usuario, LoginUsuario } from "@api/models/usuarios.model"

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

  static async obtener(id?: number) {
    let query =
      "SELECT id, nombre, apellido_paterno, apellido_materno, email, email2, i_rol, password FROM `usuarios` WHERE b_activo=1"

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

  static async crear(data: Usuario) {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      email2,
      i_rol,
      password,
    } = data

    const query =
      "INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno, email, email2, i_rol, password ) VALUES (?, ?, ?, ?, ?, ?, ?)"
    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      email2,
      i_rol,
      password,
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
      email2,
      i_rol,
      password,
    } = data

    const query = `UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, email2=?, i_rol=?, password=? WHERE id=? LIMIT 1`
    const placeHolders = [
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      email2,
      i_rol,
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
}

export { UsuarioDB }
