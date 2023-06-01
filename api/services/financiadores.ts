import { FinanciadorDB } from "@api/db/financiadores"
import { RespuestaController } from "@api/utils/response"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { ResFinanciadorDB } from "@api/models/financiador.model"
import { epochAFecha } from "@assets/utils/common"

class FinanciadoresServices {
  static async obtener(idFinanciador?: number) {
    const res = await FinanciadorDB.obtener(idFinanciador)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        res.data
      )
    }

    const financiadoresDB = res.data as ResFinanciadorDB[]

    try {
      const dataTransformada: Financiador[] = await Promise.all(
        financiadoresDB.map(async (financiador) => {
          const {
            id,
            nombre,
            id_pais,
            representante_legal,
            pagina_web,
            i_tipo,
            dt_registro,
            id_enlace,
            nombre_enlace,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
          } = financiador

          let notas: NotaFinanciador[] = []

          //obtener notas solo si se trata de un financiador
          //no saturar tiempo de respuesta al obtener todos
          if (idFinanciador) {
            const resNotas = await FinanciadorDB.obtenerNotas(id)
            if (resNotas.error) throw resNotas.data
            notas = resNotas.data as NotaFinanciador[]
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
            id_pais,
            representante_legal,
            pagina_web,
            i_tipo,
            dt_registro: epochAFecha(dt_registro),
            enlace: {
              id: id_enlace,
              nombre: nombre_enlace,
              apellido_paterno,
              apellido_materno,
              email,
              telefono,
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
    const res = await FinanciadorDB.crear(data)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear financiador",
        res.data
      )
    }

    // @ts-ignore
    const idInsertado = res.data.insertId

    const resEnlace = await FinanciadorDB.crearEnlace(idInsertado, data.enlace)

    if (resEnlace.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear enlace del financiador",
        resEnlace.data
      )
    }

    return RespuestaController.exitosa(
      201,
      "Financiador creado con éxito",
      null
    )
  }

  static async actualizar(id: number, data: Financiador) {
    const res = FinanciadorDB.actualizar(id, data)
    const resEnlace = FinanciadorDB.actualizarEnlace(data.enlace)
    const resCombinada = await Promise.all([res, resEnlace])

    const error = { error: false, data: [] }

    for (const res of resCombinada) {
      if (res.error) {
        error.error = true
        error.data = [...error.data, res.data]
      }
    }

    if (error.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar financiador",
        error.data
      )
    }

    // const financiadorActualizado = await FinanciadoresServices.obtener(id)

    return RespuestaController.exitosa(
      200,
      "Financiador actualizado con éxito",
      null
    )
  }

  static async borrar(id: number) {
    const res = await FinanciadorDB.borrar(id)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar financiador",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Financiador borrado con éxito",
      res.data
    )
  }

  static async crearNota(data: NotaFinanciador) {
    const res = await FinanciadorDB.crearNota(data)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de financiador",
        res.data
      )
    }

    return RespuestaController.exitosa(
      201,
      "Nota de financiador creada con éxito",
      null
    )
  }
}

export { FinanciadoresServices }
