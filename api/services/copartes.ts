import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { Coparte, UsuarioCoparte, EnlaceCoparte } from "@models/coparte.model"
import { ResCoparteDB } from "@api/models/coparte.model"
import { epochAFecha } from "@assets/utils/common"

class CopartesServices {
  static obetnerStatus(i_estatus: 1 | 2) {
    switch (i_estatus) {
      case 1:
        return "ACTIVA"
      case 2:
        return "FINALIZADA"
    }
  }

  static obetnerStatusLegal(i_estatus_legal: 1 | 2) {
    switch (i_estatus_legal) {
      case 1:
        return "CONSTITUIDA"
      case 2:
        return "NO CONSTITUIDA"
    }
  }

  static async obtener(id_coparte?: number) {
    try {
      const obtener = await CoparteDB.obtener(id_coparte)
      if (obtener.error) throw obtener.data

      const copartesDB = obtener.data as ResCoparteDB[]

      const copartesHidratadas: Coparte[] = await Promise.all(
        copartesDB.map(async (coparte) => {
          const {
            id,
            id_administrador,
            id_alt,
            nombre,
            i_estatus,
            i_estatus_legal,
            representante_legal,
            rfc,
            id_tema_social,
            dt_registro,
            id_coparte_direccion,
            calle,
            numero_ext,
            numero_int,
            colonia,
            municipio,
            cp,
            id_estado,
            estado
          } = coparte

          let usuarios: UsuarioCoparte[] = null
          let enlace: EnlaceCoparte = null

          if (id_coparte) {
            const obtenerUsuarios = await CoparteDB.obtenerUsuarios(id_coparte)
            if (obtenerUsuarios.error) throw obtenerUsuarios.data

            const coparteUsuarioDB = obtenerUsuarios.data as EnlaceCoparte[]

            usuarios = coparteUsuarioDB.map((usuario) => {
              const {
                id,
                id_usuario,
                nombre,
                apellido_materno,
                apellido_paterno,
                email,
                telefono,
                cargo,
                b_enlace,
              } = usuario

              const esEnlace = Boolean(b_enlace)

              if (esEnlace) {
                enlace = {
                  id_usuario,
                  nombre,
                  apellido_paterno,
                  apellido_materno,
                  email,
                  telefono,
                  cargo,
                  b_enlace: esEnlace,
                }
              }

              return {
                id,
                id_usuario,
                nombre: `${nombre} ${apellido_paterno} ${apellido_materno}`,
                cargo,
                b_enlace: esEnlace,
              }
            })
          }

          return {
            id,
            id_alt,
            nombre,
            i_estatus,
            i_estatus_legal,
            estatus: this.obetnerStatus(i_estatus),
            estatus_legal: this.obetnerStatusLegal(i_estatus_legal),
            representante_legal,
            rfc,
            id_tema_social,
            tema_social: "",
            dt_registro: epochAFecha(dt_registro),
            direccion: {
              id: id_coparte_direccion,
              calle,
              numero_ext,
              numero_int,
              colonia,
              municipio,
              cp,
              id_estado,
              estado
            },
            administrador: {
              id: id_administrador,
            },
            enlace,
            usuarios,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        copartesHidratadas
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener copartes",
        error
      )
    }
  }

  static async crear(data: Coparte) {
    try {
      const { direccion, enlace } = data

      const crearCoparte = await CoparteDB.crear(data)
      if (crearCoparte.error) throw crearCoparte.data
      // @ts-ignore
      const idInsertadoCoparte = crearCoparte.data.insertId

      const crearDireccion = await CoparteDB.crearDireccion(
        idInsertadoCoparte,
        direccion
      )
      if (crearDireccion.error) throw crearDireccion.data

      const cearEnlace = await CoparteDB.crearEnlace(enlace)
      if (cearEnlace.error) throw cearEnlace.data
      // @ts-ignore
      const idInsertadoEnlace = cearEnlace.data.insertId

      const cearUsuario = await CoparteDB.crearUsuario(
        idInsertadoCoparte,
        idInsertadoEnlace,
        enlace.cargo,
        true
      )
      if (cearUsuario.error) throw cearUsuario.data

      return RespuestaController.exitosa(201, "Coparte creada con éxito", {
        idInsertadoCoparte,
        idInsertadoEnlace,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear coparte", error)
    }
  }

  static async actualizar(id_coparte: number, data: Coparte) {
    try {
      const { direccion } = data
      const resCoparte = CoparteDB.actualizar(id_coparte, data)
      const resADireccion = CoparteDB.actualizarDireccion(direccion)

      const resCombinadas = await Promise.all([resCoparte, resADireccion])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "Coparte actualizada con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar coparte",
        error
      )
    }
  }

  static async borrar(id_coparte: number) {
    const res = await CoparteDB.borrar(id_coparte)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar coparte",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Coparte borrada con éxito",
      res.data
    )
  }
}

export { CopartesServices }
