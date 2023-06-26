import { ProyectoDB } from "@api/db/proyectos"
import { ColaboradorServices } from "./colaboradores"
import { ProveedorServices } from "./proveedores"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  RubroProyecto,
  MinistracionProyecto,
  ColaboradorProyecto,
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { epochAFecha } from "@assets/utils/common"
import { ResDB } from "@api/models/respuestas.model"


class ProyectosServices {
  static async obtenerVMin(id_proyecto?: number) {
    try {
      const re = await ProyectoDB.obtenerVMin(id_proyecto)
      if (re.error) throw re.data

      // const proyectos = re.data as Proyecto[]

      // const reRubrosProyectos = await Promise.all(
      //   proyectos.map(async (proyecto) => {
      //     const reRubros = await ProyectoDB.obtenerRubros(proyecto.id)
      //     if (reRubros.error) throw reRubros.data

      //     return {
      //       ...proyecto,
      //       rubros: reRubros.data as RubroProyecto[],
      //     }
      //   })
      // )

      return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static obtenerTipoFinanciamiento(i_tipo: number) {
    switch (i_tipo) {
      case 1:
        return "Estipendio"
      case 2:
        return "Única ministración"
      case 3:
        return "Varias ministraciones"
      case 4:
        return "Multi anual"
    }
  }

  static async obtener(queries: QueriesProyecto) {
    const {
      id_coparte,
      id_usuario,
      id: id_proyecto,
      min,
      registro_solicitud,
    } = queries

    if (min) return await this.obtenerVMin(id_proyecto)
    try {
      const obtenerDB = await ProyectoDB.obtener(id_coparte, id_proyecto, id_usuario)
      if (obtenerDB.error) throw obtenerDB.data

      const proyectosDB = obtenerDB.data as ResProyectoDB[]

      const dataTransformada: Proyecto[] = await Promise.all(
        proyectosDB.map(async (proyecto) => {
          const {
            id,
            id_financiador,
            financiador,
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
          let proveedores: ProveedorProyecto[] = null
          let solicitudes: SolicitudPresupuesto[] = null

          if (id_proyecto) {

            const reRubros = ProyectoDB.obtenerRubros(id_proyecto)
            const reColaboradores = ColaboradorServices.obtener(id_proyecto, 0)
            const reProveedores = ProveedorServices.obtener(id_proyecto, 0)
            
            const promesas = [reRubros, reColaboradores, reProveedores]

            if(!registro_solicitud){
              const reMinistraciones =
                ProyectoDB.obtenerMinistraciones(id_proyecto)
              const reSolicitudes = SolicitudesPresupuestoServices.obtener(id_proyecto, 0)

              promesas.push(reMinistraciones, reSolicitudes)
            }

            const resCombinadas = await Promise.all(promesas)

            for (const rc of resCombinadas) {
              if (rc.error) throw rc.data
            }

            rubros = resCombinadas[0].data as RubroProyecto[]
            colaboradores = resCombinadas[1].data as ColaboradorProyecto[]
            proveedores = resCombinadas[2].data as ProveedorProyecto[]
            if(!registro_solicitud){
              ministraciones = resCombinadas[3].data as MinistracionProyecto[]
              solicitudes = resCombinadas[4].data as SolicitudPresupuesto[]
            }
          }

          return {
            id,
            id_coparte,
            id_alt,
            f_monto_total,
            i_tipo_financiamiento,
            tipo_financiamiento: this.obtenerTipoFinanciamiento(
              i_tipo_financiamiento
            ),
            i_beneficiados,
            dt_registro_epoch: dt_registro,
            dt_registro: epochAFecha(dt_registro),
            financiador: {
              id: id_financiador,
              nombre: financiador,
            },
            responsable: {
              id: id_responsable,
              nombre: nombre_responsable,
            },
            rubros,
            ministraciones,
            colaboradores,
            proveedores,
            solicitudes
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

  static async crear(data: Proyecto) {
    try {
      const { rubros, ministraciones, id_coparte, financiador } = data

      const reIdAltFinanciador = ProyectoDB.obtenerIdAltFinanciador(
        financiador.id
      )
      const reIdAltCoparte = ProyectoDB.obtenerIdAltCoparte(id_coparte)
      const reIdUltimoProyecto = ProyectoDB.obtenerUltimoId()

      const promesasIds = await Promise.all([
        reIdAltFinanciador,
        reIdAltCoparte,
        reIdUltimoProyecto,
      ])

      for (const pid of promesasIds) {
        if (pid.error) throw pid.data
      }

      const idAltFinanciador = promesasIds[0].data[0].id_alt as string
      const idAltCoparte = promesasIds[1].data[0].id_alt as string
      const ultimoId = promesasIds[2].data[0]?.id
        ? promesasIds[2].data[0].id + 1
        : "1"

      const dataActualizada: Proyecto = {
        ...data,
        id_alt: `${idAltFinanciador}_${idAltCoparte}_${ultimoId}`,
      }

      const cr = await ProyectoDB.crear(dataActualizada)
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

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const { rubros, ministraciones } = data

      const promesas: Promise<ResDB>[] = []

      promesas.push(ProyectoDB.actualizar(id_proyecto, data))
      // promesas.push(ProyectoDB.limpiarRubros(id_proyecto))

      for (const rubro of rubros) {
        if (rubro.id) {
          // promesas.push(ProyectoDB.actualizarRubro(rubro))
        } else {
          promesas.push(ProyectoDB.crearRubro(id_proyecto, rubro))
        }
      }

      for (const minis of ministraciones) {
        if (minis.id) {
          // promesas.push(ProyectoDB.actualizarMinistracion(minis))
        } else {
          promesas.push(ProyectoDB.crearMinistracion(id_proyecto, minis))
        }
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "Proyecto actualizado con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar proyecto",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ProyectoDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(400, "Error al borrar proyecto", null)
    }
    return RespuestaController.exitosa(
      200,
      "Proyecto borrado con éxito",
      dl.data
    )
  }
}

export { ProyectosServices }
