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
} from "@models/proyecto.model"

import { ResProyectos } from "@api/models/proyecto.model"
import { epochAFecha, obtenerEstatusSolicitud } from "@assets/utils/common"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"
import {
  estatusSolicitud,
  rubrosPresupuestales,
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
    const { rubros, solicitudes } = data

    let f_monto_total = 0
    let f_pa = 0
    let f_comprobado = 0
    let f_retenciones = 0
    let f_transferido = 0

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

    const f_por_comprobar = f_transferido - f_comprobado
    const f_isr = f_por_comprobar * 0.35
    const f_ejecutado = f_transferido + f_retenciones + f_isr + f_pa
    const f_remanente = f_monto_total - f_ejecutado
    const p_avance = Number(((f_ejecutado * 100) / f_monto_total).toFixed(2))

    return {
      f_monto_total,
      f_pa,
      f_solicitado: 0,
      f_transferido,
      f_comprobado,
      f_retenciones,
      f_por_comprobar,
      f_isr: f_isr < 0 ? 0 : f_isr, //evitar que isr de numero negativo
      f_ejecutado,
      f_remanente,
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

          const calculoSaldo: CalcularSaldo = {
            rubros,
            solicitudes: solicitudes.map((sol) => ({
              ...sol,
              comprobantes: re.comprobantes.filter(
                ({ id_solicitud_presupuesto }) =>
                  id_solicitud_presupuesto == sol.id
              ),
            })),
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

      const proyecto: Proyecto = {
        ...dataProyecto,
        ministraciones: ministracionesConRubros,
        colaboradores: colaboradoresHyd,
        proveedores: proveedoresHyd,
        solicitudes_presupuesto: solicitudesHyd,
        notas,
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
}

export { ProyectosServices }
