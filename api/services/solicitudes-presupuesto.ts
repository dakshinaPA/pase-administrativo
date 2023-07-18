import { SolicitudesPresupuestoDB } from "@api/db/solicitudes-presupuesto"
import { RespuestaController } from "@api/utils/response"
import { ResSolicitudPresupuestoDB } from "@api/models/solicitudes-presupuesto.model"
import {
  SolicitudPresupuesto,
  TipoGastoSolicitud,
  EstatusSolicitud,
  ComprobanteSolicitud,
  QueriesSolicitud,
  PayloadCambioEstatus,
  NotaSolicitud,
} from "@models/solicitud-presupuesto.model"
import { epochAFecha, obtenerEstatusSolicitud } from "@assets/utils/common"

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
            id_responsable,
            proyecto,
            i_tipo_gasto,
            clabe,
            id_banco,
            banco,
            titular_cuenta,
            email,
            proveedor,
            descripcion_gasto,
            id_partida_presupuestal,
            rubro,
            f_importe,
            f_total_comprobaciones,
            f_total_impuestos_retenidos,
            i_estatus,
            dt_registro,
          } = solicitud

          let comprobantes: ComprobanteSolicitud[] = null
          let notas: NotaSolicitud[] = null

          if (id_solicitud) {
            const reComprobantes = this.obtenerComprobantes(id_solicitud)
            const reNotas = this.obtenerNotas(id_solicitud)

            const resCombinadas = await Promise.all([reComprobantes, reNotas])

            for (const rc of resCombinadas) {
              if (rc.error) throw rc.data
            }

            comprobantes = resCombinadas[0].data as ComprobanteSolicitud[]
            notas = resCombinadas[1].data as NotaSolicitud[]
          }

          return {
            id,
            id_proyecto,
            proyecto,
            id_responsable,
            i_tipo_gasto,
            tipo_gasto: this.obtenerTipoGasto(i_tipo_gasto),
            clabe,
            id_banco,
            banco,
            titular_cuenta,
            email,
            id_partida_presupuestal,
            rubro,
            proveedor,
            descripcion_gasto,
            f_importe: Number(f_importe),
            i_estatus,
            estatus: obtenerEstatusSolicitud(i_estatus),
            dt_registro,
            saldo: {
              f_total_comprobaciones,
              f_monto_comprobar: Number(f_importe) - f_total_comprobaciones,
              f_total_impuestos_retenidos,
            },
            comprobantes,
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

      await Promise.all(
        comprobantes.map(async (comprobante) => {
          const crComprobantes = await this.crearComprobante(
            idInsertado,
            comprobante
          )
          if (crComprobantes.error) throw crComprobantes.data
        })
      )

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

  static async actualizar(id: number, data: SolicitudPresupuesto) {
    try {
      const up = await SolicitudesPresupuestoDB.actualizar(id, data)
      const reComprobantes = await this.obtenerComprobantes(id)

      const promesas1 = await Promise.all([up, reComprobantes])

      for (const promesa of promesas1) {
        if (promesa.error) throw promesa.data
      }

      const { comprobantes } = data

      //insertar comprobantes nuevos
      for (const com of comprobantes) {
        if (!com.id) {
          const crComprobante = await this.crearComprobante(id, com)
          if (crComprobante.error) throw crComprobante.data
        }
      }

      //checar si se borro algun comprobantes
      const comprobantesActivosDB =
        reComprobantes.data as ComprobanteSolicitud[]
      for (const ca of comprobantesActivosDB) {
        const matchVista = comprobantes.find(
          (comprobante) => comprobante.id == ca.id
        )
        if (!matchVista) {
          const dlComprobante =
            await SolicitudesPresupuestoDB.borrarComprobante(ca.id)
          if (dlComprobante.error) throw dlComprobante.data
        }
      }

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

  static async obtenerComprobantes(id_solicitud: number) {
    const determinarMetodoPago = (i_metodo_pago: number) => {
      let metodo_pago: "PUE" | "PPD" = "PUE"

      if (i_metodo_pago == 2) {
        metodo_pago = "PPD"
      }

      return metodo_pago
    }

    const re = await SolicitudesPresupuestoDB.obtenerComprobantes(id_solicitud)
    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener comprobantes de solicitud",
        re.data
      )
    }

    const comprobantes = re.data as ComprobanteSolicitud[]
    const comprobantesHidratados: ComprobanteSolicitud[] = comprobantes.map(
      (comprobante) => ({
        ...comprobante,
        metodo_pago: determinarMetodoPago(comprobante.i_metodo_pago),
      })
    )

    return RespuestaController.exitosa(
      200,
      "Comprobantes de solicitud obtenidos con éxito",
      comprobantesHidratados
    )
  }

  static async crearComprobante(
    id_solicitud: number,
    data: ComprobanteSolicitud
  ) {
    try {
      const cr = await SolicitudesPresupuestoDB.crearComprobante(
        id_solicitud,
        data
      )
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

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

  static async actualizarEstatus(
    id_solicitud: number,
    i_estatus: EstatusSolicitud
  ) {
    const up = await SolicitudesPresupuestoDB.actualizarEstatus(
      id_solicitud,
      i_estatus
    )
    if (up.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar estatus de solicitud de presupuesto",
        up.data
      )
    }

    const res = {
      i_estatus,
      estatus: obtenerEstatusSolicitud(i_estatus),
    }

    return RespuestaController.exitosa(
      200,
      "Estatus de solicitud de presupuesto actualizada con éxito",
      res
    )
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
