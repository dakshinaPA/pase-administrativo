import { ProyectoDB } from "@api/db/proyectos"
import { ColaboradorServices } from "./colaboradores"
import { ProveedorServices } from "./proveedores"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  MinistracionProyecto,
  ColaboradorProyecto,
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
  RubroMinistracion,
  NotaProyecto,
} from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { epochAFecha } from "@assets/utils/common"
import { ResDB } from "@api/models/respuestas.model"

class ProyectosServices {
  static async obtenerVMin(queries: QueriesProyecto) {
    try {
      const re = await ProyectoDB.obtenerVMin(queries)
      if (re.error) throw re.data

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
    const { id_coparte, id_responsable, id: id_proyecto, min } = queries

    if (min) return await this.obtenerVMin(queries)
    try {
      const obtenerDB = await ProyectoDB.obtener(
        id_coparte,
        id_proyecto,
        id_responsable
      )
      if (obtenerDB.error) throw obtenerDB.data

      const proyectosDB = obtenerDB.data as ResProyectoDB[]

      const dataTransformada: Proyecto[] = await Promise.all(
        proyectosDB.map(async (proyecto) => {
          const {
            id,
            id_financiador,
            financiador,
            id_coparte,
            id_administrador,
            coparte,
            id_responsable,
            responsable,
            id_alt,
            nombre,
            id_tema_social,
            tema_social,
            f_monto_total,
            i_tipo_financiamiento,
            i_beneficiados,
            dt_registro,
          } = proyecto

          let ministraciones: MinistracionProyecto[] = null
          let colaboradores: ColaboradorProyecto[] = null
          let proveedores: ProveedorProyecto[] = null
          let solicitudes: SolicitudPresupuesto[] = null
          let notas: NotaProyecto[] = null

          if (id_proyecto) {
            const reColaboradores = ColaboradorServices.obtener(id_proyecto)
            const reProveedores = ProveedorServices.obtener(id_proyecto)
            const reMinistraciones = this.obtenerMinistraciones(id_proyecto)
            const reSolicitudes = SolicitudesPresupuestoServices.obtener({
              id_proyecto,
            })
            const reNotas = this.obtenerNotas(id_proyecto)

            const resCombinadas = await Promise.all([
              reColaboradores,
              reProveedores,
              reMinistraciones,
              reSolicitudes,
              reNotas,
            ])

            for (const rc of resCombinadas) {
              if (rc.error) throw rc.data
            }

            colaboradores = resCombinadas[0].data as ColaboradorProyecto[]
            proveedores = resCombinadas[1].data as ProveedorProyecto[]
            ministraciones = resCombinadas[2].data as MinistracionProyecto[]
            solicitudes = resCombinadas[3].data as SolicitudPresupuesto[]
            notas = resCombinadas[4].data as NotaProyecto[]
          }

          return {
            id,
            id_alt,
            nombre,
            id_financiador,
            financiador,
            id_coparte,
            coparte,
            id_administrador,
            id_responsable,
            responsable,
            id_tema_social,
            tema_social,
            f_monto_total,
            i_tipo_financiamiento,
            tipo_financiamiento: this.obtenerTipoFinanciamiento(
              i_tipo_financiamiento
            ),
            i_beneficiados,
            dt_registro_epoch: dt_registro,
            dt_registro: epochAFecha(dt_registro),
            ministraciones,
            colaboradores,
            proveedores,
            solicitudes_presupuesto: solicitudes,
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

  static async obtenerData(id_proyecto: number) {
    try {
      const reColaboradores = ColaboradorServices.obtener(id_proyecto)
      const reProveedores = ProveedorServices.obtener(id_proyecto)
      // const rerubros = ProyectoDB.obtenerRubrosUltimaMinistracion(id_proyecto)

      const resCombinadas = await Promise.all([
        reColaboradores,
        reProveedores,
        // rerubros,
      ])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const colaboradores = resCombinadas[0].data as ColaboradorProyecto[]
      const proveedores = resCombinadas[1].data as ProveedorProyecto[]
      // const rubros_presupuestales = resCombinadas[2].data as RubroMinistracion[]

      return RespuestaController.exitosa(200, "Consulta exitosa", {
        colaboradores,
        proveedores,
        rubros_presupuestales: [],
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener colaboradores del proyecto",
        error
      )
    }
  }

  static async obtenerMinistraciones(id_proyecto: number) {
    try {
      const reMinistraciones = await ProyectoDB.obtenerMinistraciones(
        id_proyecto
      )
      if (reMinistraciones.error) throw reMinistraciones.data

      const ministraciones = reMinistraciones.data as MinistracionProyecto[]

      const ministracionesHidratadas = await Promise.all(
        ministraciones.map(async (ministracion) => {
          const reRubrosMinistracion =
            await ProyectoDB.obtenerRubrosMinistracion(ministracion.id)
          if (reRubrosMinistracion.error) throw reRubrosMinistracion.data

          const rubrosMinistracion =
            reRubrosMinistracion.data as RubroMinistracion[]

          return {
            ...ministracion,
            rubros_presupuestales: rubrosMinistracion,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "ministraciones obtenidas con éxito",
        ministracionesHidratadas
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener ministraciones de proyecto",
        error
      )
    }
  }

  static async actualizarMinistracion(
    id_ministracion: number,
    data: MinistracionProyecto
  ) {
    try {
      const { rubros_presupuestales } = data

      const up = ProyectoDB.actualizarMinistracion(id_ministracion, data)
      const dlRubros = ProyectoDB.limpiarRubrosMinistracion(id_ministracion)

      //evitar posible problema de desincronizacion con eapagado de rubros
      const resCombinadas1 = await Promise.all([up, dlRubros])
      for (const rc of resCombinadas1) {
        if (rc.error) throw rc.data
      }

      // const promesas = [up, dlRubros]
      // for (const rp of rubros_presupuestales) {
      //   if (rp.id) {
      //     promesas.push(ProyectoDB.actualizarRubroMinistracion(rp))
      //   } else {
      //     promesas.push(ProyectoDB.crearRubroMinistracion(id_ministracion, rp))
      //   }
      // }

      const resCombinadas = await Promise.all(
        rubros_presupuestales.map((rp) => {
          if (rp.id) {
            return ProyectoDB.actualizarRubroMinistracion(rp)
          } else {
            return ProyectoDB.crearRubroMinistracion(id_ministracion, rp)
          }
        })
      )

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "ministracion actualizada con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener ministraciones de proyecto",
        error
      )
    }
  }

  static async crear(data: Proyecto) {
    try {
      const { ministraciones, id_coparte, id_financiador } = data

      const reIdAltFinanciador =
        ProyectoDB.obtenerIdAltFinanciador(id_financiador)
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

      const crMinistraciones = await Promise.all(
        ministraciones.map(async (ministracion) => {
          const { rubros_presupuestales } = ministracion

          const crMinistracion = await ProyectoDB.crearMinistracion(
            idInsertado,
            ministracion
          )
          if (crMinistracion.error) throw crMinistracion.data
          // @ts-ignore
          const idInsertadoMinistracion = crMinistracion.data.insertId

          const crRubrosMinistracion = await Promise.all(
            rubros_presupuestales.map(async (rubroMinistracion) => {
              const crRubroMinistracion =
                await ProyectoDB.crearRubroMinistracion(
                  idInsertadoMinistracion,
                  rubroMinistracion
                )
              if (crRubroMinistracion.error) throw crRubroMinistracion.data
            })
          )
        })
      )

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear proyecto", error)
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const { ministraciones } = data

      const up = await ProyectoDB.actualizar(id_proyecto, data)
      if (up.error) throw up.data

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

  static async obtenerNotas(id_proyecto: number) {
    const re = await ProyectoDB.obtenerNotas(id_proyecto)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener notas del financiador",
        re.data
      )
    }

    let notas = re.data as NotaProyecto[]
    notas = notas.map((nota) => {
      return {
        ...nota,
        dt_registro: epochAFecha(nota.dt_registro),
      }
    })

    return RespuestaController.exitosa(200, "consulta exitosa", notas)
  }

  static async crearNota(id_proyecto: number, data: NotaProyecto) {
    const cr = await ProyectoDB.crearNota(id_proyecto, data)

    if (cr.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de financiador",
        cr.data
      )
    }

    // @ts-ignore
    const idInsertado = cr.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de financiador creada con éxito",
      { idInsertado }
    )
  }
}

export { ProyectosServices }
