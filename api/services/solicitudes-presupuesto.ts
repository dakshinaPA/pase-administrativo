import { SolicitudesPresupuestoDB } from "@api/db/solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import { ResSolicitudPresupuestoDB } from "@api/models/solicitudes-presupuesto.model"
import {
  SolicitudPresupuesto,
  TipoGastoSolicitud,
  EstatusSolicitud,
  ComprobanteSolicitud
} from "@models/solicitud-presupuesto.model"

class SolicitudesPresupuestoServices {
  static obtenerTipoGasto(i_tipo_gasto: TipoGastoSolicitud) {
    switch (i_tipo_gasto) {
      case 1:
        return "REEMBOLSO"
      case 2:
        return "PROGRAMACIÓN"
      case 3:
        return "ASIMILADOS A SALARIOS"
      case 4:
        return "HONORARIOS PROFESIONALES"
      case 5:
        return "GASTOS POR COMPROBAR"
    }
  }

  static obtenerEstatus(i_estatus: EstatusSolicitud) {
    switch (i_estatus) {
      case 1:
        return "REVISIÓN"
      case 2:
        return "APROBADA"
      case 3:
        return "PROCESADA"
      case 4:
        return "RECHAZADA"
    }
  }

  static async obtener(id_proyecto: number, id_solicitud: number) {
    try {
      const re = await SolicitudesPresupuestoDB.obtener(
        id_proyecto,
        id_solicitud
      )
      if (re.error) throw re.data

      const solicitudesDB = re.data as ResSolicitudPresupuestoDB[]

      const dataTransformada: SolicitudPresupuesto[] = await Promise.all(
        solicitudesDB.map(async (solicitud) => {
          const {
            id,
            id_proyecto,
            i_tipo_gasto,
            clabe,
            id_banco,
            titular_cuenta,
            rfc_titular,
            email_titular,
            proveedor,
            descripcion_gasto,
            id_partida_presupuestal,
            f_importe,
            f_monto_comprobar,
            i_estatus,
            dt_registro,
          } = solicitud

          let comprobantes: ComprobanteSolicitud[] = null

          if (id_solicitud) {
            const reComprobantes = await SolicitudesPresupuestoDB.obtenerComprobantes(id_solicitud)
            if(reComprobantes.error) throw reComprobantes.data
            comprobantes = reComprobantes.data as ComprobanteSolicitud[]
          }

          return {
            id,
            id_proyecto,
            i_tipo_gasto,
            tipo_gasto: this.obtenerTipoGasto(i_tipo_gasto),
            cuenta: {
              clabe,
              id_banco,
              titular: titular_cuenta,
              rfc: rfc_titular,
              email: email_titular,
            },
            proveedor,
            descripcion_gasto,
            id_partida_presupuestal,
            f_importe,
            f_monto_comprobar,
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
