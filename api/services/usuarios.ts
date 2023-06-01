import { UsuarioDB } from "@api/db/usuarios"
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
    const { data, error } = await UsuarioDB.obtener(id_usuario, id_rol)

    if (error) {
      return RespuestaController.fallida(400, "Error al obtener usuarios", data)
    }

    const usuariosDB = data as ResUsuarioDB[]

    try {
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

          let copartes: UsuarioCoparte[] = []

          if (id_usuario) {
            const { error, data } = await UsuarioDB.obtenerCopartes(id)
            if (error) throw data
            copartes = data as UsuarioCoparte[]
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
        "Error al obtener copartes de usuario",
        error
      )
    }
  }

  static async crear(data: Usuario) {
    try {
      const { data: dataUsuarios, error } = await UsuarioDB.crear(data)
      if (error) throw dataUsuarios

      // @ts-ignore
      const idInsertado = dataUsuarios.insertId
      const id_rol = data.rol.id
      // validacion para registrar copartes de usuario
      // solo si 2.admin, 3.coparte
      if (id_rol != 1) {
        // Admin puede tener n copartes asignadas
        // Coparte solo puede tener 1 coparte asignada
        const registrarCopartesUsuario = await Promise.all(
          data.copartes.map(async (coparte) => {
            const { data, error } = await UsuarioDB.crearCoparte(
              idInsertado,
              coparte.id_coparte
            )
            if (error) throw data
            return data
          })
        )
      }

      return RespuestaController.exitosa(201, "Usuario creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear copartes de usuario",
        error
      )
    }
  }

  static async actualizar(id_usuario: number, data: Usuario) {
    try {
      const usuarioActualizado = await UsuarioDB.actualizar(id_usuario, data)
      if (usuarioActualizado.error) throw usuarioActualizado.data

      const idRol = data.rol.id

      //actualizar copartes en caso que no sea admin
      if (idRol !== 1) {
        const copartesLimpiadas = await UsuarioDB.limpiarCopartes(id_usuario)
        if (copartesLimpiadas.error) throw copartesLimpiadas.data

        const idsAReactviar = []
        let copartesARegistar = []

        for (const { id, id_coparte } of data.copartes) {
          if (id) {
            idsAReactviar.push(id)
          } else {
            copartesARegistar.push(id_coparte)
          }
        }

        const reactivarIds = await UsuarioDB.reactivarCoparte(idsAReactviar)
        if (reactivarIds.error) throw reactivarIds.data

        const registrarNuevasCopartes = await Promise.all(
          copartesARegistar.map(async (id_coparte) => {
            const coparteCreada = await UsuarioDB.crearCoparte(
              id_usuario,
              id_coparte
            )
            if (coparteCreada.error) throw coparteCreada.data
          })
        )
      }

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
    return RespuestaController.exitosa(
      200,
      "Usuairo borrado con éxito",
      null
    )
  }
}

export { UsuariosServices }
