import { RespuestaDB } from "@api/utils/response"
import { queryDBPlaceHolder } from "./query"
import { connectionDB } from "./connectionPool"
import {
  ColaboradorProyecto,
  PeriodoServicioColaborador,
} from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ColaboradorDB {
  static queryRe = (id_proyecto: number, id_colaborador?: number) => {
    let query = `SELECT c.id, c.id_proyecto, c.nombre, c.apellido_paterno, c.apellido_materno, c.i_tipo, c.clabe,
      c.id_banco, c.telefono, c.email, c.rfc, c.curp, c.dt_registro,
      cd.id id_direccion, cd.calle, cd.numero_ext, cd.numero_int, cd.colonia, cd.municipio, cd.cp cp_direccion, cd.id_estado,
      p.id_responsable, p.id_alt id_alt_proyecto, p.nombre proyecto,
      co.id_alt id_alt_coparte,
      f.id_alt id_alt_financiador,
      e.nombre estado,
      b.nombre banco
      FROM colaboradores c
      JOIN colaborador_direccion cd ON c.id = cd.id_colaborador
      JOIN estados e ON cd.id_estado = e.id
      JOIN bancos b ON c.id_banco = b.id
      JOIN proyectos p ON c.id_proyecto = p.id
      JOIN copartes co ON p.id_coparte = co.id
      JOIN financiadores f ON p.id_financiador = f.id
      WHERE c.b_activo = 1`

    if (id_proyecto) {
      query += " AND c.id_proyecto=?"
    } else if (id_colaborador) {
      query += " AND c.id=?"
    }

    return query
  }

  static qRePeriodosServicio = () => {
    return `
      SELECT id, i_numero_ministracion, f_monto, servicio, descripcion, cp, dt_inicio,
      dt_fin, dt_registro FROM colaborador_periodos_servicio WHERE id_colaborador=? AND b_activo=1
    `
  }

  static qReHistorialPagos = () => {
    return `
      SELECT sp.id, sp.i_tipo_gasto, sp.f_importe, sp.id_partida_presupuestal, sp.descripcion_gasto, sp.dt_pago,
      rp.nombre rubro
      FROM solicitudes_presupuesto sp
      JOIN rubros_presupuestales rp ON rp.id = sp.id_partida_presupuestal
      WHERE sp.i_tipo_gasto!=2 AND sp.id_titular_cuenta=? AND sp.i_estatus=4 AND sp.b_activo=1;
    `
  }

  static async obtener(id_proyecto: number, id_colaborador?: number) {
    const qColaborador = this.queryRe(id_proyecto, id_colaborador)
    const qPeriodos = this.qRePeriodosServicio()
    const qHistorialPagos = this.qReHistorialPagos()

    const qCombinados = [qColaborador]

    const phCombinados = []

    if (id_proyecto) {
      phCombinados.push(id_proyecto)
    } else if (id_colaborador) {
      qCombinados.push(qPeriodos)
      qCombinados.push(qHistorialPagos)
      phCombinados.push(id_colaborador, id_colaborador, id_colaborador)
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(
          qCombinados.join(";"),
          phCombinados,
          (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            connection.destroy()

            //obtener periodos servicio
            if (id_proyecto) {
              res(results)
            } else if (id_colaborador) {
              const dataColaborador = results[0][0]
              const periodos_servicio = results[1]
              const historial_pagos = results[2]

              res([
                {
                  ...dataColaborador,
                  periodos_servicio,
                  historial_pagos,
                },
              ])
            }
          }
        )
      })
    })
  }

  static qCrPeriodoServicio() {
    return `INSERT INTO colaborador_periodos_servicio ( id_colaborador, i_numero_ministracion, f_monto, servicio, descripcion, cp,
      dt_inicio, dt_fin, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`
  }

  static async crear(data: ColaboradorProyecto) {
    const { periodos_servicio, direccion } = data

    const qColaborador = `INSERT INTO colaboradores ( id_proyecto, nombre, apellido_paterno, apellido_materno, i_tipo, clabe, id_banco,
      telefono, email, rfc, curp, dt_registro ) VALUES ( ?, UPPER(?), UPPER(?), UPPER(?), ?, ?, ?, ?, ?, ?, ?, ? )`

    const qCrDireccion = `INSERT INTO colaborador_direccion ( id_colaborador, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const phIniciales = [
      data.id_proyecto,
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.i_tipo,
      data.clabe,
      data.id_banco,
      data.telefono,
      data.email,
      data.rfc,
      data.curp,
      fechaActualAEpoch(),
    ]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //crear colaborador
          connection.query(
            qColaborador,
            phIniciales,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }

              // @ts-ignore
              const idColaborador = results.insertId

              const qSecundarios = []
              const phSecundarios = []

              //crear direccion
              qSecundarios.push(qCrDireccion)
              phSecundarios.push(
                idColaborador,
                direccion.calle,
                direccion.numero_ext,
                direccion.numero_int,
                direccion.colonia,
                direccion.municipio,
                direccion.cp,
                direccion.id_estado
              )

              //crear periodos de servicio
              for (const ps of periodos_servicio) {
                qSecundarios.push(this.qCrPeriodoServicio())
                phSecundarios.push(
                  idColaborador,
                  ps.i_numero_ministracion,
                  ps.f_monto,
                  ps.servicio,
                  ps.descripcion,
                  ps.cp,
                  ps.dt_inicio,
                  ps.dt_fin,
                  fechaActualAEpoch()
                )
              }

              connection.query(
                qSecundarios.join(";"),
                phSecundarios,
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
                    res(idColaborador)
                  })
                }
              )
            }
          )
        })
      })
    })
  }

  static async actualizar(id_colaborador: number, data: ColaboradorProyecto) {
    const { direccion, periodos_servicio } = data

    const qColaborador = `UPDATE colaboradores SET nombre=UPPER(?), apellido_paterno=UPPER(?), apellido_materno=UPPER(?),
      i_tipo=?, clabe=?, id_banco=?, telefono=?, email=?, rfc=?, curp=? WHERE id=?`

    const phColaborador = [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.i_tipo,
      data.clabe,
      data.id_banco,
      data.telefono,
      data.email,
      data.rfc,
      data.curp,
      id_colaborador,
    ]

    const qDireccion = `UPDATE colaborador_direccion SET calle=?, numero_ext=?, numero_int=?,
      colonia=?, municipio=?, cp=?, id_estado=? WHERE id=?`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
      direccion.id,
    ]

    const qUpPeriodoServicio = `UPDATE colaborador_periodos_servicio SET i_numero_ministracion=?, f_monto=?,
      servicio=?, descripcion=?, cp=?, dt_inicio=?, dt_fin=? WHERE id=? LIMIT 1`

    // const qDlPeriodoServicio = `UPDATE colaborador_periodos_servicio SET b_activo=0 WHERE id=? LIMIT 1`

    const qCombinados = [qColaborador, qDireccion]
    const phCombinados = [...phColaborador, ...phDireccion]

    for (const ps of periodos_servicio) {
      if (ps.id) {
        qCombinados.push(qUpPeriodoServicio)
        phCombinados.push(
          ps.i_numero_ministracion,
          ps.f_monto,
          ps.servicio,
          ps.descripcion,
          ps.cp,
          ps.dt_inicio,
          ps.dt_fin,
          ps.id
        )
      } else {
        qCombinados.push(this.qCrPeriodoServicio())
        phCombinados.push(
          id_colaborador,
          ps.i_numero_ministracion,
          ps.f_monto,
          ps.servicio,
          ps.descripcion,
          ps.cp,
          ps.dt_inicio,
          ps.dt_fin,
          fechaActualAEpoch()
        )
      }
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          // connection.query(
          //   this.qRePeriodosServicio(),
          //   id_colaborador,
          //   (error, results, fields) => {
          //     if (error) {
          //       return connection.rollback(() => {
          //         connection.destroy()
          //         rej(error)
          //       })
          //     }

          //     const periodosDB = results as PeriodoServicioColaborador[]

          //     //revisar si algun periodo fue desactivado
          //     for (const psDB of periodosDB) {
          //       const matchVista = periodos_servicio.find( ps => ps.id == psDB.id)
          //       if(!matchVista){
          //         qCombinados.push(qDlPeriodoServicio)
          //         phCombinados.push(psDB.id)
          //       }
          //     }
          //   }
          // )

          //actualizar colaborador
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

              const qRe = [
                this.queryRe(null, id_colaborador),
                this.qRePeriodosServicio(),
              ]

              //traer colaborador actualizado
              connection.query(
                qRe.join(";"),
                [id_colaborador, id_colaborador],
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
                    res({
                      ...results[0][0],
                      periodos_servicio: results[1],
                    })
                  })
                }
              )
            }
          )
        })
      })
    })
  }

  static async borrar(id: number) {
    const query = `UPDATE colaboradores SET b_activo=0 WHERE id=? LIMIT 1`

    try {
      const res = await queryDBPlaceHolder(query, [id])
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ColaboradorDB }
