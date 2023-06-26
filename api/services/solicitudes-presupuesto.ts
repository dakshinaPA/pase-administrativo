import { SolicitudesPresupuestoDB } from "@api/db/solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import { ResSolicitudPresupuestoDB } from "@api/models/solicitudes-presupuesto.model"
import {
  SolicitudPresupuesto,
  TipoGastoSolicitud,
  EstatusSolicitud,
  ComprobanteSolicitud,
  QueriesSolicitud,
} from "@models/solicitud-presupuesto.model"

class SolicitudesPresupuestoServices {
  static obtenerTipoGasto(i_tipo_gasto: TipoGastoSolicitud) {
    switch (i_tipo_gasto) {
      case 1:
        return "Reembolso"
      case 2:
        return "Programación"
      case 3:
        return "Asimilados a salarios"
      case 4:
        return "Honorarios Profesionales"
      case 5:
        return "Gastos por comprobar"
    }
  }

  static obtenerEstatus(i_estatus: EstatusSolicitud) {
    switch (i_estatus) {
      case 1:
        return "Revisión"
      case 2:
        return "Autorizada"
      case 3:
        return "Rechazada"
      case 4:
        return "Procesada"
      case 5:
        return "Devolución"
    }
  }

  static async obtener(queries: QueriesSolicitud) {
    const id_solicitud = Number(queries.id)

    try {
      const re = await SolicitudesPresupuestoDB.obtener(queries)
      if (re.error) throw re.data

      const solicitudesDB = re.data as ResSolicitudPresupuestoDB[]

      const dataTransformada: SolicitudPresupuesto[] = await Promise.all(
        solicitudesDB.map(async (solicitud) => {
          const {
            id,
            id_proyecto,
            proyecto,
            i_tipo_gasto,
            clabe,
            id_banco,
            titular_cuenta,
            rfc_titular,
            email_titular,
            proveedor,
            descripcion_gasto,
            id_partida_presupuestal,
            rubro,
            f_importe,
            // f_monto_comprobar,
            i_estatus,
            dt_registro,
          } = solicitud

          let comprobantes: ComprobanteSolicitud[] = null

          if (id_solicitud) {
            const reComprobantes =
              await SolicitudesPresupuestoDB.obtenerComprobantes(id_solicitud)
            if (reComprobantes.error) throw reComprobantes.data
            comprobantes = reComprobantes.data as ComprobanteSolicitud[]
          }

          return {
            id,
            i_tipo_gasto,
            tipo_gasto: this.obtenerTipoGasto(i_tipo_gasto),
            id_proyecto,
            proyecto,
            clabe,
            id_banco,
            titular: titular_cuenta,
            rfc: rfc_titular,
            email: email_titular,
            id_partida_presupuestal,
            rubro,
            proveedor,
            descripcion_gasto,
            f_importe,
            // f_monto_comprobar: "0",
            i_estatus,
            estatus: this.obtenerEstatus(i_estatus),
            dt_registro,
            comprobantes,
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
        "Error al obtener solicitudes de presupuesto",
        error
      )
    }
  }

  static async crear(data: SolicitudPresupuesto) {
    try {
      const { comprobantes } = data
      const cr = await SolicitudesPresupuestoDB.crear(data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const crComprobantes = await Promise.all(
        comprobantes.map(async (comprobante) => {
          return await SolicitudesPresupuestoDB.crearComprobante(
            idInsertado,
            comprobante
          )
        })
      )

      for (const cc of crComprobantes) {
        if (cc.error) throw cc.data
      }

      return RespuestaController.exitosa(
        201,
        "Solicitud de presupuesto creada con éxito",
        { idInsertado }
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear solicitud de presupuesto",
        error
      )
    }
  }

  // static async actualizar(id: number, data: SolicitudPresupuesto) {
  //   const res = await PresupuestoDB.actualizar(id, data)
  //   if (res.error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al actualziar solicitud de presupuesto",
  //       res.data
  //     )
  //   }
  //   return RespuestaController.exitosa(
  //     200,
  //     "Solicitud de presupuesto actualizada con éxito",
  //     res.data
  //   )
  // }

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
}

export { SolicitudesPresupuestoServices }
