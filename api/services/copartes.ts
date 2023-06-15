import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { Coparte, CoparteUsuario, EnlaceCoparte } from "@models/coparte.model"
import { ResCoparteDB } from "@api/models/coparte.model"
import { epochAFecha } from "@assets/utils/common"

class CopartesServices {
  static obetnerStatusLegal(i_estatus_legal: 1 | 2) {
    switch (i_estatus_legal) {
      case 1:
        return "Constituida"
      case 2:
        return "No constituida"
    }
  }

  static async obtenerVmin() {
    const re = await CoparteDB.obtenerVmin()

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener copartes",
        re.data
      )
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
  }

  static async obtener(id_coparte: number, min = false) {
    if (min) return await this.obtenerVmin()
    try {
      const re = await CoparteDB.obtener(id_coparte)
      if (re.error) throw re.data

      const copartesDB = re.data as ResCoparteDB[]

      const copartesHidratadas: Coparte[] = await Promise.all(
        copartesDB.map(async (coparte) => {
          const {
            id,
            id_administrador,
            nombre_administrador,
            id_alt,
            nombre,
            i_estatus_legal,
            representante_legal,
            rfc,
            id_tema_social,
            tema_social,
            dt_registro,
            id_coparte_direccion,
            calle,
            numero_ext,
            numero_int,
            colonia,
            municipio,
            cp,
            id_estado,
            estado,
          } = coparte

          let usuarios: CoparteUsuario[] = null
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
            i_estatus_legal,
            estatus_legal: this.obetnerStatusLegal(i_estatus_legal),
            representante_legal,
            rfc,
            id_tema_social,
            tema_social,
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
              estado,
            },
            administrador: {
              id: id_administrador,
              nombre: nombre_administrador
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
      const { direccion, enlace } = data
      const upCoparte = CoparteDB.actualizar(id_coparte, data)
      const upADireccion = CoparteDB.actualizarDireccion(direccion)
      // const dlEnlace = CoparteDB.limpiarEnlace(id_coparte)
      // const upEnlace = CoparteDB.actualizarEnlace(enlace.id_usuario)

      const resCombinadas = await Promise.all([
        upCoparte,
        upADireccion,
        // dlEnlace,
        // upEnlace,
      ])

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
