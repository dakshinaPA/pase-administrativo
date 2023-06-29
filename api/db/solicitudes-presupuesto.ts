import { queryDB, queryDBPlaceHolder } from "./query"
import {
  SolicitudPresupuesto,
  ComprobanteSolicitud,
  QueriesSolicitud,
} from "@models/solicitud-presupuesto.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

class SolicitudesPresupuestoDB {
  static async obtener(queries: QueriesSolicitud) {
    const { id, id_proyecto, id_responsable } = queries

    let query = `SELECT sp.id, sp.id_proyecto, sp.i_tipo_gasto, sp.clabe, sp.id_banco, sp.titular_cuenta, sp.rfc_titular,
    sp.email_titular, sp.proveedor, sp.descripcion_gasto, sp.id_partida_presupuestal, sp.f_importe, sp.i_estatus, sp.dt_registro,
    p.id_alt proyecto,
    b.nombre banco,
    r.nombre rubro
    FROM solicitudes_presupuesto sp
    JOIN proyectos p ON sp.id_proyecto=p.id
    JOIN bancos b ON sp.id_banco=b.id
    JOIN rubros_presupuestales r ON sp.id_partida_presupuestal=r.id
    WHERE sp.b_activo=1`

    if (id_proyecto) {
      query += ` AND sp.id_proyecto=${id_proyecto}`
    }

    if (id) {
      query += ` AND sp.id=${id}`
    }

    if (id_responsable) {
      query += ` AND p.id_responsable=${id}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: SolicitudPresupuesto) {
    const {
      id_proyecto,
      i_tipo_gasto,
      clabe,
      id_banco,
      titular,
      rfc,
      email,
      proveedor,
      descripcion_gasto,
      id_partida_presupuestal,
      f_importe,
      // f_monto_comprobar,
    } = data

    const query = `INSERT INTO solicitudes_presupuesto (id_proyecto, i_tipo_gasto, clabe, id_banco, titular_cuenta, rfc_titular, email_titular, proveedor,
      descripcion_gasto, id_partida_presupuestal, f_importe, i_estatus, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const placeHolders = [
      id_proyecto,
      i_tipo_gasto,
      clabe,
      id_banco,
      titular,
      rfc,
      email,
      proveedor,
      descripcion_gasto,
      id_partida_presupuestal,
      f_importe,
      // f_monto_comprobar,
      1,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id: number, data: SolicitudPresupuesto) {
    const {} = data

    const query = ``

    const placeHolders = []

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE solicitudes_presupuestos SET b_activo=0 WHERE id=${id} LIMIT 1`
    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerComprobantes(id_solicitud: number) {
    let query = `SELECT id, folio_fiscal, f_subtotal, f_total, f_retenciones, regimen_fiscal, forma_pago, metodo_pago,
      dt_registro FROM solicitud_presupuesto_comprobantes WHERE id_solicitud_presupuesto=${id_solicitud} AND b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearComprobante(
    id_solicitud: number,
    data: ComprobanteSolicitud
  ) {
    const {
      folio_fiscal,
      f_subtotal,
      f_total,
      f_retenciones,
      regimen_fiscal,
      forma_pago,
      metodo_pago
    } = data

    const query = `INSERT INTO solicitud_presupuesto_comprobantes ( id_solicitud_presupuesto, folio_fiscal, f_subtotal, f_total,
      f_retenciones, regimen_fiscal, forma_pago, metodo_pago, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_solicitud,
      folio_fiscal,
      f_subtotal,
      f_total,
      f_retenciones,
      regimen_fiscal,
      forma_pago,
      metodo_pago,
      fechaActualAEpoch()
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { SolicitudesPresupuestoDB }
