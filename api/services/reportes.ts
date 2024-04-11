import { ReportesDB } from "@api/db/reportes"
import {
  ColaboradorReportes,
  ComprobanteReportes,
} from "@api/models/reportes.model"
import { RespuestaController } from "@api/utils/response"
import { epochAFecha, inputDateAformato } from "@assets/utils/common"
import { ColaboradorServices } from "./colaboradores"

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
          dt_registro: epochAFecha(comprobante.dt_registro),
          dt_timbrado: comprobante.dt_timbrado
            ? epochAFecha(comprobante.dt_timbrado)
            : "",
          dt_pago: comprobante.dt_pago ? epochAFecha(comprobante.dt_pago) : "",
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

  static async obtenerColaboradores() {
    try {
      const re = await ReportesDB.obtenerColaboradores()
      if (re.error) throw re.data

      const colaboradores = re.data as ColaboradorReportes[]
      const dataHyd: ColaboradorReportes[] = colaboradores.map((col) => {
        const id_empleado = `${col.id_alt_proyecto.replaceAll("_", "")}_${
          col.id_colaborador
        }`

        return {
          ...col,
          id_empleado,
          tipo: ColaboradorServices.obtenerTipo(col.i_tipo).toLocaleUpperCase(),
          f_monto: Number(col.f_monto),
          dt_inicio: inputDateAformato(col.dt_inicio),
          dt_fin: inputDateAformato(col.dt_fin),
        }
      })

      return RespuestaController.exitosa(
        200,
        "Reporte de colaboradores obtenido con éxito",
        dataHyd
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener reporte de colaboradores",
        error
      )
    }
  }
}

export { ReportesServices }
