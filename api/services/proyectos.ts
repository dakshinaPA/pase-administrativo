import { ProyectoDB } from "@api/db/proyectos"
// import { ColaboradorDB } from "@api/db/colaboradores"
import { ColaboradorServices } from "@api/services/colaboradores"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  RubroProyecto,
  MinistracionProyecto,
  ColaboradorProyecto,
} from "@models/proyecto.model"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { epochAFecha } from "@assets/utils/common"
import { ResDB } from "@api/models/respuestas.model"

class ProyectosServices {
  // static async obtebnerVminimalista() {
  //   const obtener = await FinanciadorDB.obtenerVminimalista()

  //   if (obtener.error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al obtener financiadores",
  //       obtener.error
  //     )
  //   }

  //   return RespuestaController.exitosa(200, "Consulta exitosa", obtener.data)
  // }

  static async obtener(id_coparte: number, id_proyecto?: number, min = false) {
    // if (min) return await this.obtebnerVminimalista()
    try {
      const obtenerDB = await ProyectoDB.obtener(id_coparte, id_proyecto)
      if (obtenerDB.error) throw obtenerDB.data

      const proyectosDB = obtenerDB.data as ResProyectoDB[]

      const dataTransformada: Proyecto[] = await Promise.all(
        proyectosDB.map(async (proyecto) => {
          const {
            id,
            id_financiador,
            id_coparte,
            id_responsable,
            id_alt,
            f_monto_total,
            i_tipo_financiamiento,
            i_beneficiados,
            dt_registro,
            nombre_responsable,
          } = proyecto

          let rubros: RubroProyecto[] = null
          let ministraciones: MinistracionProyecto[] = null
          let colaboradores: ColaboradorProyecto[] = null

          if (id_proyecto) {
            const reRubros = await ProyectoDB.obtenerRubros(id_proyecto)
            if (reRubros.error) throw reRubros.data
            rubros = reRubros.data as RubroProyecto[]

            const reMinistraciones = await ProyectoDB.obtenerMinistraciones(
              id_proyecto
            )
            if (reMinistraciones.error) throw reMinistraciones.data
            ministraciones = reMinistraciones.data as MinistracionProyecto[]

            const reColaboradores = await ColaboradorServices.obtener(
              id_proyecto
            )
            if (reColaboradores.error) throw reColaboradores.data
            colaboradores = reColaboradores.data as ColaboradorProyecto[]
          }

          return {
            id,
            id_financiador,
            id_coparte,
            id_responsable,
            id_alt,
            f_monto_total,
            i_tipo_financiamiento,
            i_beneficiados,
            dt_registro_epoch: dt_registro,
            dt_registro: epochAFecha(dt_registro),
            responsable: {
              id: id_responsable,
              nombre: nombre_responsable,
            },
            rubros,
            ministraciones,
            colaboradores
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

  static async crear(id_coparte: number, data: Proyecto) {
    try {
      const { rubros, ministraciones } = data
      const cr = await ProyectoDB.crear(id_coparte, data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const promesas: Promise<ResDB>[] = []

      for (const rubro of rubros) {
        promesas.push(ProyectoDB.crearRubro(idInsertado, rubro))
      }

      for (const ministracion of ministraciones) {
        promesas.push(ProyectoDB.crearMinistracion(idInsertado, ministracion))
      }

      const resCombinadas = await Promise.all(promesas)
      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear proyecto", error)
    }
  }

  // static async actualizar(id: number, data: Financiador) {
  //   try {
  //     const { enlace, direccion } = data

  //     const upFianciador = FinanciadorDB.actualizar(id, data)
  //     const upEnlace = FinanciadorDB.actualizarEnlace(enlace)
  //     const upDireccion = FinanciadorDB.actualizarDireccion(direccion)

  //     const resCombinadas = await Promise.all([
  //       upFianciador,
  //       upEnlace,
  //       upDireccion,
  //     ])

  //     for (const rc of resCombinadas) {
  //       if (rc.error) throw rc.data
  //     }

  //     return RespuestaController.exitosa(
  //       200,
  //       "Financiador actualizado con éxito",
  //       null
  //     )
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al actualziar financiador",
  //       error
  //     )
  //   }
  // }

  static async borrar(id: number) {
    const dl = await ProyectoDB.borrar(id)

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
}

export { ProyectosServices }
