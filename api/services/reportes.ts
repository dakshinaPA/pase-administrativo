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
      const colaboradoresFiltrados: ColaboradorReportes[] = []

      //filtrar los colaboradores sin pago y periodos de servicio activos
      for (const col of colaboradores) {
        if (col.i_tipo == 3 || col.ps_activo == 1) {
          colaboradoresFiltrados.push(col)
        }
      }

      const dataHyd: ColaboradorReportes[] = colaboradoresFiltrados.map(
        (col) => {
          const id_empleado = `${col.id_alt_proyecto.replaceAll("_", "")}_${
            col.id
          }`

          if (col.i_tipo == 3) {
            return {
              ...col,
              id_empleado,
              tipo: ColaboradorServices.obtenerTipo(col.i_tipo).toUpperCase(),
              i_numero_ministracion: 0,
              f_monto: 0,
              servicio: "",
              descripcion: "",
              cp: "",
              dt_inicio: "",
              dt_fin: "",
            }
          }

          return {
            ...col,
            id_empleado,
            tipo: ColaboradorServices.obtenerTipo(col.i_tipo).toUpperCase(),
            i_numero_ministracion: col.i_numero_ministracion || 0,
            f_monto: col.f_monto ? Number(col.f_monto) : 0,
            servicio: col.servicio || "",
            descripcion: col.descripcion || "",
            cp: col.cp || "",
            dt_inicio: col.dt_inicio ? inputDateAformato(col.dt_inicio) : "",
            dt_fin: col.dt_fin ? inputDateAformato(col.dt_fin) : "",
          }
        }
      )

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
