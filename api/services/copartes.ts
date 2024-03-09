import { CoparteDB } from "@api/db/copartes"
import { RespuestaController } from "@api/utils/response"
import { Coparte, NotaCoparte, QueriesCoparte } from "@models/coparte.model"
import { ResCoparteDB } from "@api/models/coparte.model"
import { epochAFecha } from "@assets/utils/common"
import { UsuariosServices } from "./usuarios"

class CopartesServices {
  static obetnerStatusLegal(i_estatus_legal: 1 | 2) {
    switch (i_estatus_legal) {
      case 1:
        return "Constituida"
      case 2:
        return "No constituida"
    }
  }

  static trimPayload(data: Coparte, crear = true): Coparte {
    const payload = {
      ...data,
      nombre: data.nombre.trim(),
      nombre_corto: data.nombre_corto.trim(),
      id_alt: data.id_alt.trim(),
      representante_legal: data.representante_legal.trim(),
      rfc: data.rfc.trim(),
      direccion: {
        ...data.direccion,
        calle: data.direccion.calle.trim(),
        numero_ext: data.direccion.numero_ext.trim(),
        numero_int: data.direccion.numero_int.trim(),
        colonia: data.direccion.colonia.trim(),
        municipio: data.direccion.municipio.trim(),
        cp: data.direccion.cp.trim(),
      },
    }

    if (crear) {
      payload.enlace = {
        nombre: data.enlace.nombre.trim(),
        apellido_paterno: data.enlace.apellido_paterno.trim(),
        apellido_materno: data.enlace.apellido_materno.trim(),
        email: data.enlace.email.trim(),
        telefono: data.enlace.telefono.trim(),
        password: data.enlace.password.trim(),
        cargo: data.enlace.cargo.trim(),
      }
    }

    return payload
  }

  static async obtenerVmin(id_coparte: number, id_admin: number) {
    const re = await CoparteDB.obtenerVmin(id_coparte, id_admin)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        `Error al obtener coparte${id_coparte ? "" : "s"}, contactar a soporte`,
        re.data
      )
    }
    return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
  }

  static async obtener(queries: QueriesCoparte) {
    const id_coparte = Number(queries.id)
    const id_admin = Number(queries.id_admin)
    const min = Boolean(queries.min)

    if (min) return this.obtenerVmin(id_coparte, id_admin)

    try {
      const re = await CoparteDB.obtener(queries)

      const copartesDB = re as ResCoparteDB[]

      const copartes: Coparte[] = copartesDB.map((coparte) => {
        const usuarios = coparte.usuarios?.map((usuario) =>
          UsuariosServices.trasnformarDataRe(usuario)
        )

        return {
          id: coparte.id,
          id_alt: coparte.id_alt,
          nombre: coparte.nombre,
          nombre_corto: coparte.nombre_corto,
          i_estatus_legal: coparte.i_estatus_legal,
          estatus_legal: this.obetnerStatusLegal(coparte.i_estatus_legal),
          representante_legal: coparte.representante_legal,
          rfc: coparte.rfc,
          id_administrador: coparte.id_administrador,
          administrador: coparte.administrador,
          dt_registro: epochAFecha(coparte.dt_registro),
          direccion: {
            id: coparte.id_coparte_direccion,
            calle: coparte.calle,
            numero_ext: coparte.numero_ext,
            numero_int: coparte.numero_int,
            colonia: coparte.colonia,
            municipio: coparte.municipio,
            cp: coparte.cp,
            id_estado: coparte.id_estado,
            estado: coparte.estado,
          },
          usuarios: usuarios || [],
          proyectos: coparte.proyectos || [],
          notas:
            coparte.notas?.map((nota) => ({
              ...nota,
              dt_registro: epochAFecha(nota.dt_registro),
            })) || [],
        }
      })

      return RespuestaController.exitosa(200, "Consulta exitosa", copartes)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        `Error al obtener ${
          id_coparte ? "coparte" : "copartes"
        }, contactar a soporte`,
        error
      )
    }
  }

  static async crear(data: Coparte) {
    try {
      const payload = this.trimPayload(data)
      const idCoparte = await CoparteDB.crear(payload)

      return RespuestaController.exitosa(201, "Coparte creada con éxito", {
        idInsertado: idCoparte,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear coparte, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(id_coparte: number, data: Coparte) {
    try {
      const payload = this.trimPayload(data, false)
      const up = await CoparteDB.actualizar(id_coparte, payload)

      return RespuestaController.exitosa(
        200,
        "Coparte actualizada con éxito",
        up
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar coparte, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id_coparte: number) {
    const res = await CoparteDB.borrar(id_coparte)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar coparte, contactar a soporte",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Coparte borrada con éxito",
      res.data
    )
  }

  static async obtenerNotas(id_coparte: number) {
    const re = await CoparteDB.obtenerNotas(id_coparte)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener notas del financiador",
        re.data
      )
    }

    let notas = re.data as NotaCoparte[]
    notas = notas.map((nota) => {
      return {
        ...nota,
        dt_registro: epochAFecha(nota.dt_registro),
      }
    })

    return RespuestaController.exitosa(200, "consulta exitosa", notas)
  }

  static async crearNota(id_coparte: number, data: NotaCoparte) {
    const crearNota = await CoparteDB.crearNota(id_coparte, data)

    if (crearNota.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de financiador",
        crearNota.data
      )
    }

    // @ts-ignore
    const idInsertado = crearNota.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de financiador creada con éxito",
      { idInsertado }
    )
  }
}

export { CopartesServices }
