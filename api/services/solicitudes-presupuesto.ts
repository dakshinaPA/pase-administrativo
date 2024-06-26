import { SolicitudesPresupuestoDB } from "@api/db/solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import { SolicitudesDB } from "@api/models/solicitudes-presupuesto.model"
import {
  SolicitudPresupuesto,
  TipoGastoSolicitud,
  ComprobanteSolicitud,
  QueriesSolicitud,
  PayloadCambioEstatus,
  NotaSolicitud,
  EstatusSolicitud,
} from "@models/solicitud-presupuesto.model"
import {
  epochAFecha,
  epochAInputDate,
  inputDateAEpoch,
  obtenerEstatusSolicitud,
  obtenerMetodoPago,
} from "@assets/utils/common"
import { IdRolUsuario } from "@models/usuario.model"
import {
  estatusSolicitud,
  rolesUsuario,
  rubrosPresupuestales,
  tiposGasto,
} from "@assets/utils/constantes"
import solicitudesPresupuesto from "pages/api/solicitudes-presupuesto"

class SolicitudesPresupuestoServices {
  static obtenerTipoGasto(i_tipo_gasto: TipoGastoSolicitud) {
    switch (i_tipo_gasto) {
      case 1:
        return "Reembolso"
      case 2:
        return "Pago a proveedor"
      case 3:
        return "Asimilados a salarios"
      case 4:
        return "Honorarios Profesionales"
      case 5:
        return "Gastos por comprobar"
    }
  }

  static trimPayload(data: SolicitudPresupuesto): SolicitudPresupuesto {
    return {
      ...data,
      email: data.email.trim(),
      proveedor: data.proveedor.trim(),
      descripcion_gasto: data.descripcion_gasto.trim(),
      f_importe: Number(data.f_importe),
      f_retenciones: Number(data.f_retenciones),
    }
  }

  static trasnformarData(
    solicitudRes: SolicitudPresupuesto
  ): SolicitudPresupuesto {
    const {
      i_tipo_gasto,
      id_partida_presupuestal,
      f_importe,
      f_retenciones,
      i_estatus,
      comprobantes,
    } = solicitudRes

    const f_total_comprobaciones =
      i_tipo_gasto == tiposGasto.ASIMILADOS ||
      id_partida_presupuestal == rubrosPresupuestales.PAGOS_EXTRANJERO
        ? Number(f_importe)
        : comprobantes.reduce((acum, com) => acum + Number(com.f_total), 0)
    const f_total_impuestos_retenidos =
      comprobantes.reduce((acum, com) => acum + Number(com.f_retenciones), 0) +
      Number(f_retenciones)
    const f_total_iva = comprobantes.reduce(
      (acum, com) => acum + Number(com.f_iva),
      0
    )
    const f_total_isr = comprobantes.reduce(
      (acum, com) => acum + Number(com.f_isr),
      0
    )
    const f_monto_comprobar = Number(f_importe) - f_total_comprobaciones

    return {
      ...solicitudRes,
      tipo_gasto: this.obtenerTipoGasto(i_tipo_gasto),
      f_importe: Number(f_importe),
      f_retenciones: Number(f_retenciones),
      estatus: obtenerEstatusSolicitud(i_estatus),
      saldo: {
        f_total_comprobaciones,
        f_monto_comprobar,
        f_total_impuestos_retenidos,
        f_total_iva,
        f_total_isr,
        f_total: Number(f_importe) + f_total_impuestos_retenidos,
      },
    }
  }

  static tranformDataComprobantes(
    comprobanteRes: ComprobanteSolicitud
  ): ComprobanteSolicitud {
    const { i_metodo_pago, dt_timbrado } = comprobanteRes
    return {
      ...comprobanteRes,
      metodo_pago: obtenerMetodoPago(i_metodo_pago),
      id_regimen_fiscal_receptor: 2,
      uso_cfdi: "G03",
      dt_timbrado: dt_timbrado ? epochAInputDate(dt_timbrado) : "",
    }
  }

  static async obtener(queries: QueriesSolicitud) {
    if (queries.id) return this.obtenerUna(queries.id)
    try {
      const queriesHyd: QueriesSolicitud = {
        ...queries,
        dt_inicio: queries.dt_inicio
          ? String(inputDateAEpoch(queries.dt_inicio))
          : null,
        dt_fin: queries.dt_fin ? String(inputDateAEpoch(queries.dt_fin)) : null,
      }

      const re = (await SolicitudesPresupuestoDB.obtener(
        queriesHyd
      )) as SolicitudesDB

      //hacer match de solicitudes con comprobantes
      const solicitudesDB: SolicitudPresupuesto[] = re.solicitudes.map(
        (sol) => {
          const comprobantes = re.comprobantes.filter(
            (comp) => comp.id_solicitud_presupuesto == sol.id
          )
          const notas = re.notas.filter((nota) => nota.id_solicitud == sol.id)
          const titular =
            sol.i_tipo_gasto == tiposGasto.PAGO_A_PROVEEDOR
              ? re.proveedores.find(({ id }) => id == sol.id_titular_cuenta)
              : re.colaboradores.find(({ id }) => id == sol.id_titular_cuenta)

          return {
            ...sol,
            rfc_titular: titular?.rfc,
            email_titular: titular?.email,
            comprobantes,
            notas,
          }
        }
      )

      const solicitudes: SolicitudPresupuesto[] = solicitudesDB.map((sol) =>
        this.trasnformarData(sol)
      )

      return RespuestaController.exitosa(200, "Consulta exitosa", solicitudes)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener solicitudes de presupuesto, contactar a soporte",
        error?.message || error
      )
    }
  }

  static async obtenerUna(id: number) {
    try {
      const re = (await SolicitudesPresupuestoDB.obtenerUna(
        id
      )) as SolicitudPresupuesto[]

      const solicitud = this.trasnformarData(re[0])

      const solicitudComprobantes: SolicitudPresupuesto = {
        ...solicitud,
        comprobantes: solicitud.comprobantes.map(this.tranformDataComprobantes),
      }

      return RespuestaController.exitosa(200, "Consulta exitosa", [
        solicitudComprobantes,
      ])
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener solicitud de presupuesto, contactar a soporte",
        error?.message || error
      )
    }
  }

  static async crear(data: SolicitudPresupuesto) {
    try {
      let payload = this.trimPayload(data)
      payload = {
        ...payload,
        comprobantes: payload.comprobantes.map((com) => ({
          ...com,
          dt_timbrado: com.dt_timbrado
            ? String(inputDateAEpoch(com.dt_timbrado))
            : "",
        })),
      }
      const cr = await SolicitudesPresupuestoDB.crear(payload)

      return RespuestaController.exitosa(
        201,
        "Solicitud de presupuesto creada con éxito",
        { idInsertado: cr }
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear solicitud de presupuesto, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(
    id: number,
    data: SolicitudPresupuesto,
    id_rol: IdRolUsuario
  ) {
    try {
      let payload = this.trimPayload(data)
      payload = {
        ...payload,
        i_estatus:
          id_rol === rolesUsuario.COPARTE &&
          [estatusSolicitud.RECHAZADA, estatusSolicitud.DEVOLUCION].includes(
            data.i_estatus
          )
            ? (estatusSolicitud.REVISION as EstatusSolicitud)
            : data.i_estatus,
        dt_pago:
          data.i_estatus == estatusSolicitud.PROCESADA && data.dt_pago
            ? String(inputDateAEpoch(data.dt_pago))
            : "",
        comprobantes: data.comprobantes.map((com) => ({
          ...com,
          dt_timbrado: com.dt_timbrado
            ? String(inputDateAEpoch(com.dt_timbrado))
            : "",
        })),
      }
      const up = await SolicitudesPresupuestoDB.actualizar(id, payload)

      return RespuestaController.exitosa(
        200,
        "Solicitud de presupuesto actualizada con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar solicitud de presupuesto, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await SolicitudesPresupuestoDB.borrar(id)
    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar solicitud de presupuesto, contactar a soporte",
        dl.data
      )
    }

    return RespuestaController.exitosa(
      200,
      "Solicitud de presupuesto borrada con éxito",
      dl.data
    )
  }

  static async buscarFactura(folio: string) {
    try {
      const re = await SolicitudesPresupuestoDB.buscarFactura(folio)
      if (re.error) throw re.data

      const folioEncontrando = re.data[0]

      if (folioEncontrando) {
        return RespuestaController.exitosa(
          201,
          "La factura seleccionada ya ha sido usada anteriormente",
          true
        )
      } else {
        return RespuestaController.exitosa(
          201,
          "La factura seleccionada no ha sido usada anteriormente",
          false
        )
      }
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al buscar folio de factura",
        error
      )
    }
  }

  static async cambiarEstatus(payload: PayloadCambioEstatus) {
    try {
      const i_estatus = Number(payload.i_estatus) as EstatusSolicitud
      let dt_pago = payload.dt_pago
      //no puede ir con estatus 0
      if (!i_estatus) throw i_estatus
      if (i_estatus !== estatusSolicitud.PROCESADA) {
        dt_pago = ""
      } else {
        if (!dt_pago) throw "Falta fecha de pago"
        dt_pago = String(inputDateAEpoch(dt_pago))
      }

      //verificar payload
      const data: PayloadCambioEstatus = {
        ...payload,
        i_estatus,
        dt_pago,
      }

      const up = await SolicitudesPresupuestoDB.cambiarEstatus(data)
      if (up.error) throw up.data

      return RespuestaController.exitosa(
        200,
        "Estatus de solicitudes de presupuesto actualizados con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar estatus de solicitudes de presupuesto, contactar a soporte",
        error
      )
    }
  }

  static async obtenerNotas(id_solicitud: number) {
    const re = await SolicitudesPresupuestoDB.obtenerNotas(id_solicitud)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener notas del financiador",
        re.data
      )
    }

    let notas = re.data as NotaSolicitud[]
    notas = notas.map((nota) => {
      return {
        ...nota,
        dt_registro: epochAFecha(nota.dt_registro),
      }
    })

    return RespuestaController.exitosa(200, "consulta exitosa", notas)
  }

  static async crearNota(id_solicitud: number, data: NotaSolicitud) {
    const cr = await SolicitudesPresupuestoDB.crearNota(id_solicitud, data)

    if (cr.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de solicitud",
        cr.data
      )
    }

    // @ts-ignore
    const idInsertado = cr.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de solicitud creada con éxito",
      { idInsertado }
    )
  }
}

export { SolicitudesPresupuestoServices }
