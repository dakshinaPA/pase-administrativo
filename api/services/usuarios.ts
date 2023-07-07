import { UsuarioDB } from "@api/db/usuarios"
import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { LoginUsuario, ResUsuarioDB } from "@api/models/usuario.model"
import {
  Usuario,
  CoparteUsuario,
  UsuarioLogin,
  QueriesUsuario,
} from "@models/usuario.model"
// import { CoparteUsuario } from "@models/coparte.model"
import { ResDB } from "@api/models/respuestas.model"
import { CopartesServices } from "./copartes"

class UsuariosServices {
  static async login(dataUsuario: LoginUsuario) {
    try {
      const { data, error } = await UsuarioDB.login(dataUsuario)
      if (error) throw data

      const [usuario] = data as ResUsuarioDB[]
      // encontró match con usuario
      if (usuario) {
        // let copartes: CoparteUsuario[] = null

        // const obtenerCoUs =
        //   usuario.id_rol === 3
        //     ? await UsuarioDB.obtenerCoparteCoparte(usuario.id)
        //     : await UsuarioDB.obtenerCopartesAdministrador(usuario.id)

        // if (obtenerCoUs.error) throw obtenerCoUs.data

        // copartes = obtenerCoUs.data as CoparteUsuario[]

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

  // static async loggear( id: number ){

  //     const res = await UsuarioDB.loggear( id )
  //     console.log( `usuario loggeado ${!res.error}` )
  //     return res
  // }
  static async obtenerVmin(id_rol: number) {
    const re = await UsuarioDB.obtenerVmin(id_rol)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener usuarios",
        re.data
      )
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
  }

  static async obtener(queries: QueriesUsuario) {
    const id_rol = Number(queries.id_rol)
    const id_usuario = Number(queries.id)
    const min = Boolean(queries.min)

    if (min) return await this.obtenerVmin(id_rol)
    try {
      const resUsuariosDB = await UsuarioDB.obtener(id_rol, id_usuario)
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
            password,
            id_rol,
            rol,
          } = usuario

          let coparte: CoparteUsuario = null

          if (id_rol == 3) {
            const reCoparteUsuario = await UsuarioDB.obtenerCoparteCoparte(id)
            if (reCoparteUsuario.error) throw reCoparteUsuario.data
            coparte = reCoparteUsuario.data[0] as CoparteUsuario
          }

          // if (id_usuario && id_rol !== 1) {
          //   const obtenerCoUs =
          //     id_rol === 3
          //       ? await UsuarioDB.obtenerCoparteCoparte(id)
          //       : await UsuarioDB.obtenerCopartesAdministrador(id)

          //   if (obtenerCoUs.error) throw obtenerCoUs.data

          //   const copartesCoUS = obtenerCoUs.data as CoparteUsuario[]

          //   copartes =
          //     id_rol === 3
          //       ? copartesCoUS.map((cop) => ({
          //           ...cop,
          //           b_enlace: Boolean(cop.b_enlace),
          //         }))
          //       : copartesCoUS
          // }

          return {
            id,
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
            password: id_usuario ? password : "",
            id_rol,
            rol,
            coparte,
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
      const id_rol = data.id_rol
      let idInsertadoCoparteUsuario = 0
      // registrar en tabla coparte_usuarios
      if (id_rol == 3) {
        const { id_coparte, cargo } = data.coparte

        const crearCoparteUsuario = await CoparteDB.crearUsuario(
          id_coparte,
          idInsertado,
          cargo,
          false
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
      const upUsuario = UsuarioDB.actualizar(id_usuario, data)

      const promesas = [upUsuario]

      if (data.id_rol == 3) {
        promesas.push(CoparteDB.actualizarUsuario(data.coparte))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
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
    return RespuestaController.exitosa(200, "Usuairo borrado con éxito", null)
  }
}

export { UsuariosServices }
