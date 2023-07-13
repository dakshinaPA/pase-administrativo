import { queryDB, queryDBPlaceHolder } from "./query"
import {
  SolicitudPresupuesto,
  ComprobanteSolicitud,
  QueriesSolicitud,
  EstatusSolicitud,
  PayloadCambioEstatus,
} from "@models/solicitud-presupuesto.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

class SolicitudesPresupuestoDB {
  static async obtener(queries: QueriesSolicitud) {
    const { id, id_proyecto, id_responsable } = queries

    let query = `SELECT sp.id, sp.id_proyecto, sp.i_tipo_gasto, sp.clabe, sp.id_banco, sp.titular_cuenta,
    sp.email, sp.proveedor, sp.descripcion_gasto, sp.id_partida_presupuestal, sp.f_importe, sp.i_estatus, sp.dt_registro,
    CONCAT(p.id_alt, ' - ', p.nombre) proyecto, p.id_responsable,
    b.nombre banco,
    r.nombre rubro,
    SUM(spc.f_total) f_total_comprobaciones
    FROM solicitudes_presupuesto sp
    JOIN proyectos p ON sp.id_proyecto=p.id
    JOIN bancos b ON sp.id_banco=b.id
    JOIN rubros_presupuestales r ON sp.id_partida_presupuestal=r.id
    LEFT JOIN solicitud_presupuesto_comprobantes spc ON spc.id_solicitud_presupuesto=sp.id
    WHERE sp.b_activo=1`

    if (id_proyecto) {
      query += ` AND sp.id_proyecto=${id_proyecto}`
    }

    if (id) {
      query += ` AND sp.id=${id}`
    }

    query += " GROUP BY sp.id"

    // if (id_responsable) {
    //   query += ` AND p.id_responsable=${id}`
    // }

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
      titular_cuenta,
      email,
      proveedor,
      descripcion_gasto,
      id_partida_presupuestal,
      f_importe,
      // f_monto_comprobar,
    } = data

    const query = `INSERT INTO solicitudes_presupuesto (id_proyecto, i_tipo_gasto, clabe, id_banco, titular_cuenta, email, proveedor,
      descripcion_gasto, id_partida_presupuestal, f_importe, i_estatus, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const placeHolders = [
      id_proyecto,
      i_tipo_gasto,
      clabe,
      id_banco,
      titular_cuenta,
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
    const {
      clabe,
      id_banco,
      titular_cuenta,
      email,
      proveedor,
      descripcion_gasto,
      f_importe,
      i_estatus,
    } = data

    const query = `UPDATE solicitudes_presupuesto SET clabe=?, id_banco=?, titular_cuenta=?,
      email=?, proveedor=?, descripcion_gasto=?, f_importe=?, i_estatus=? WHERE id=?`

    const placeHolders = [
      clabe,
      id_banco,
      titular_cuenta,
      email,
      proveedor,
      descripcion_gasto,
      f_importe,
      i_estatus,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE solicitudes_presupuesto SET b_activo=0 WHERE id=${id} LIMIT 1`
    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerComprobantes(id_solicitud: number) {
    let query = `SELECT spc.id, spc.folio_fiscal, spc.f_total, spc.f_retenciones, spc.i_metodo_pago, spc.id_forma_pago, spc.id_regimen_fiscal, spc.dt_registro,
      fp.nombre forma_pago, fp.clave clave_forma_pago,
      rf.nombre regimen_fiscal, rf.clave clave_regimen_fiscal
      FROM solicitud_presupuesto_comprobantes spc
      JOIN formas_pago fp ON spc.id_forma_pago = fp.id
      JOIN regimenes_fiscales rf ON spc.id_regimen_fiscal = rf.id
      WHERE spc.id_solicitud_presupuesto=${id_solicitud} AND spc.b_activo=1`

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
      f_total,
      f_retenciones,
      i_metodo_pago,
      id_forma_pago,
      id_regimen_fiscal,
    } = data

    const query = `INSERT INTO solicitud_presupuesto_comprobantes ( id_solicitud_presupuesto, folio_fiscal, f_total,
      f_retenciones, i_metodo_pago, id_forma_pago, id_regimen_fiscal, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_solicitud,
      folio_fiscal,
      f_total,
      f_retenciones,
      i_metodo_pago,
      id_forma_pago,
      id_regimen_fiscal,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrarComprobante(id: number) {
    const query = `DELETE FROM solicitud_presupuesto_comprobantes WHERE id=? LIMIT 1`

    const placeHolders = [id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarEstatus(id: number, i_estatus: EstatusSolicitud) {
    const query = `UPDATE solicitudes_presupuesto SET i_estatus=? WHERE id=? LIMIT 1`

    const placeHolders = [i_estatus, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async cambiarEstatus(payload: PayloadCambioEstatus) {
    const { i_estatus, ids_solicitudes } = payload

    let query = `UPDATE solicitudes_presupuesto SET i_estatus=${i_estatus} WHERE id IN (`

    const idsAstring = ids_solicitudes
      .map((id, index) =>
        index == ids_solicitudes.length - 1 ? `${id})` : `${id},`
      )
      .join("")

    query += idsAstring

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { SolicitudesPresupuestoDB }
