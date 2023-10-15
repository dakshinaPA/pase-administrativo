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
import { Proyecto } from "@models/proyecto.model"
import { ResSolicitudPresupuestoDB } from "@api/models/solicitudes-presupuesto.model"

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
      sp.email, sp.proveedor, sp.descripcion_gasto, sp.id_partida_presupuestal, sp.f_importe, sp.f_retenciones, sp.i_estatus, sp.dt_registro,
      CONCAT(p.id_alt, ' - ', p.nombre) proyecto, p.id_responsable,
      b.nombre banco,
      r.nombre rubro
      FROM solicitudes_presupuesto sp
      JOIN proyectos p ON sp.id_proyecto=p.id
      JOIN copartes c ON p.id_coparte=c.id
      JOIN bancos b ON sp.id_banco=b.id
      JOIN rubros_presupuestales r ON sp.id_partida_presupuestal=r.id
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
      query += " AND UPPER(sp.titular_cuenta) LIKE UPPER(?)"
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

  static qReComprobantes = () => {
    return `
      SELECT spc.id, spc.id_solicitud_presupuesto, spc.folio_fiscal, spc.f_total, spc.f_retenciones, spc.i_metodo_pago, spc.id_forma_pago, spc.id_regimen_fiscal, spc.dt_registro,
      fp.nombre forma_pago, fp.clave clave_forma_pago,
      rf.nombre regimen_fiscal, rf.clave clave_regimen_fiscal
      FROM solicitud_presupuesto_comprobantes spc
      JOIN formas_pago fp ON spc.id_forma_pago = fp.id
      JOIN regimenes_fiscales rf ON spc.id_regimen_fiscal = rf.id
      WHERE spc.id_solicitud_presupuesto=? AND spc.b_activo=1
    `
  }

  static qReSaldoComprobantes = () => {
    return `
      SELECT spc.id, spc.id_solicitud_presupuesto, spc.f_total, spc.f_retenciones
      FROM solicitud_presupuesto_comprobantes spc
      WHERE spc.id_solicitud_presupuesto IN (?) AND spc.b_activo=1
    `
  }

  static qCrComprobante = () => {
    return `
      INSERT INTO solicitud_presupuesto_comprobantes ( id_solicitud_presupuesto, folio_fiscal, f_total,
      f_retenciones, i_metodo_pago, id_forma_pago, id_regimen_fiscal, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )
    `
  }

  static qDlComprobantes = () => {
    return `UPDATE solicitud_presupuesto_comprobantes SET b_activo=0 WHERE id=?`
  }

  static qReactivarComprobante = () => {
    return `UPDATE solicitud_presupuesto_comprobantes SET b_activo=1 WHERE id=?`
  }

  static qReNotas = () => {
    return `
      SELECT spn.id, spn.mensaje, spn.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM solicitud_presupuesto_notas spn JOIN usuarios u ON spn.id_usuario = u.id
      WHERE spn.id_solicitud=? AND spn.b_activo=1
    `
  }

  static async obtener(queries: QueriesSolicitud) {
    const {
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

    if (id_coparte || id_proyecto) {
      phSolicitud.push(id_coparte || id_proyecto)
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

          const solicitudes = results as ResSolicitudPresupuestoDB[]
          const ids = solicitudes.map((sol) => sol.id)
          const qComprobantes = this.qReSaldoComprobantes()

          connection.query(
            qComprobantes,
            [ids],
            (error, results, fields) => {
              if (error) {
                connection.destroy()
                return rej(error)
              }

              const comprobantes = results

              connection.destroy()
              res({
                solicitudes,
                comprobantes,
              })
            }
          )
        })
      })
    })
  }

  static async obtenerUna(id: number) {
    const qSolicitud = this.queryRe({ id })
    const qComprobantes = this.qReComprobantes()
    const qnotas = this.qReNotas()
    const qCombinados = [qSolicitud, qComprobantes, qnotas].join(";")

    const phCombinados = [id, id, id]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(
          qCombinados,
          phCombinados,
          (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            connection.destroy()
            res([
              {
                ...results[0][0],
                comprobantes: results[1],
                notas: results[2],
              },
            ])
          }
        )
      })
    })
  }

  static async crear(data: SolicitudPresupuesto) {
    const { comprobantes, id_proyecto } = data

    const qSolicitud = `INSERT INTO solicitudes_presupuesto (id_proyecto, i_tipo_gasto, clabe, id_banco, titular_cuenta, email, proveedor,
      descripcion_gasto, id_partida_presupuestal, f_importe, i_estatus, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const phSolicitud = [
      id_proyecto,
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

              if (qComprobantes.length > 0) {
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
                return
              }

              connection.commit((err) => {
                if (err) connection.rollback(() => rej(err))
                connection.destroy()
                res(idSolicitud)
              })
            }
          )
        })
      })
    })
  }

  static async actualizar(id: number, data: SolicitudPresupuesto) {
    const { comprobantes } = data

    const qUpSolicitud = `UPDATE solicitudes_presupuesto SET clabe=?, id_banco=?, titular_cuenta=?,
      email=?, proveedor=?, descripcion_gasto=?, f_importe=?, f_retenciones=?, i_estatus=? WHERE id=?`

    const qReComprobantes =
      "SELECT id, id_solicitud_presupuesto, folio_fiscal, b_activo FROM solicitud_presupuesto_comprobantes WHERE id_solicitud_presupuesto=?"

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //actualizar solicitud y traer comprobantes existentes
          connection.query(qReComprobantes, id, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }

            const comprobantesDB = results as ComprobanteSolicitud[]

            const qCombinados = [qUpSolicitud]
            const phCombinados = [
              data.clabe,
              data.id_banco,
              data.titular_cuenta,
              data.email,
              data.proveedor,
              data.descripcion_gasto,
              data.f_importe,
              data.f_retenciones,
              data.i_estatus,
              id,
            ]

            for (const comp of comprobantes) {
              // agregar comprobantes nuevos
              if (!comp.id) {
                //buscar si esta en base de datos pero inactivo
                const match = comprobantesDB.find(
                  (comDB) => comDB.folio_fiscal == comp.folio_fiscal
                )

                if (match && match.id_solicitud_presupuesto == id) {
                  //reactivar solicitud
                  qCombinados.push(this.qReactivarComprobante())
                  phCombinados.push(match.id)
                } else {
                  //registrar nueva
                  qCombinados.push(this.qCrComprobante())
                  phCombinados.push(
                    id,
                    comp.folio_fiscal,
                    comp.f_total,
                    comp.f_retenciones,
                    comp.i_metodo_pago,
                    comp.id_forma_pago,
                    comp.id_regimen_fiscal,
                    fechaActualAEpoch()
                  )
                }
              }
            }

            //revisar si se eliminaron comprobantes
            for (const compDb of comprobantesDB) {
              if (Boolean(compDb.b_activo)) {
                const match = comprobantes.find((comp) => comp.id == compDb.id)
                if (!match) {
                  qCombinados.push(this.qDlComprobantes())
                  phCombinados.push(compDb.id)
                }
              }
            }

            connection.query(
              qCombinados.join(";"),
              phCombinados,
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
                  res(true)
                })
              }
            )
          })
        })
      })
    })
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
    let query = this.qReNotas()

    try {
      const res = await queryDBPlaceHolder(query, [id_solicitud])
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
      "SELECT id, folio_fiscal FROM solicitud_presupuesto_comprobantes WHERE folio_fiscal=? and b_activo=1"

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
