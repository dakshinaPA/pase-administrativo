import { queryDB, queryDBPlaceHolder } from "./query"
import { connectionDB } from "./connectionPool"
import {
  SolicitudPresupuesto,
  ComprobanteSolicitud,
  QueriesSolicitud,
  EstatusSolicitud,
  PayloadCambioEstatus,
  NotaSolicitud,
} from "@models/solicitud-presupuesto.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

class SolicitudesPresupuestoDB {
  static queryRe = (queries: QueriesSolicitud) => {
    const {
      id,
      id_coparte,
      id_proyecto,
      id_responsable,
      id_admin,
      i_estatus,
      titular,
      dt_inicio,
      dt_fin,
      limit,
    } = queries

    let query = `SELECT sp.id, sp.id_proyecto, sp.i_tipo_gasto, sp.clabe, sp.id_banco, sp.titular_cuenta,
      sp.email, sp.proveedor, sp.descripcion_gasto, sp.id_partida_presupuestal, sp.f_importe, sp.i_estatus, sp.dt_registro,
      CONCAT(p.id_alt, ' - ', p.nombre) proyecto, p.id_responsable,
      b.nombre banco,
      r.nombre rubro,
      SUM(spc.f_total) f_total_comprobaciones,
      SUM(spc.f_retenciones) f_total_impuestos_retenidos
      FROM solicitudes_presupuesto sp
      JOIN proyectos p ON sp.id_proyecto=p.id
      JOIN copartes c ON p.id_coparte=c.id
      JOIN bancos b ON sp.id_banco=b.id
      JOIN rubros_presupuestales r ON sp.id_partida_presupuestal=r.id
      LEFT JOIN solicitud_presupuesto_comprobantes spc ON spc.id_solicitud_presupuesto=sp.id
      WHERE sp.b_activo=1`

    if (id_coparte) {
      query += " AND c.id=?"
    } else if (id_proyecto) {
      query += " AND sp.id_proyecto=?"
    } else if (id) {
      query += " AND sp.id=?"
    }

    if (id_responsable) {
      query += " AND p.id_responsable=?"
    }
    if (id_admin) {
      query += " AND c.id_administrador=?"
    }
    if (i_estatus) {
      query += " AND sp.i_estatus=?"
    }
    if (titular) {
      query += " AND sp.titular_cuenta LIKE ?"
    }
    if (dt_inicio) {
      query += " AND sp.dt_registro >= ?"
    }
    if (dt_fin) {
      query += " AND sp.dt_registro <= ?"
    }

    query += " GROUP BY sp.id"

    if (limit) {
      query += " LIMIT ?"
    }

    return query
  }

  static async obtener(queries: QueriesSolicitud) {
    const {
      id,
      id_coparte,
      id_proyecto,
      id_responsable,
      id_admin,
      i_estatus,
      limit,
      titular,
      dt_inicio,
      dt_fin,
    } = queries

    const qSolicitud = this.queryRe(queries)

    const phSolicitud = []

    if (id_coparte || id_proyecto || id) {
      phSolicitud.push(id_coparte || id_proyecto || id)
    }

    if (id_responsable) phSolicitud.push(id_responsable)
    if (id_admin) phSolicitud.push(id_admin)
    if (i_estatus) phSolicitud.push(i_estatus)
    if (titular) phSolicitud.push(`%${titular}%`)
    if (dt_inicio) phSolicitud.push(dt_inicio)
    if (dt_fin) phSolicitud.push(dt_fin)
    if (limit) phSolicitud.push(Number(limit))
    
    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qSolicitud, phSolicitud, (error, results, fields) => {
          if (error) {
            connection.destroy()
            return rej(error)
          }

          connection.destroy()
          res(results)
        })
      })
    })
  }

  static qCrComprobante = () => {
    return `INSERT INTO solicitud_presupuesto_comprobantes ( id_solicitud_presupuesto, folio_fiscal, f_total,
      f_retenciones, i_metodo_pago, id_forma_pago, id_regimen_fiscal, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`
  }

  static async crear(data: SolicitudPresupuesto) {
    const { comprobantes } = data

    const qSolicitud = `INSERT INTO solicitudes_presupuesto (id_proyecto, i_tipo_gasto, clabe, id_banco, titular_cuenta, email, proveedor,
      descripcion_gasto, id_partida_presupuestal, f_importe, i_estatus, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const phSolicitud = [
      data.id_proyecto,
      data.i_tipo_gasto,
      data.clabe,
      data.id_banco,
      data.titular_cuenta,
      data.email,
      data.proveedor,
      data.descripcion_gasto,
      data.id_partida_presupuestal,
      data.f_importe,
      1,
      fechaActualAEpoch(),
    ]

    const qComprobantes = []
    const phComprobantes = []

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //crear solicitud
          connection.query(
            qSolicitud,
            phSolicitud,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }

              // @ts-ignore
              const idSolicitud = results.insertId

              for (const comp of comprobantes) {
                qComprobantes.push(this.qCrComprobante())

                phComprobantes.push(
                  idSolicitud,
                  comp.folio_fiscal,
                  comp.f_total,
                  comp.f_retenciones,
                  comp.i_metodo_pago,
                  comp.id_forma_pago,
                  comp.id_regimen_fiscal,
                  fechaActualAEpoch()
                )
              }

              //crear comprobantes
              connection.query(
                qComprobantes.join(";"),
                phComprobantes,
                (error, results, fields) => {
                  if (error) {
                    return connection.rollback(() => {
                      connection.destroy()
                      rej(error)
                    })
                  }

                  connection.commit((err) => {
                    if (err) connection.rollback(() => rej(err))
                    connection.destroy()
                    res(idSolicitud)
                  })
                }
              )
            }
          )
        })
      })
    })
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
    const query = `UPDATE solicitudes_presupuesto SET b_activo=0 WHERE id=? LIMIT 1`
    try {
      const res = await queryDBPlaceHolder(query, [id])
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

  // static async crearComprobante(
  //   id_solicitud: number,
  //   data: ComprobanteSolicitud
  // ) {
  //   const {
  //     folio_fiscal,
  //     f_total,
  //     f_retenciones,
  //     i_metodo_pago,
  //     id_forma_pago,
  //     id_regimen_fiscal,
  //   } = data

  //   const query = `INSERT INTO solicitud_presupuesto_comprobantes ( id_solicitud_presupuesto, folio_fiscal, f_total,
  //     f_retenciones, i_metodo_pago, id_forma_pago, id_regimen_fiscal, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

  //   const placeHolders = [
  //     id_solicitud,
  //     folio_fiscal,
  //     f_total,
  //     f_retenciones,
  //     i_metodo_pago,
  //     id_forma_pago,
  //     id_regimen_fiscal,
  //     fechaActualAEpoch(),
  //   ]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

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

  static async obtenerNotas(id_solicitud: number) {
    let query = `SELECT spn.id, spn.mensaje, spn.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM solicitud_presupuesto_notas spn JOIN usuarios u ON spn.id_usuario = u.id
      WHERE spn.id_solicitud=${id_solicitud} AND spn.b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearNota(id_solicitud: number, data: NotaSolicitud) {
    const { id_usuario, mensaje } = data

    const query = `INSERT INTO solicitud_presupuesto_notas ( id_solicitud, id_usuario,
      mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`

    const placeHolders = [
      id_solicitud,
      id_usuario,
      mensaje,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async buscarFactura(folio: string) {
    const query =
      "SELECT id, folio_fiscal FROM solicitud_presupuesto_comprobantes WHERE folio_fiscal=?"

    const placeHolders = [folio]
    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { SolicitudesPresupuestoDB }
