import { ReportesDB } from "@api/db/reportes"
import { ComprobanteReportes } from "@api/models/reportes.model"
import { RespuestaController } from "@api/utils/response"
import { epochAFecha } from "@assets/utils/common"

class ReportesServices {
  static async obtenerComprobantes() {
    try {
      const re = await ReportesDB.obtenerComprobantes()
      if (re.error) throw re.data

      const comprobantes = re.data as ComprobanteReportes[]
      const dataHyd = comprobantes.map((comprobante) => {
        return {
          ...comprobante,
          f_total: Number(comprobante.f_total),
          f_retenciones: Number(comprobante.f_retenciones),
          f_isr: Number(comprobante.f_isr),
          f_iva: Number(comprobante.f_iva),
          dt_registro: epochAFecha(comprobante.dt_registro)
        }
      })

      return RespuestaController.exitosa(
        200,
        "Folios fiscales obtenidos con éxito",
        dataHyd
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener folios fiscales",
        error
      )
    }
  }
}

export { ReportesServices }
