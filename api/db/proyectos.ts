import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Proyecto,
  RubroMinistracion,
  NotaProyecto,
  QueriesProyecto,
} from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"
import { connectionDB } from "./connectionPool"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { ColaboradorDB } from "./colaboradores"
import { ProveedorDB } from "./proveedores"
import { SolicitudesPresupuestoDB } from "./solicitudes-presupuesto"

class ProyectoDB {
  static async obtenerVMin(queries: QueriesProyecto) {
    const { id_responsable, id_coparte, id } = queries

    let query = `SELECT id, id_alt, nombre from proyectos WHERE b_activo=1`

    if (id) {
      query += ` AND id=${id}`
    }

    if (id_responsable) {
      query += ` AND id_responsable=${id_responsable}`
    }

    if (id_coparte) {
      query += ` AND id_coparte=${id_coparte}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static queryRe = (queries: QueriesProyecto) => {
    const { id, id_coparte, id_responsable, id_admin } = queries

    let query = `SELECT p.id, p.id_financiador, p.id_coparte, p.id_responsable, p.id_alt, p.nombre, p.id_tema_social, p.sector_beneficiado,
      p.i_tipo_financiamiento, p.i_beneficiados, p.id_estado, p.municipio, p.descripcion, p.dt_inicio, p.dt_fin, p.dt_registro,
      f.nombre financiador,
      c.nombre coparte, c.id_administrador,
      CONCAT(u.nombre, ' ', u.apellido_paterno) responsable,
      ts.nombre tema_social,
      e.nombre estado
      FROM proyectos p
      JOIN financiadores f ON p.id_financiador = f.id
      JOIN copartes c ON p.id_coparte = c.id
      JOIN usuarios u ON p.id_responsable = u.id
      JOIN temas_sociales ts ON p.id_tema_social = ts.id
      JOIN estados e ON p.id_estado = e.id
      WHERE p.b_activo = 1`

    if (id) {
      query += " AND p.id=?"
    } else if (id_coparte) {
      query += " AND p.id_coparte=?"
    } else if (id_responsable) {
      query += " AND p.id_responsable=?"
    } else if (id_admin) {
      query += " AND c.id_administrador=?"
    }

    return query
  }

  static qReRubros() {
    return `
      SELECT mrp.f_monto, p.id id_proyecto, mrp.id_rubro
      FROM ministracion_rubros_presupuestales mrp 
      JOIN proyecto_ministraciones pm ON pm.id = mrp.id_ministracion
      JOIN proyectos p ON p.id = pm.id_proyecto
      WHERE p.id IN (?) AND pm.b_activo=1 AND mrp.b_activo=1
    `
  }

  static qReSolicitado() {
    return `
      SELECT id, f_importe, f_retenciones, id_proyecto, i_estatus FROM solicitudes_presupuesto
      WHERE id_proyecto IN(?) AND b_activo=1
    `
  }

  static qReSaldoComprobantes() {
    return `
      SELECT p.id id_proyecto, spc.f_total, spc.f_retenciones, sp.i_estatus FROM solicitud_presupuesto_comprobantes spc
      JOIN solicitudes_presupuesto sp ON sp.id = spc.id_solicitud_presupuesto
      JOIN proyectos p ON p.id = sp.id_proyecto
      WHERE p.id IN (?) AND sp.b_activo=1 AND spc.b_activo=1
    `
  }

  static qReMinistraciones = () => {
    return `SELECT id, id_proyecto, i_numero, i_grupo, dt_recepcion, dt_registro
      FROM proyecto_ministraciones pm WHERE id_proyecto=? AND b_activo=1`
  }

  static qReRubrosMinistracion = (activos = true) => {
    let query = `SELECT mrp.id, mrp.id_ministracion, mrp.id_rubro, mrp.f_monto, mrp.b_activo, rp.nombre rubro
      FROM ministracion_rubros_presupuestales mrp
      JOIN rubros_presupuestales rp ON rp.id = mrp.id_rubro
      WHERE mrp.id_ministracion IN (
      SELECT id FROM proyecto_ministraciones WHERE id_proyecto=? AND b_activo=1
      )`

    if (activos) {
      query += "  AND mrp.b_activo=1"
    }

    return query
  }

  static qCrMinistracion =
    () => `INSERT INTO proyecto_ministraciones ( id_proyecto, i_numero, i_grupo,
    dt_recepcion, dt_registro ) VALUES ( ?, ?, ?, ?, ? )`

  static qCrRubrosMinistracion = () =>
    `INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )`

  static async obtener(queries: QueriesProyecto) {
    const { id_coparte, id_responsable, id_admin } = queries

    const qProyectos = this.queryRe(queries)

    const phProyectos = []

    if (id_coparte) {
      phProyectos.push(id_coparte)
    } else if (id_responsable) {
      phProyectos.push(id_responsable)
    } else if (id_admin) {
      phProyectos.push(id_admin)
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(
          qProyectos,
          phProyectos,
          async (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            const proyectosDB = results as ResProyectoDB[]
            const idsProyectos = proyectosDB.map((proy) => proy.id)

            //queries saldos
            const qRubros = this.qReRubros()
            const qSaldoSolicitudes = this.qReSolicitado()
            const qSaldoComprobantes = this.qReSaldoComprobantes()
            const qCombinados = [
              qRubros,
              qSaldoSolicitudes,
              qSaldoComprobantes,
            ].join(";")

            const phCombinados = [idsProyectos, idsProyectos, idsProyectos]

            connection.query(
              qCombinados,
              phCombinados,
              (error, results, fields) => {
                if (error) {
                  connection.destroy()
                  return rej(error)
                }

                connection.destroy()
                res({
                  proyectos: proyectosDB,
                  rubros: results[0],
                  solicitudes: results[1],
                  comprobantes: results[2],
                })
              }
            )
          }
        )
      })
    })
  }

  static obtenerUno = async (id: number) => {
    const qProyecto = this.queryRe({ id })
    const qSaldoComprobantes = this.qReSaldoComprobantes()
    const qMinistracioens = this.qReMinistraciones()
    const qRubrosMinistracion = this.qReRubrosMinistracion()
    const qColaboradores = ColaboradorDB.queryRe(id)
    const qProveedores = ProveedorDB.queryRe(id)
    const qSolicitudes = SolicitudesPresupuestoDB.queryRe({ id_proyecto: id })
    const qNotas = this.reNotas()

    const qCombinados = [
      qProyecto,
      qSaldoComprobantes,
      qMinistracioens,
      qRubrosMinistracion,
      qColaboradores,
      qProveedores,
      qSolicitudes,
      qNotas,
    ].join(";")

    const phCombinados = [id, id, id, id, id, id, id, id]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        //obtener proyecto
        connection.query(
          qCombinados,
          phCombinados,
          async (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            connection.destroy()

            const dataProyecto = {
              proyectos: results[0],
              comprobantes: results[1],
              ministraciones: results[2],
              rubros_ministracion: results[3],
              colaboradores: results[4],
              proveedores: results[5],
              solicitudes: results[6],
              notas: results[7],
            }

            res(dataProyecto)
          }
        )
      })
    })
  }

  static async crear(data: Proyecto) {
    const { ministraciones } = data

    const qProyecto = `INSERT INTO proyectos ( id_alt, id_financiador, id_coparte, id_responsable, nombre, id_tema_social, sector_beneficiado,
      i_tipo_financiamiento, i_beneficiados, id_estado, municipio, descripcion, dt_inicio, dt_fin, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const phProyecto = [
      data.id_financiador,
      data.id_coparte,
      data.id_responsable,
      data.nombre,
      data.id_tema_social,
      data.sector_beneficiado,
      data.i_tipo_financiamiento,
      data.i_beneficiados,
      data.id_estado,
      data.municipio,
      data.descripcion,
      data.dt_inicio,
      data.dt_fin,
      fechaActualAEpoch(),
    ]

    const qIdAlt = [
      "SELECT id_alt FROM financiadores WHERE id=? LIMIT 1",
      "SELECT id_alt FROM copartes WHERE id=? LIMIT 1",
      "SELECT count(*) cantidad FROM proyectos WHERE id_financiador=? AND id_coparte=?",
    ].join(";")

    const phIdALt = [
      data.id_financiador,
      data.id_coparte,
      data.id_financiador,
      data.id_coparte,
    ]

    const agregarCerosAId = (id: string) => {
      if (id.length < 3) {
        return agregarCerosAId(`0${id}`)
      } else {
        return id
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

          //obtener data Ids
          connection.query(qIdAlt, phIdALt, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }

            const idAltFinanciador = results[0][0].id_alt
            const idAltCoparte = results[1][0].id_alt
            const nextId = results[2][0].cantidad + 1
            const idAltConZeros = agregarCerosAId(String(nextId))
            const idAltProyecto = `${idAltFinanciador}_${idAltCoparte}_${idAltConZeros}`
            phProyecto.unshift(idAltProyecto)

            //crear proyecto
            connection.query(
              qProyecto,
              phProyecto,
              (error, results, fields) => {
                if (error) {
                  return connection.rollback(() => {
                    connection.destroy()
                    rej(error)
                  })
                }
                // @ts-ignore
                const idProyecto = results.insertId
                // phSaldoProyecto.unshift(idProyecto)

                const qMinistraciones = []
                const phMinistracion = []

                for (const min of ministraciones) {
                  const { i_numero, i_grupo, dt_recepcion } = min
                  qMinistraciones.push(this.qCrMinistracion())
                  phMinistracion.push(
                    idProyecto,
                    i_numero,
                    i_grupo,
                    dt_recepcion,
                    fechaActualAEpoch()
                  )
                }

                //crear ministraciones
                connection.query(
                  qMinistraciones.join(";"),
                  phMinistracion,
                  (error, results, fields) => {
                    if (error) {
                      return connection.rollback(() => {
                        connection.destroy()
                        rej(error)
                      })
                    }

                    // @ts-ignore
                    const idsMinistracion = Array.isArray(results)
                      ? results.map((res) => res.insertId)
                      : [results.insertId]

                    const qRubros = []
                    const phRubros = []

                    ministraciones.forEach((min, index) => {
                      for (const rp of min.rubros_presupuestales) {
                        const { id_rubro, f_monto } = rp
                        qRubros.push(this.qCrRubrosMinistracion())
                        phRubros.push(idsMinistracion[index], id_rubro, f_monto)
                      }
                    })

                    //crear rubros de ministracion
                    connection.query(
                      qRubros.join(";"),
                      phRubros,
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
                          res(idProyecto)
                        })
                      }
                    )
                  }
                )
              }
            )
          })
        })
      })
    })
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    const { ministraciones, saldo } = data

    const qProyecto = `UPDATE proyectos SET id_responsable=?, nombre=?, id_tema_social=?, sector_beneficiado=?,
      i_beneficiados=?, id_estado=?, municipio=?, descripcion=?, dt_inicio=?, dt_fin=? WHERE id=? LIMIT 1`

    const qUpMinistracion = `UPDATE proyecto_ministraciones SET i_grupo=?,
      dt_recepcion=? WHERE id=? LIMIT 1`

    const qUpRubroMinistracion = `UPDATE ministracion_rubros_presupuestales SET
      f_monto=? WHERE id=? LIMIT 1`

    const qReAcRubro = `UPDATE ministracion_rubros_presupuestales SET b_activo=1, f_monto=? WHERE id=? LIMIT 1`

    const qDlRubro = `UPDATE ministracion_rubros_presupuestales SET
      b_activo=0 WHERE id=? LIMIT 1`

    const qCombinados = [qProyecto]
    const phCombinados = [
      data.id_responsable,
      data.nombre,
      data.id_tema_social,
      data.sector_beneficiado,
      data.i_beneficiados,
      data.id_estado,
      data.municipio,
      data.descripcion,
      data.dt_inicio,
      data.dt_fin,
      id_proyecto,
    ]

    const qIniciales = this.qReRubrosMinistracion(false)
    const phIniciales = [id_proyecto]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //obtener rubros actuales
          connection.query(
            qIniciales,
            phIniciales,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }

              const rubrosDB = results as RubroMinistracion[]
              let rubrosVista: RubroMinistracion[] = []

              for (const min of ministraciones) {
                const {
                  id,
                  i_numero,
                  i_grupo,
                  dt_recepcion,
                  rubros_presupuestales,
                } = min
                // para comparar los de db vs vista
                rubrosVista = [...rubrosVista, ...rubros_presupuestales]

                if (id) {
                  qCombinados.push(qUpMinistracion)
                  phCombinados.push(i_grupo, dt_recepcion, id)
                } else {
                  qCombinados.push(this.qCrMinistracion())
                  phCombinados.push(
                    id_proyecto,
                    i_numero,
                    i_grupo,
                    dt_recepcion,
                    fechaActualAEpoch()
                  )
                }

                for (const rp of rubros_presupuestales) {
                  const { id, f_monto, id_rubro } = rp

                  if (id) {
                    qCombinados.push(qUpRubroMinistracion)
                    phCombinados.push(f_monto, id)
                  } else {
                    const esRegistrado = rubrosDB.find(
                      (rDB) =>
                        rDB.id_rubro == id_rubro &&
                        rDB.id_ministracion == min.id
                    )
                    if (esRegistrado) {
                      qCombinados.push(qReAcRubro)
                      phCombinados.push(f_monto, esRegistrado.id)
                    } else {
                      qCombinados.push(this.qCrRubrosMinistracion())
                      phCombinados.push(min.id, id_rubro, f_monto)
                    }
                  }
                }
              }

              //revisar si algun rubro fue eliminado
              const rubrosActivosDb = rubrosDB.filter((rp) => !!rp.b_activo)
              for (const rdb of rubrosActivosDb) {
                const matchDBvista = rubrosVista.find((rv) => rv.id == rdb.id)
                if (!matchDBvista) {
                  qCombinados.push(qDlRubro)
                  phCombinados.push(rdb.id)
                }
              }

              //actualizar todo
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
            }
          )
        })
      })
    })
  }

  static async borrar(id: number) {
    const query = `UPDATE proyectos SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerData(id_proyecto: number) {
    const qColaboradores = ColaboradorDB.queryRe(id_proyecto)
    const qProveedores = ProveedorDB.queryRe(id_proyecto)
    const qRubrosProyecto = this.qReRubrosMinistracion()
    const qCombinados = [qColaboradores, qProveedores, qRubrosProyecto].join(
      ";"
    )
    const ph = [id_proyecto, id_proyecto, id_proyecto]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qCombinados, ph, (error, results, fields) => {
          if (error) {
            connection.destroy()
            return rej(error)
          }

          connection.destroy()

          const dataProyecto = {
            colaboradores: results[0],
            proveedores: results[1],
            rubros_presupuestales: results[2],
          }

          res(dataProyecto)
        })
      })
    })
  }

  static reNotas = () => {
    return `SELECT p.id, p.mensaje, p.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM proyecto_notas p JOIN usuarios u ON p.id_usuario = u.id
      WHERE p.id_proyecto=? AND p.b_activo=1`
  }

  static async obtenerNotas(id_proyecto: number) {
    const query = this.reNotas()

    const placeHolders = [id_proyecto]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearNota(id_proyecto: number, data: NotaProyecto) {
    const { id_usuario, mensaje } = data

    const query = `INSERT INTO proyecto_notas ( id_proyecto, id_usuario,
      mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`

    const placeHolders = [id_proyecto, id_usuario, mensaje, fechaActualAEpoch()]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ProyectoDB }
