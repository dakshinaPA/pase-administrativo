import { SolicitudesPresupuestoDB } from "@api/db/solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import {
  ResSolicitudPresupuestoDB,
  SolicitudesDB,
} from "@api/models/solicitudes-presupuesto.model"
import {
  SolicitudPresupuesto,
  TipoGastoSolicitud,
  EstatusSolicitud,
  ComprobanteSolicitud,
  QueriesSolicitud,
  PayloadCambioEstatus,
  NotaSolicitud,
} from "@models/solicitud-presupuesto.model"
import {
  epochAFecha,
  obtenerEstatusSolicitud,
  obtenerMetodoPago,
} from "@assets/utils/common"

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

  static trasnformarData(
    solicitudRes: SolicitudPresupuesto
  ): SolicitudPresupuesto {
    const { i_tipo_gasto, f_importe, i_estatus, comprobantes } = solicitudRes

    const f_total_comprobaciones = comprobantes.reduce(
      (acum, com) => acum + Number(com.f_total),
      0
    )
    const f_total_impuestos_retenidos = comprobantes.reduce(
      (acum, com) => acum + Number(com.f_retenciones),
      0
    )

    return {
      ...solicitudRes,
      tipo_gasto: this.obtenerTipoGasto(i_tipo_gasto),
      f_importe: Number(f_importe),
      estatus: obtenerEstatusSolicitud(i_estatus),
      saldo: {
        f_total_comprobaciones,
        f_monto_comprobar: Number(f_importe) - f_total_comprobaciones,
        f_total_impuestos_retenidos,
        f_total: Number(f_importe) + f_total_impuestos_retenidos,
      },
    }
  }

  static tranformDataComprobantes(
    comprobanteRes: ComprobanteSolicitud
  ): ComprobanteSolicitud {
    return {
      ...comprobanteRes,
      metodo_pago: obtenerMetodoPago(comprobanteRes.i_metodo_pago),
    }
  }

  static async obtener(queries: QueriesSolicitud) {
    if (queries.id) return this.obtenerUna(queries.id)
    try {
      const re = (await SolicitudesPresupuestoDB.obtener(
        queries
      )) as SolicitudesDB

      //hacer match de solicitudes con comprobantes
      const solicitudesDB = re.solicitudes.map((sol) => {
        const comprobantes = re.comprobantes.filter(
          (comp) => comp.id_solicitud_presupuesto == sol.id
        )

        return {
          ...sol,
          comprobantes,
        }
      })

      const solicitudes: SolicitudPresupuesto[] = solicitudesDB.map((sol) =>
        this.trasnformarData(sol)
      )

      return RespuestaController.exitosa(200, "Consulta exitosa", solicitudes)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener solicitudes de presupuesto",
        error?.message || error
      )
    }
  }

  static async obtenerUna(id: number) {
    try {
      const re = (await SolicitudesPresupuestoDB.obtenerUna(
        id
      )) as ResSolicitudPresupuestoDB[]

      const solicitud = this.trasnformarData(re[0])
      
      return RespuestaController.exitosa(200, "Consulta exitosa", [solicitud])
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener solicitudes de presupuesto",
        error?.message || error
      )
    }
  }

  static async crear(data: SolicitudPresupuesto) {
    try {
      const cr = await SolicitudesPresupuestoDB.crear(data)

      return RespuestaController.exitosa(
        201,
        "Solicitud de presupuesto creada con éxito",
        { idInsertado: cr }
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear solicitud de presupuesto",
        error
      )
    }
  }

  static async actualizar(id: number, data: SolicitudPresupuesto) {
    try {
      const up = await SolicitudesPresupuestoDB.actualizar(id, data)

      return RespuestaController.exitosa(
        200,
        "Solicitud de presupuesto actualizada con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar solicitud de presupuesto",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await SolicitudesPresupuestoDB.borrar(id)
    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar solicitud de presupuesto",
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
    const up = await SolicitudesPresupuestoDB.cambiarEstatus(payload)

    if (up.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar estatus de solicitudes de presupuesto",
        up.data
      )
    }

    return RespuestaController.exitosa(
      200,
      "Estatus de solicitudes de presupuesto actualizados con éxito",
      null
    )
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
