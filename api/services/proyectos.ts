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
    const { id, min } = queries

    if (min) return this.obtenerVMin(queries)
    if (id) return this.obtenerUno(id)
    try {
      const re = (await ProyectoDB.obtener(queries)) as ResProyectoDB[]

      const proyectos: Proyecto[] = re.map((proyecto) => {
        const {
          id_proyecto_saldo,
          f_monto_total,
          f_solicitado,
          f_transferido,
          f_comprobado,
          f_retenciones,
          f_pa,
          ...resto
        } = proyecto

        const f_por_comprobar = f_solicitado - f_comprobado
        const f_isr = f_por_comprobar * 0.35
        const f_ejecutado = f_transferido + f_retenciones + f_isr + f_pa
        const f_remanente = f_monto_total - f_ejecutado
        const p_avance = ((f_ejecutado * 100) / f_monto_total).toFixed(2)

        return {
          ...resto,
          tipo_financiamiento: this.obtenerTipoFinanciamiento(
            resto.i_tipo_financiamiento
          ),
          saldo: {
            id: id_proyecto_saldo,
            f_monto_total,
            f_solicitado,
            f_transferido,
            f_comprobado,
            f_por_comprobar,
            f_isr,
            f_remanente,
            p_avance,
            f_retenciones,
            f_ejecutado,
            f_pa,
          },
        }
      })

      return RespuestaController.exitosa(200, "Consulta exitosa", proyectos)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static async obtenerUno(id_proyecto: number) {
    try {
      const re = await ProyectoDB.obtenerUno(id_proyecto)
      // if (re.error) throw re.data

      return RespuestaController.exitosa(200, "Consulta exitosa", {})
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

  // static async obtenerMinistraciones(id_proyecto: number) {
  //   try {
  //     const reMinistraciones = await ProyectoDB.obtenerMinistraciones(
  //       id_proyecto
  //     )
  //     if (reMinistraciones.error) throw reMinistraciones.data

  //     const ministraciones = reMinistraciones.data as MinistracionProyecto[]

  //     const ministracionesHidratadas = await Promise.all(
  //       ministraciones.map(async (ministracion) => {
  //         const reRubrosMinistracion =
  //           await ProyectoDB.obtenerRubrosMinistracion(ministracion.id)
  //         if (reRubrosMinistracion.error) throw reRubrosMinistracion.data

  //         const rubrosMinistracion =
  //           reRubrosMinistracion.data as RubroMinistracion[]

  //         return {
  //           ...ministracion,
  //           rubros_presupuestales: rubrosMinistracion,
  //         }
  //       })
  //     )

  //     return RespuestaController.exitosa(
  //       200,
  //       "ministraciones obtenidas con éxito",
  //       ministracionesHidratadas
  //     )
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al obtener ministraciones de proyecto",
  //       error
  //     )
  //   }
  // }

  // static async actualizarMinistracion(
  //   id_ministracion: number,
  //   data: MinistracionProyecto
  // ) {
  //   try {
  //     const { rubros_presupuestales } = data

  //     const up = ProyectoDB.actualizarMinistracion(id_ministracion, data)
  //     const reTodosRubros =
  //       ProyectoDB.obtenerTodosRubrosMinistracion(id_ministracion)

  //     const promesas1 = await Promise.all([up, reTodosRubros])

  //     for (const p1 of promesas1) {
  //       if (p1.error) throw p1.data
  //     }

  //     const todosRubrosDB = promesas1[1].data as RubroMinistracion[]
  //     const rubrosActivosDB = todosRubrosDB.filter(({ b_activo }) => !!b_activo)

  //     const promesas2 = []

  //     for (const rp of rubros_presupuestales) {
  //       //si tiene id es porque se va a ctualizar
  //       if (rp.id) {
  //         promesas2.push(ProyectoDB.actualizarRubroMinistracion(rp))
  //       } else {
  //         //si no tiene id o se va a registrar o se va a actualizar
  //         const rubroMatchDB = todosRubrosDB.find(
  //           (rDB) => rDB.id_rubro == rp.id_rubro
  //         )
  //         if (rubroMatchDB) {
  //           promesas2.push(
  //             ProyectoDB.reactivarRubroMinistracion({
  //               id: rubroMatchDB.id,
  //               ...rp,
  //             })
  //           )
  //         } else {
  //           promesas2.push(
  //             ProyectoDB.crearRubroMinistracion(id_ministracion, rp)
  //           )
  //         }
  //       }
  //     }

  //     //comparar rubros activos de DB vs los que vienen de cliente y ver si se borro alguno
  //     for (const raDB of rubrosActivosDB) {
  //       const matchCliente = rubros_presupuestales.find(
  //         (rp) => rp.id == raDB.id
  //       )
  //       if (!matchCliente) {
  //         promesas2.push(ProyectoDB.desactivarRubroMinistracion(raDB.id))
  //       }
  //     }

  //     //evitar posible problema de desincronizacion con eapagado de rubros
  //     const resCombinadas = await Promise.all(promesas2)
  //     for (const rc of resCombinadas) {
  //       if (rc.error) throw rc.data
  //     }

  //     return RespuestaController.exitosa(
  //       200,
  //       "ministracion actualizada con éxito",
  //       null
  //     )
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al actualizar ministración",
  //       error
  //     )
  //   }
  // }

  static async crear(data: Proyecto) {
    const { ministraciones } = data

    let f_monto_total = 0
    let f_pa = 0

    for (const ministracion of ministraciones) {
      for (const rp of ministracion.rubros_presupuestales) {
        f_monto_total += Number(rp.f_monto)
        if (rp.id_rubro == 1) {
          f_pa += Number(rp.f_monto)
        }
      }
    }

    const dataProyecto: Proyecto = {
      ...data,
      saldo: {
        f_monto_total,
        f_transferido: 0,
        f_solicitado: 0,
        f_comprobado: 0,
        f_retenciones: 0,
        f_pa,
      },
    }

    try {
      const cr = await ProyectoDB.crear(dataProyecto)

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear proyecto", error)
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const { ministraciones } = data

      // const up = ProyectoDB.actualizar(id_proyecto, data)
      // const promesas = [up]

      // for (const min of ministraciones) {
      //   if (!min.id) {
      //     promesas.push(this.crearMinistracion(id_proyecto, min))
      //   }
      // }

      // const resCombinadas = await Promise.all(promesas)

      // for (const rc of resCombinadas) {
      //   if (rc.error) throw rc.data
      // }

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

  // static async crearMinistracion(
  //   id_proyecto: number,
  //   ministracion: MinistracionProyecto
  // ) {
  //   try {
  //     const { rubros_presupuestales } = ministracion

  //     const crMinistracion = await ProyectoDB.crearMinistracion(
  //       id_proyecto,
  //       ministracion
  //     )
  //     if (crMinistracion.error) throw crMinistracion.data
  //     // @ts-ignore
  //     const idInsertadoMinistracion = crMinistracion.data.insertId

  //     const crRubros = await Promise.all(
  //       rubros_presupuestales.map(
  //         async (rubro) =>
  //           await this.crearRubroMinistracion(idInsertadoMinistracion, rubro)
  //       )
  //     )

  //     for (const cr of crRubros) {
  //       if (cr.error) throw cr.data
  //     }

  //     return RespuestaController.exitosa(201, "Ministracion creada con éxito", {
  //       idInsertadoMinistracion,
  //     })
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al crear ministracion",
  //       error
  //     )
  //   }
  // }

  // static async crearMinistraciones(
  //   id_proyecto: number,
  //   ministraciones: MinistracionProyecto[]
  // ) {
  //   try {
  //     const crMinistraciones = await ProyectoDB.crearMinistraciones(
  //       id_proyecto,
  //       ministraciones
  //     )
  //     if (crMinistraciones.error) throw crMinistraciones.data

  //     const resIdsMinisraciones = Array.isArray(crMinistraciones.data)
  //       ? crMinistraciones.data
  //       : [crMinistraciones.data]
  //     // @ts-ignore
  //     const ids = resIdsMinisraciones.map((res) => res.insertId)

  //     const rubrosConIdMinistracion = ministraciones.map(
  //       (ministracion, index) => ({
  //         id_ministracion: ids[index],
  //         rubros: ministracion.rubros_presupuestales,
  //       })
  //     )

  //     const crRubrosMinistracion = await ProyectoDB.crearRubrosMinistraciones(
  //       rubrosConIdMinistracion
  //     )
  //     if (crRubrosMinistracion.error) throw crRubrosMinistracion.data

  //     return RespuestaController.exitosa(
  //       201,
  //       "Ministracion creada con éxito",
  //       null
  //     )
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al crear ministracion",
  //       error
  //     )
  //   }
  // }

  // static async crearRubroMinistracion(
  //   id_ministracion: number,
  //   rubro: RubroMinistracion
  // ) {
  //   const crRubro = await ProyectoDB.crearRubroMinistracion(
  //     id_ministracion,
  //     rubro
  //   )
  //   if (crRubro.error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al crear rubro de ministración",
  //       crRubro.data
  //     )
  //   }

  //   // @ts-ignore
  //   const idInsertadoRubro = crRubro.data.insertId

  //   return RespuestaController.exitosa(
  //     201,
  //     "Rubro de ministración creado con éxito",
  //     { idInsertadoRubro }
  //   )
  // }
}

export { ProyectosServices }
