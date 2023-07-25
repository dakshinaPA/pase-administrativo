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
import solicitudesPresupuesto from "pages/api/solicitudes-presupuesto"

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
            sector_beneficiado,
            tema_social,
            i_tipo_financiamiento,
            i_beneficiados,
            id_estado,
            estado,
            municipio,
            descripcion,
            dt_inicio,
            dt_fin,
            dt_registro,
          } = proyecto

          let ministraciones: MinistracionProyecto[] = []
          let colaboradores: ColaboradorProyecto[] = null
          let proveedores: ProveedorProyecto[] = null
          let solicitudes: SolicitudPresupuesto[] = []
          let notas: NotaProyecto[] = null

          const reMinistraciones = this.obtenerMinistraciones(id)
          const reSolicitudes = SolicitudesPresupuestoServices.obtener({
            id_proyecto: id,
          })

          const promesas = [reMinistraciones, reSolicitudes]

          if (id_proyecto) {
            const reColaboradores = ColaboradorServices.obtener(id_proyecto)
            const reProveedores = ProveedorServices.obtener(id_proyecto)
            const reNotas = this.obtenerNotas(id_proyecto)

            promesas.push(reColaboradores, reProveedores, reNotas)
          }

          const resCombinadas = await Promise.all(promesas)

          for (const rc of resCombinadas) {
            if (rc.error) throw rc.data
          }

          ministraciones = resCombinadas[0].data as MinistracionProyecto[]
          solicitudes = resCombinadas[1].data as SolicitudPresupuesto[]

          if (id_proyecto) {
            colaboradores = resCombinadas[2].data as ColaboradorProyecto[]
            proveedores = resCombinadas[3].data as ProveedorProyecto[]
            notas = resCombinadas[4].data as NotaProyecto[]
          }

          const f_monto_total = ministraciones
            .map((ministracion) =>
              ministracion.rubros_presupuestales.reduce(
                (acum, rubro) => acum + Number(rubro.f_monto),
                0
              )
            )
            .reduce((acum, sumaRubros) => acum + sumaRubros, 0)

          const f_pa = ministraciones
            .map(
              (ministracion) =>
                ministracion.rubros_presupuestales.find(
                  (rp) => rp.id_rubro == 1
                )?.f_monto || 0
            )
            .reduce((acum, f_monto) => acum + Number(f_monto), 0)

          let f_transferido = 0
          let f_solicitado = 0
          let f_comprobado = 0
          let f_retenciones = 0

          for (const solicitud of solicitudes) {
            //solo se suma a los transferido las solicitudes en estatus procesado
            f_solicitado += solicitud.f_importe
            if (solicitud.i_estatus == 4) {
              f_transferido += solicitud.f_importe
            }
            f_comprobado += solicitud.saldo.f_total_comprobaciones
            f_retenciones += solicitud.saldo.f_total_impuestos_retenidos
          }

          const f_por_comprobar = f_solicitado - f_comprobado
          const f_isr = f_por_comprobar * 0.35
          const f_ejecutado = f_transferido + f_retenciones + f_isr + f_pa
          const f_remanente = f_monto_total - f_ejecutado
          const p_avance = `${((f_ejecutado * 100) / f_monto_total).toFixed(
            2
          )}%`

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
            sector_beneficiado,
            f_monto_total,
            i_tipo_financiamiento,
            tipo_financiamiento: this.obtenerTipoFinanciamiento(
              i_tipo_financiamiento
            ),
            i_beneficiados,
            dt_registro: dt_registro,
            id_estado,
            estado,
            municipio,
            descripcion,
            dt_inicio,
            dt_fin,
            saldo: {
              f_transferido,
              f_solicitado,
              f_comprobado,
              f_por_comprobar,
              f_isr,
              f_retenciones,
              f_pa,
              f_ejecutado,
              f_remanente,
              p_avance,
            },
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
      const rerubros = ProyectoDB.obtenerRubrosMinistraciones(id_proyecto)

      const resCombinadas = await Promise.all([
        reColaboradores,
        reProveedores,
        rerubros,
      ])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const colaboradores = resCombinadas[0].data as ColaboradorProyecto[]
      const proveedores = resCombinadas[1].data as ProveedorProyecto[]
      const rubros_presupuestales = resCombinadas[2].data as RubroMinistracion[]

      //quitar los rubros repetido

      return RespuestaController.exitosa(200, "Consulta exitosa", {
        colaboradores,
        proveedores,
        rubros_presupuestales,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener data del proyecto",
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
      const reTodosRubros =
        ProyectoDB.obtenerTodosRubrosMinistracion(id_ministracion)

      const promesas1 = await Promise.all([up, reTodosRubros])

      for (const p1 of promesas1) {
        if (p1.error) throw p1.data
      }

      const todosRubrosDB = promesas1[1].data as RubroMinistracion[]
      const rubrosActivosDB = todosRubrosDB.filter(({ b_activo }) => !!b_activo)

      const promesas2 = []

      for (const rp of rubros_presupuestales) {
        //si tiene id es porque se va a ctualizar
        if (rp.id) {
          promesas2.push(ProyectoDB.actualizarRubroMinistracion(rp))
        } else {
          //si no tiene id o se va a registrar o se va a actualizar
          const rubroMatchDB = todosRubrosDB.find(
            (rDB) => rDB.id_rubro == rp.id_rubro
          )
          if (rubroMatchDB) {
            promesas2.push(
              ProyectoDB.reactivarRubroMinistracion({
                id: rubroMatchDB.id,
                ...rp,
              })
            )
          } else {
            promesas2.push(
              ProyectoDB.crearRubroMinistracion(id_ministracion, rp)
            )
          }
        }
      }

      //comparar rubros activos de DB vs los que vienen de cliente y ver si se borro alguno
      for (const raDB of rubrosActivosDB) {
        const matchCliente = rubros_presupuestales.find(
          (rp) => rp.id == raDB.id
        )
        if (!matchCliente) {
          promesas2.push(ProyectoDB.desactivarRubroMinistracion(raDB.id))
        }
      }

      //evitar posible problema de desincronizacion con eapagado de rubros
      const resCombinadas = await Promise.all(promesas2)
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
        "Error al actualizar ministración",
        error
      )
    }
  }

  static async crear(data: Proyecto) {
    const agregarCerosAId = (id: string) => {
      if (id.length < 3) {
        return agregarCerosAId(`0${id}`)
      } else {
        return id
      }
    }

    try {
      const { ministraciones, id_coparte, id_financiador } = data

      const reDataCrearIdAlt = await ProyectoDB.obtenerDataCrearIdAlt(
        id_financiador,
        id_coparte
      )
      if (reDataCrearIdAlt.error) throw reDataCrearIdAlt.data

      const idAltFinanciador = reDataCrearIdAlt.data[0][0].id_alt as string
      const idAltCoparte = reDataCrearIdAlt.data[1][0].id_alt as string
      const conteoIds = reDataCrearIdAlt.data[2][0].cantidad + 1
      const idConCeros = agregarCerosAId(String(conteoIds))

      const dataActualizada: Proyecto = {
        ...data,
        id_alt: `${idAltFinanciador}_${idAltCoparte}_${idConCeros}`,
      }

      const cr = await ProyectoDB.crear(dataActualizada)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const crMinistraciones = await this.crearMinistraciones(
        idInsertado,
        ministraciones
      )
      if (crMinistraciones.error) throw crMinistraciones.data

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

      const up = ProyectoDB.actualizar(id_proyecto, data)
      const promesas = [up]

      for (const min of ministraciones) {
        if (!min.id) {
          promesas.push(this.crearMinistracion(id_proyecto, min))
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
        "Error al crear nota de proyecto",
        cr.data
      )
    }

    // @ts-ignore
    const idInsertado = cr.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de proyecto creada con éxito",
      { idInsertado }
    )
  }

  static async crearMinistracion(
    id_proyecto: number,
    ministracion: MinistracionProyecto
  ) {
    try {
      const { rubros_presupuestales } = ministracion

      const crMinistracion = await ProyectoDB.crearMinistracion(
        id_proyecto,
        ministracion
      )
      if (crMinistracion.error) throw crMinistracion.data
      // @ts-ignore
      const idInsertadoMinistracion = crMinistracion.data.insertId

      const crRubros = await Promise.all(
        rubros_presupuestales.map(
          async (rubro) =>
            await this.crearRubroMinistracion(idInsertadoMinistracion, rubro)
        )
      )

      for (const cr of crRubros) {
        if (cr.error) throw cr.data
      }

      return RespuestaController.exitosa(201, "Ministracion creada con éxito", {
        idInsertadoMinistracion,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear ministracion",
        error
      )
    }
  }

  static async crearMinistraciones(
    id_proyecto: number,
    ministraciones: MinistracionProyecto[]
  ) {
    try {
      const crMinistraciones = await ProyectoDB.crearMinistraciones(
        id_proyecto,
        ministraciones
      )
      if (crMinistraciones.error) throw crMinistraciones.data

      const resIdsMinisraciones = Array.isArray(crMinistraciones.data)
        ? crMinistraciones.data
        : [crMinistraciones.data]
      // @ts-ignore
      const ids = resIdsMinisraciones.map((res) => res.insertId)

      const rubrosConIdMinistracion = ministraciones.map(
        (ministracion, index) => ({
          id_ministracion: ids[index],
          rubros: ministracion.rubros_presupuestales,
        })
      )

      const crRubrosMinistracion = await ProyectoDB.crearRubrosMinistraciones(
        rubrosConIdMinistracion
      )
      if (crRubrosMinistracion.error) throw crRubrosMinistracion.data

      return RespuestaController.exitosa(
        201,
        "Ministracion creada con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear ministracion",
        error
      )
    }
  }

  static async crearRubroMinistracion(
    id_ministracion: number,
    rubro: RubroMinistracion
  ) {
    const crRubro = await ProyectoDB.crearRubroMinistracion(
      id_ministracion,
      rubro
    )
    if (crRubro.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear rubro de ministración",
        crRubro.data
      )
    }

    // @ts-ignore
    const idInsertadoRubro = crRubro.data.insertId

    return RespuestaController.exitosa(
      201,
      "Rubro de ministración creado con éxito",
      { idInsertadoRubro }
    )
  }
}

export { ProyectosServices }
