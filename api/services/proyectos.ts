import { ProyectoDB } from "@api/db/proyectos"
import { ColaboradorServices } from "./colaboradores"
import { ProveedorServices } from "./proveedores"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  MinistracionProyecto,
  QueriesProyecto,
  NotaProyecto,
  CalcularSaldo,
  AjusteProyecto,
  NotaAjuste,
} from "@models/proyecto.model"

import { ResProyectos } from "@api/models/proyecto.model"
import {
  epochAFecha,
  fechaActualAEpoch,
  inputDateAformato,
  numeroAdigitos,
  obtenerEstatusSolicitud,
  obtenerTipoAjuste,
} from "@assets/utils/common"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"
import {
  estatusSolicitud,
  rubrosPresupuestales,
  tiposAjusteProyecto,
  tiposGasto,
} from "@assets/utils/constantes"

class ProyectosServices {
  static async obtenerVMin(queries: QueriesProyecto) {
    try {
      const re = await ProyectoDB.obtenerVMin(queries)
      if (re.error) throw re.data

      return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener proyectos, contactar a soporte",
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

  static trimPayload(data: Proyecto): Proyecto {
    return {
      ...data,
      nombre: data.nombre.trim(),
      sector_beneficiado: data.sector_beneficiado.trim(),
      municipio: data.municipio.trim(),
      descripcion: data.descripcion.trim(),
      ministraciones: data.ministraciones.map((min) => ({
        ...min,
        rubros_presupuestales: min.rubros_presupuestales.map((rp) => ({
          ...rp,
          f_monto: String(rp.f_monto).trim(),
        })),
      })),
    }
  }

  static calcularSaldo(data: CalcularSaldo) {
    const { rubros, solicitudes, ajustes } = data

    let f_monto_total = 0
    let f_pa = 0
    let f_comprobado = 0
    let f_retenciones = 0
    let f_transferido = 0
    let f_reintegros = 0
    let f_ajuste_acreedores = 0

    for (const { f_monto, id_rubro } of rubros) {
      const f_monto_number = Number(f_monto)

      f_monto_total += f_monto_number

      if (id_rubro == rubrosPresupuestales.GESTION_FINANCIERA) {
        f_pa += f_monto_number
      }

      if (id_rubro === rubrosPresupuestales.EJECUTADO_EJERCICIOS_ANTERIORES) {
        f_transferido += f_monto_number
        f_comprobado += f_monto_number
      }
    }

    for (const sol of solicitudes) {
      const { i_tipo_gasto, id_partida_presupuestal, f_importe } = sol

      //Excepciones que se suman automaticamente
      if (
        i_tipo_gasto == tiposGasto.ASIMILADOS ||
        id_partida_presupuestal == rubrosPresupuestales.PAGOS_EXTRANJERO
      ) {
        f_comprobado += Number(f_importe)
      }

      f_transferido += Number(f_importe)
      f_retenciones += Number(sol.f_retenciones)

      for (const com of sol.comprobantes) {
        f_comprobado += Number(com.f_total)
        f_retenciones += Number(com.f_retenciones)
      }
    }

    for (const { i_tipo, f_total } of ajustes) {
      if (i_tipo == tiposAjusteProyecto.REINTEGRO) {
        f_reintegros += Number(f_total)
      } else if (i_tipo == tiposAjusteProyecto.ACREEDORES) {
        f_ajuste_acreedores += Number(f_total)
      }
    }

    const f_por_comprobar = f_transferido - f_comprobado + f_ajuste_acreedores
    const f_isr = f_por_comprobar > 0 ? f_por_comprobar * 0.35 : 0
    const f_ejecutado = f_transferido + f_retenciones + f_isr + f_pa
    const f_remanente = f_monto_total - f_ejecutado + f_reintegros
    const p_avance = numeroAdigitos((f_ejecutado * 100) / f_monto_total)

    return {
      f_monto_total: numeroAdigitos(f_monto_total),
      f_pa: numeroAdigitos(f_pa),
      f_solicitado: 0,
      f_transferido: numeroAdigitos(f_transferido),
      f_comprobado: numeroAdigitos(f_comprobado),
      f_retenciones: numeroAdigitos(f_retenciones),
      f_por_comprobar: numeroAdigitos(f_por_comprobar),
      f_isr: numeroAdigitos(f_isr),
      f_ejecutado: numeroAdigitos(f_ejecutado),
      f_remanente: numeroAdigitos(f_remanente),
      p_avance,
    }
  }

  static async obtener(queries: QueriesProyecto) {
    const { id, min } = queries

    if (min) return this.obtenerVMin(queries)
    if (id) return this.obtenerUno(id)
    try {
      const re = (await ProyectoDB.obtener(queries)) as ResProyectos

      const proyectosEstructurados: Proyecto[] = re.proyectos.map(
        (proyecto) => {
          const rubros = re.rubros.filter((pa) => pa.id_proyecto == proyecto.id)
          const solicitudes = re.solicitudes.filter(
            (sol) => sol.id_proyecto == proyecto.id
          )
          const ajustes = re.ajustes.filter(
            (ajuste) => ajuste.id_proyecto == proyecto.id
          )

          const calculoSaldo: CalcularSaldo = {
            rubros,
            solicitudes: solicitudes.map((sol) => ({
              ...sol,
              comprobantes: re.comprobantes.filter(
                ({ id_solicitud_presupuesto }) =>
                  id_solicitud_presupuesto == sol.id
              ),
            })),
            ajustes,
          }

          return {
            ...proyecto,
            tipo_financiamiento: this.obtenerTipoFinanciamiento(
              proyecto.i_tipo_financiamiento
            ),
            saldo: this.calcularSaldo(calculoSaldo),
          }
        }
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        proyectosEstructurados
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener proyectos, contactar a soporte",
        error
      )
    }
  }

  static async obtenerUno(id_proyecto: number) {
    try {
      const re = (await ProyectoDB.obtenerUno(id_proyecto)) as ResProyectos

      const {
        proyectos,
        comprobantes,
        ministraciones,
        rubros_ministracion,
        colaboradores,
        proveedores,
        solicitudes,
        notas,
        ajustes,
      } = re

      const proyectoDB = proyectos[0]

      const proyectoSaldo = {
        rubros: rubros_ministracion,
        solicitudes: solicitudes
          .filter(({ i_estatus }) =>
            [estatusSolicitud.AUTORIZADA, estatusSolicitud.PROCESADA].includes(
              i_estatus
            )
          )
          .map((sol) => ({
            ...sol,
            comprobantes: comprobantes.filter(
              ({ id_solicitud_presupuesto }) =>
                id_solicitud_presupuesto == sol.id
            ),
          })),
        ajustes,
      }

      const dataProyecto = {
        ...proyectoDB,
        tipo_financiamiento: this.obtenerTipoFinanciamiento(
          proyectoDB.i_tipo_financiamiento
        ),
        saldo: this.calcularSaldo(proyectoSaldo),
      }

      const ministracionesConRubros: MinistracionProyecto[] =
        ministraciones.map((ministracion) => {
          const rubros_presupuestales = rubros_ministracion.filter(
            (rb) => rb.id_ministracion == ministracion.id
          )

          //transformar los montos de los rubros a numero
          const dataTransformada = rubros_presupuestales.map((rp) => ({
            ...rp,
            f_monto: Number(rp.f_monto),
          }))

          return {
            ...ministracion,
            rubros_presupuestales: dataTransformada,
          }
        })

      const colaboradoresHyd = colaboradores.map((col) =>
        ColaboradorServices.formatData(col)
      )

      const proveedoresHyd = proveedores.map((prov) =>
        ProveedorServices.formatData(prov)
      )

      const solicitudesHyd = solicitudes.map((sol) => {
        return {
          ...sol,
          tipo_gasto: SolicitudesPresupuestoServices.obtenerTipoGasto(
            sol.i_tipo_gasto
          ),
          f_importe: Number(sol.f_importe),
          estatus: obtenerEstatusSolicitud(sol.i_estatus),
        }
      })

      const ajustesHyd = ajustes.map((ajuste) => {
        return {
          ...ajuste,
          tipo: obtenerTipoAjuste(ajuste.i_tipo),
          f_total: Number(ajuste.f_total),
          dt_ajuste: inputDateAformato(ajuste.dt_ajuste),
          dt_registro: epochAFecha(ajuste.dt_registro),
        }
      })

      const proyecto: Proyecto = {
        ...dataProyecto,
        ministraciones: ministracionesConRubros,
        colaboradores: colaboradoresHyd,
        proveedores: proveedoresHyd,
        solicitudes_presupuesto: solicitudesHyd,
        notas,
        ajustes: ajustesHyd,
      }

      return RespuestaController.exitosa(200, "Consulta exitosa", proyecto)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener proyecto, contactar a soporte",
        error
      )
    }
  }

  static async obtenerData(id_proyecto: number) {
    try {
      const reData = await ProyectoDB.obtenerData(id_proyecto)

      return RespuestaController.exitosa(200, "Consulta exitosa", reData)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener datos del proyecto, contactar a soporte",
        error
      )
    }
  }

  static async crear(data: Proyecto) {
    try {
      const payload = this.trimPayload(data)
      const cr = await ProyectoDB.crear(payload)

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear proyecto, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const payload = this.trimPayload(data)
      const up = await ProyectoDB.actualizar(id_proyecto, payload)

      return RespuestaController.exitosa(
        200,
        "Proyecto actualizado con éxito",
        up
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar proyecto, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ProyectoDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar proyecto, contactar a soporte",
        null
      )
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
        "Error al obtener notas del proyecto",
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

  static async obtenerDataAjuste(id_proyecto: number) {
    try {
      const re = await ProyectoDB.obtenerDataAjuste(id_proyecto)
      return RespuestaController.exitosa(
        200,
        "Data de ajuste proyecto obtenida con éxito",
        re
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener data de ajuste proyecto",
        error
      )
    }
  }

  static async obtenerAjuste(id_ajuste: number) {
    const re = await ProyectoDB.obtenerAjuste(id_ajuste)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener ajuste de proyecto",
        re.data
      )
    }

    const ajuste = re.data[0] as AjusteProyecto
    const ajusteHyd: AjusteProyecto = {
      ...ajuste,
      f_total: Number(ajuste.f_total),
      dt_registro: epochAFecha(ajuste.dt_registro),
      notas: [],
    }

    return RespuestaController.exitosa(
      200,
      "Ajuste de proyecto obtenido con éxito",
      ajusteHyd
    )
  }

  static async crearAjuste(id_proyecto: number, data: AjusteProyecto) {
    const cr = await ProyectoDB.crearAjuste(id_proyecto, data)

    if (cr.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear ajuste de proyecto",
        cr.data
      )
    }

    return RespuestaController.exitosa(
      201,
      "Ajuste de proyecto creado con éxito",
      null
    )
  }

  static async editarAjuste(data: AjusteProyecto) {
    const up = await ProyectoDB.editarAjuste(data)

    if (up.error) {
      return RespuestaController.fallida(
        400,
        "Error al editar ajuste de proyecto",
        up.data
      )
    }

    return RespuestaController.exitosa(
      201,
      "Ajuste de proyecto actualizado con éxito",
      null
    )
  }

  static async borrarAjuste(id_ajuste: number) {
    const cr = await ProyectoDB.borrarAjuste(id_ajuste)

    if (cr.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar ajuste de proyecto",
        cr.data
      )
    }

    return RespuestaController.exitosa(
      201,
      "Ajuste de proyecto borrado con éxito",
      null
    )
  }

  static async crearAjusteNota(id_ajuste: number, data: NotaAjuste) {
    try {
      const cr = await ProyectoDB.crearAjusteNota(id_ajuste, data)

      const notasRecargadas = cr.map((nota) => {
        return {
          ...nota,
          dt_registro: epochAFecha(nota.dt_registro),
        }
      })

      return RespuestaController.exitosa(
        201,
        "Notas de ajuste de proyecto obtenidas con éxito",
        notasRecargadas
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de ajuste de proyecto",
        error
      )
    }
  }
}

export { ProyectosServices }
