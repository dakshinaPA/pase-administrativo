import { UsuarioDB } from "@api/db/usuarios"
import { RespuestaController } from "@api/utils/response"
import { Usuario, LoginUsuario } from "@api/models/usuarios.model"

class UsuariosServices {
  static async login(dataUsuario: LoginUsuario) {
    const { data, error } = await UsuarioDB.login(dataUsuario)

    if (error) {
      return RespuestaController.fallida(
        500,
        "Error al acceder a la base de datos",
        data
      )
    }

    // encontró match con usuario
    if (data.length > 0) {
      // const res = await this.loggear( usuario.id_usuario )
      return RespuestaController.exitosa(200, "Usuario encontrado", data)
    }

    // no hubo error pero no hay match con usuario
    return RespuestaController.fallida(
      200,
      "Usuario o contraseña no válidos",
      null
    )
  }

  // static async loggear( id: number ){

  //     const res = await UsuarioDB.loggear( id )
  //     console.log( `usuario loggeado ${!res.error}` )
  //     return res
  // }

  static async obtener(id?: number) {
    const res = await UsuarioDB.obtener(id)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener usuarios",
        res.data
      )
    }

    const usuariosDB = res.data as Usuario[]
    const usuariosHidratadas: Usuario[] = usuariosDB.map((usuario: Usuario) => {
      let rol: string

      switch (Number(usuario.id_rol)) {
        case 1:
          rol = "Super Usuario"
          break
        case 2:
          rol = "Administrador"
          break
        case 3:
          rol = "Coparte"
          break
      }

      return { ...usuario, rol }
    })
    return RespuestaController.exitosa(
      200,
      "Consulta exitosa",
      usuariosHidratadas
    )
  }

  static async crear(data: Usuario) {
    const res = await UsuarioDB.crear(data)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear usuario",
        res.data
      )
    }
    return RespuestaController.exitosa(
      201,
      "Usuario creado con éxito",
      res.data
    )
  }

  static async actualizar(id: number, data: Usuario) {
    const res = await UsuarioDB.actualizar(id, data)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar usuario",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Usuario actualizado con éxito",
      res.data
    )
  }

  static async borrar(id: number) {
    const res = await UsuarioDB.borrar(id)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar usuario",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Usuairo borrado con éxito",
      res.data
    )
  }
}

export { UsuariosServices }
