import { UsuarioDB } from "@api/db/usuarios"
import { RespuestaController } from "@api/utils/response"
import { LoginUsuario, ResUsuarioDB } from "@api/models/usuario.model"
import { Usuario, QueriesUsuario, UsuarioMin } from "@models/usuario.model"

class UsuariosServices {
  static async login(dataUsuario: LoginUsuario) {
    try {
      const { data, error } = await UsuarioDB.login(dataUsuario)
      if (error) throw data

      const [usuario] = data as ResUsuarioDB[]
      // encontró match con usuario
      if (usuario) {
        return RespuestaController.exitosa(200, "Usuario encontrado", [usuario])
      } else {
        // no hubo error pero no hay match con usuario
        return RespuestaController.fallida(
          400,
          "Usuario o contraseña no válidos",
          null
        )
      }
    } catch (error) {
      return RespuestaController.fallida(400, "Error al hacer login", error)
    }
  }

  static trasnformarDataRe = (
    usuariosDB: ResUsuarioDB,
    password = false
  ): Usuario => {
    let dataUsuario: Usuario = {
      id: usuariosDB.id,
      nombre: usuariosDB.nombre,
      apellido_paterno: usuariosDB.apellido_paterno,
      apellido_materno: usuariosDB.apellido_materno,
      email: usuariosDB.email,
      telefono: usuariosDB.telefono,
      password: password ? usuariosDB.password : "",
      id_rol: usuariosDB.id_rol,
      rol: usuariosDB.rol,
    }

    if (usuariosDB.id_rol == 3) {
      dataUsuario = {
        ...dataUsuario,
        coparte: {
          id: usuariosDB.id_coparte_usuario,
          id_coparte: usuariosDB.id_coparte,
          coparte: usuariosDB.coparte,
          cargo: usuariosDB.cargo,
          b_enlace: Boolean(usuariosDB.b_enlace),
        },
      }
    }

    return dataUsuario
  }

  static async obtener(queries: QueriesUsuario) {
    const id_usuario = Number(queries.id)
    const min = Boolean(queries.min)
    try {
      const re = await UsuarioDB.obtener(queries)
      const usuariosDB = re as ResUsuarioDB[]

      let usuarios: Usuario[] | UsuarioMin[]

      if (min) {
        usuarios = usuariosDB as UsuarioMin[]
      } else {
        usuarios = usuariosDB.map((usuario) =>
          this.trasnformarDataRe(usuario, Boolean(id_usuario))
        )
      }

      return RespuestaController.exitosa(200, "Consulta exitosa", usuarios)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener datos de usuario",
        error
      )
    }
  }

  static async crear(data: Usuario) {
    try {
      const cr = await UsuarioDB.crear(data)

      return RespuestaController.exitosa(201, "Usuario creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear usuario", error)
    }
  }

  static async actualizar(id_usuario: number, data: Usuario) {
    try {
      const upUsuario = await UsuarioDB.actualizar(id_usuario, data)

      return RespuestaController.exitosa(
        200,
        "Usuario actualizado con éxito",
        upUsuario
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar usuario",
        error
      )
    }
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
    return RespuestaController.exitosa(200, "Usuairo borrado con éxito", null)
  }
}

export { UsuariosServices }
