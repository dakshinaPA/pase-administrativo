import { queryDB, queryDBPlaceHolder } from "./query"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"
import { RespuestaDB } from "@api/utils/response"

class PresupuestoDB {
  static async obtener(id?: number) {
    let query =
      "SELECT id, tipoGasto, proveedor, clabe, banco, titular, rfc, email, email2, partida, descripcion, importe, comprobante FROM `solicitudes_presupuestos` WHERE b_activo=1"

    if (id) {
      query += ` AND id=${id} LIMIT 1`
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
      tipoGasto,
      proveedor,
      clabe,
      banco,
      titular,
      rfc,
      email,
      email2,
      partida,
      descripcion,
      importe,
      comprobante,
    } = data

    const query =
      "INSERT INTO solicitudes_presupuestos ( tipoGasto, proveedor, clabe, banco, titular, rfc, email, email2, partida, descripcion, importe, comprobante ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    const placeHolders = [
      tipoGasto,
      proveedor,
      clabe,
      banco,
      titular,
      rfc,
      email,
      email2,
      partida,
      descripcion,
      importe,
      comprobante,
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
      tipoGasto,
      proveedor,
      clabe,
      banco,
      titular,
      rfc,
      email,
      email2,
      partida,
      descripcion,
      importe,
      comprobante,
    } = data

    const query =
      "UPDATE solicitudes_presupuestos SET tipoGasto=?, proveedor=?, clabe=?, banco=?, titular=?, rfc=?, email=?, email2=?, partida=?, descripcion=?, importe=?, comprobante=? WHERE id=? LIMIT 1"
    const placeHolders = [
      tipoGasto,
      proveedor,
      clabe,
      banco,
      titular,
      rfc,
      email,
      email2,
      partida,
      descripcion,
      importe,
      comprobante,
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
    const query = `UPDATE solicitudes_presupuestos SET b_activo=0 WHERE id=${id} LIMIT 1`
    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { PresupuestoDB }
