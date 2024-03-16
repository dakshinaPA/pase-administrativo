import { RespuestaDB } from "@api/utils/response"
import { queryDB } from "./query"

class ReportesDB {
  static async obtenerComprobantes() {
    const query = `
      SELECT spc.id, spc.id_solicitud_presupuesto, spc.folio_fiscal, spc.f_total, spc.f_retenciones, spc.f_isr, spc.f_iva, spc.i_metodo_pago, spc.id_forma_pago, spc.id_regimen_fiscal_emisor, spc.rfc_emisor, spc.dt_timbrado, spc.dt_registro,
      fp.nombre forma_pago, fp.clave clave_forma_pago,
      rf.nombre regimen_fiscal, rf.clave clave_regimen_fiscal,
      sp.id_proyecto, sp.id_partida_presupuestal, sp.titular_cuenta, sp.dt_pago,
      rp.nombre partida_presupuestal,
      p.id_alt id_alt_proyecto, p.nombre proyecto
      FROM solicitud_presupuesto_comprobantes spc
      JOIN formas_pago fp ON spc.id_forma_pago = fp.id
      JOIN regimenes_fiscales rf ON spc.id_regimen_fiscal_emisor = rf.id
      JOIN solicitudes_presupuesto sp ON sp.id = spc.id_solicitud_presupuesto
      JOIN proyectos p ON p.id = sp.id_proyecto
      JOIN rubros_presupuestales rp ON rp.id = sp.id_partida_presupuestal
    `

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ReportesDB }
