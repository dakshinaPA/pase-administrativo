import { UsuarioDB } from "@api/db/usuarios"
import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { LoginUsuario, ResUsuarioDB } from "@api/models/usuario.model"
import { Usuario, UsuarioCoparte } from "@models/usuario.model"

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

    const [usuario] = data as Usuario[]

    // encontró match con usuario
    if (usuario) {
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

  static async obtener(id_usuario: number, id_rol: number) {
    try {
      const resUsuariosDB = await UsuarioDB.obtener(id_usuario, id_rol)
      if (resUsuariosDB.error) throw resUsuariosDB.data

      const usuariosDB = resUsuariosDB.data as ResUsuarioDB[]

      const datatransfromada: Usuario[] = await Promise.all(
        usuariosDB.map(async (usuario) => {
          const {
            id,
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
            id_rol,
            rol,
          } = usuario

          let copartes: UsuarioCoparte[] = null

          if (id_usuario && id_rol !== 1) {
            const obtenerCoUs =
              id_rol === 3
                ? await UsuarioDB.obtenerCoparteCoparte(id_usuario)
                : await UsuarioDB.obtenerCopartesAdministrador(id_usuario)

            if (obtenerCoUs.error) throw obtenerCoUs.data

            const copartesCoUS = obtenerCoUs.data as UsuarioCoparte[]

            copartes =
              id_rol === 3
                ? copartesCoUS.map((cop) => ({
                    ...cop,
                    b_enlace: Boolean(cop.b_enlace),
                  }))
                : copartesCoUS
          }

          return {
            id,
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
            rol: {
              id: id_rol,
              nombre: rol,
            },
            copartes,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        datatransfromada
      )
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
      const crear = await UsuarioDB.crear(data)
      if (crear.error) throw crear.data

      // @ts-ignore
      const idInsertado = crear.data.insertId
      const id_rol = data.rol.id
      let idInsertadoCoparteUsuario = 0
      // registrar en tabla coparte_usuarios
      if (id_rol == 3) {
        const { id_coparte, cargo } = data.copartes[0]

        const crearCoparteUsuario = await CoparteDB.crearUsuario(
          id_coparte,
          idInsertado,
          cargo
        )
        if (crearCoparteUsuario.error) throw crearCoparteUsuario.data
        // @ts-ignore
        idInsertadoCoparteUsuario = crearCoparteUsuario.data.insertId
      }

      return RespuestaController.exitosa(201, "Usuario creado con éxito", {
        idInsertado,
        idInsertadoCoparteUsuario,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear usuario", error)
    }
  }

  static async actualizar(id_usuario: number, data: Usuario) {
    try {
      const usuarioActualizado = await UsuarioDB.actualizar(id_usuario, data)
      if (usuarioActualizado.error) throw usuarioActualizado.data

      return RespuestaController.exitosa(
        200,
        "Usuario actualizado con éxito",
        null
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
