import { queryDB, queryDBPlaceHolder } from "./query"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"

class PresupuestoDB {
  static async obtener(id?: number) {
    let query =
      "SELECT id, tipoGasto, proveedor, clabe, banco, titular, rfc, email, email2, partida, descripcion, importe, comprobante FROM `solicitudes_presupuestos` WHERE b_activo=1"

    if (id) {
      query += ` AND id=${id} LIMIT 1`
    }

    const res = await queryDB(query)
    return res
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
    const res = await queryDBPlaceHolder(query, placeHolders)
    return res
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
      "UPDATE solicitudes_presupuestos SET tipoGasto=?, proveedor=?, clabe=?, banco=?, titular=?, rfc=?, email=?, email2=?, partida=?, descripcion=?, importe=?, comprobante=?, WHERE id=? LIMIT 1"
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
    const res = await queryDBPlaceHolder(query, placeHolders)
    return res
  }

  static async borrar(id: number) {
    const query = `UPDATE solicitudes_presupuestos SET b_activo=0 WHERE id=${id} LIMIT 1`
    const res = await queryDB(query)
    return res
  }
}

export { PresupuestoDB }
