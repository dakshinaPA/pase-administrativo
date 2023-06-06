import { FinanciadorDB } from "@api/db/financiadores"
import { RespuestaController } from "@api/utils/response"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { ResFinanciadorDB } from "@api/models/financiador.model"
import { epochAFecha } from "@assets/utils/common"

class FinanciadoresServices {
  static obtenerTipo(id_tipo: 1 | 2) {
    switch (id_tipo) {
      case 1:
        return "ALIADO"
      case 2:
        return "INDEPENDIENTE"
    }
  }

  static async obtebnerVminimalista() {
    const obtener = await FinanciadorDB.obtenerVminimalista()

    if (obtener.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        obtener.error
      )
    }

    return RespuestaController.exitosa(200, "Consulta exitosa", obtener.data)
  }

  static async obtener(id_financiador?: number, min = false) {
    if (min) return await this.obtebnerVminimalista()

    try {
      const obtenerDB = await FinanciadorDB.obtener(id_financiador)
      if (obtenerDB.error) throw obtenerDB.data

      const financiadoresDB = obtenerDB.data as ResFinanciadorDB[]

      const dataTransformada: Financiador[] = await Promise.all(
        financiadoresDB.map(async (financiador) => {
          const {
            id,
            nombre,
            representante_legal,
            pagina_web,
            folio_fiscal,
            actividad,
            i_tipo,
            dt_constitucion,
            dt_registro,
            id_enlace,
            nombre_enlace,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
            id_direccion,
            calle,
            numero_ext,
            numero_int,
            colonia,
            municipio,
            cp,
            id_estado,
            estado,
            id_pais,
            pais,
          } = financiador

          let notas: NotaFinanciador[] = []

          //obtener notas solo si se trata de un financiador
          //no saturar tiempo de respuesta al obtener todos
          if (id_financiador) {
            const notasDB = await FinanciadorDB.obtenerNotas(id)
            if (notasDB.error) throw notasDB.data
            notas = notasDB.data as NotaFinanciador[]
            notas = notas.map((nota) => {
              return {
                ...nota,
                dt_registro: epochAFecha(nota.dt_registro),
              }
            })
          }

          return {
            id,
            nombre,
            representante_legal,
            pagina_web,
            folio_fiscal,
            actividad,
            i_tipo,
            tipo: this.obtenerTipo(i_tipo),
            dt_constitucion: epochAFecha(dt_constitucion),
            dt_registro: epochAFecha(dt_registro),
            enlace: {
              id: id_enlace,
              nombre: nombre_enlace,
              apellido_paterno,
              apellido_materno,
              email,
              telefono,
            },
            direccion: {
              id: id_direccion,
              calle,
              numero_ext,
              numero_int,
              colonia,
              municipio,
              cp,
              id_estado,
              estado,
              id_pais,
              pais,
            },
            notas,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        dataTransformada
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static async crear(data: Financiador) {
    try {
      const { enlace, direccion } = data
      const cr = await FinanciadorDB.crear(data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const crEnlace = FinanciadorDB.crearEnlace(idInsertado, enlace)
      const crDireccion = FinanciadorDB.crearDireccion(idInsertado, direccion)

      const resCombinadas = await Promise.all([crEnlace, crDireccion])
      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(201, "Financiador creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear financiador",
        error
      )
    }
  }

  static async actualizar(id: number, data: Financiador) {
    try {
      const { enlace, direccion } = data

      const upFianciador = FinanciadorDB.actualizar(id, data)
      const upEnlace = FinanciadorDB.actualizarEnlace(enlace)
      const upDireccion = FinanciadorDB.actualizarDireccion(direccion)

      const resCombinadas = await Promise.all([
        upFianciador,
        upEnlace,
        upDireccion,
      ])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "Financiador actualizado con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar financiador",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await FinanciadorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar financiador",
        null
      )
    }
    return RespuestaController.exitosa(
      200,
      "Financiador borrado con éxito",
      dl.data
    )
  }

  static async crearNota(id_financiador: number, data: NotaFinanciador) {
    const crearNota = await FinanciadorDB.crearNota(id_financiador, data)

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

export { FinanciadoresServices }
