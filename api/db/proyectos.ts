import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Proyecto,
  RubroMinistracion,
  NotaProyecto,
  QueriesProyecto,
  MinistracionProyecto,
  AjusteProyecto,
  NotaAjuste,
} from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"
import { connectionDB } from "./connectionPool"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { ColaboradorDB } from "./colaboradores"
import { ProveedorDB } from "./proveedores"
import { SolicitudesPresupuestoDB } from "./solicitudes-presupuesto"

class ProyectoDB {
  static qReRubrosProyectoDistinct = `
    SELECT DISTINCT mrp.id_rubro, rp.nombre rubro
    FROM ministracion_rubros_presupuestales mrp
    JOIN rubros_presupuestales rp ON rp.id = mrp.id_rubro
    JOIN proyecto_ministraciones pm ON pm.id = mrp.id_ministracion
    WHERE pm.id_proyecto=? AND mrp.id_rubro NOT IN (1,23)
  `

  static async obtenerVMin(queries: QueriesProyecto) {
    const { id_responsable, id_coparte, id } = queries

    let query = `
      SELECT p.id, p.id_alt, p.nombre,
      c.id id_coparte
      FROM proyectos p  
      JOIN copartes c ON p.id_coparte=c.id
      WHERE p.b_activo=1`

    if (id) {
      query += ` AND p.id=${id}`
    }

    if (id_responsable) {
      query += ` AND p.id_responsable=${id_responsable}`
    }

    if (id_coparte) {
      query += ` AND p.id_coparte=${id_coparte}`
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
      CONCAT(us.nombre, ' ', us.apellido_paterno) administrador,
      ts.nombre tema_social,
      e.nombre estado
      FROM proyectos p
      JOIN financiadores f ON p.id_financiador = f.id
      JOIN copartes c ON p.id_coparte = c.id
      JOIN usuarios u ON p.id_responsable = u.id
      JOIN usuarios us ON c.id_administrador = us.id
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

  static qReSolicitudesPagadas() {
    return `
      SELECT id, id_proyecto, i_tipo_gasto, id_partida_presupuestal, f_importe, f_retenciones, i_estatus
      FROM solicitudes_presupuesto
      WHERE id_proyecto IN (?) AND i_estatus IN (2,4) AND b_activo=1 
    `
  }

  static qReSaldoComprobantes() {
    return `
      SELECT id_solicitud_presupuesto, f_total, f_retenciones
      FROM solicitud_presupuesto_comprobantes
      WHERE id_solicitud_presupuesto IN (
        SELECT id FROM solicitudes_presupuesto WHERE id_proyecto IN (?) AND i_estatus IN (2,4) AND b_activo=1
      ) AND b_activo=1
    `
  }

  static qReAjustes(id_ajuste?: number) {
    let qRe = `
      SELECT pa.id, pa.id_proyecto, pa.id_partida_presupuestal, pa.i_tipo, pa.titular_cuenta, pa.clabe, pa.concepto, pa.f_total, pa.dt_ajuste, pa.dt_registro,
      rp.nombre rubro
      FROM proyecto_ajustes pa
      JOIN rubros_presupuestales rp ON pa.id_partida_presupuestal = rp.id WHERE
    `

    if (id_ajuste) {
      qRe += " pa.id=?"
    } else {
      qRe += " pa.id_proyecto IN (?) AND pa.b_activo=1"
    }

    return qRe
  }

  static qReMinistraciones = () => {
    return `SELECT id, id_proyecto, i_numero, i_grupo, dt_recepcion, dt_registro
      FROM proyecto_ministraciones pm WHERE id_proyecto=? AND b_activo=1`
  }

  static qReRubrosMinistracion = (activos = true) => {
    let query = `SELECT mrp.id, mrp.id_ministracion, mrp.id_rubro, mrp.f_monto, mrp.nota, mrp.b_activo, rp.nombre rubro
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
    `INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto, nota ) VALUES ( ?, ?, ?, ? )`

  static qReNotasAjuste = () => `
    SELECT pan.id, pan.id_proyecto_ajuste, pan.id_usuario, pan.mensaje, pan.dt_registro,
    CONCAT(u.nombre, " ", u.apellido_paterno) usuario
    FROM proyecto_ajuste_notas pan
    JOIN usuarios u ON pan.id_usuario = u.id
    WHERE pan.b_activo=1 AND pan.id_proyecto_ajuste=?
  `

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
            if (!proyectosDB.length) {
              connection.destroy()
              return res({
                proyectos: [],
              })
            }

            const idsProyectos = proyectosDB.map((proy) => proy.id)

            //queries saldos
            const qRubros = this.qReRubros()
            const qSaldoSolicitudes = this.qReSolicitudesPagadas()
            const qSaldoComprobantes = this.qReSaldoComprobantes()
            const qAjustes = this.qReAjustes()
            const qCombinados = [
              qRubros,
              qSaldoSolicitudes,
              qSaldoComprobantes,
              qAjustes,
            ].join(";")

            const phCombinados = [
              idsProyectos,
              idsProyectos,
              idsProyectos,
              idsProyectos,
            ]

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
                  ajustes: results[3],
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
    const qAjustes = this.qReAjustes()

    const qCombinados = [
      qProyecto,
      qSaldoComprobantes,
      qMinistracioens,
      qRubrosMinistracion,
      qColaboradores,
      qProveedores,
      qSolicitudes,
      qNotas,
      qAjustes,
    ].join(";")

    const phCombinados = [id, id, id, id, id, id, id, id, id]

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
              ajustes: results[8],
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
      "SELECT id_alt FROM proyectos WHERE id_coparte=? ORDER BY dt_registro DESC LIMIT 1",
    ].join(";")

    const phIdALt = [
      data.id_financiador,
      data.id_coparte,
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
            const lastAltId = results[2][0]?.id_alt || 0
            const nextId = lastAltId ? Number(lastAltId.split("_")[2]) + 1 : 1
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
                  const { i_numero, dt_recepcion } = min
                  qMinistraciones.push(this.qCrMinistracion())
                  phMinistracion.push(
                    idProyecto,
                    i_numero,
                    0,
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
                        const { id_rubro, f_monto, nota } = rp
                        qRubros.push(this.qCrRubrosMinistracion())
                        phRubros.push(
                          idsMinistracion[index],
                          id_rubro,
                          f_monto,
                          nota
                        )
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
    const { ministraciones } = data

    const qProyecto = `UPDATE proyectos SET id_financiador=?, id_responsable=?, id_alt=?, nombre=?, id_tema_social=?, sector_beneficiado=?,
      i_beneficiados=?, id_estado=?, municipio=?, descripcion=?, dt_inicio=?, dt_fin=? WHERE id=? LIMIT 1`

    const qUpMinistracion = `UPDATE proyecto_ministraciones SET dt_recepcion=? WHERE id=? LIMIT 1`

    const qUpRubroMinistracion = `UPDATE ministracion_rubros_presupuestales SET
      f_monto=?, nota=? WHERE id=? LIMIT 1`

    const qReAcRubro = `UPDATE ministracion_rubros_presupuestales SET b_activo=1, f_monto=? WHERE id=? LIMIT 1`

    const qDlRubro = `UPDATE ministracion_rubros_presupuestales SET
      b_activo=0 WHERE id=? LIMIT 1`

    const qCombinados = [qProyecto]
    const phCombinados = [
      data.id_financiador,
      data.id_responsable,
      data.id_alt,
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
              const minAregistrar: MinistracionProyecto[] = []

              for (const min of ministraciones) {
                const { id, dt_recepcion, rubros_presupuestales } = min

                if (id) {
                  qCombinados.push(qUpMinistracion)
                  phCombinados.push(dt_recepcion, id)

                  for (const rp of rubros_presupuestales) {
                    const { id, f_monto, nota, id_rubro } = rp

                    if (id) {
                      qCombinados.push(qUpRubroMinistracion)
                      phCombinados.push(f_monto, nota, id)
                    } else {
                      const esRegistrado = rubrosDB.find(
                        (rDB) =>
                          rDB.id_rubro == id_rubro &&
                          rDB.id_ministracion == min.id &&
                          !rDB.b_activo
                      )
                      if (esRegistrado) {
                        qCombinados.push(qReAcRubro)
                        phCombinados.push(f_monto, esRegistrado.id)
                      } else {
                        qCombinados.push(this.qCrRubrosMinistracion())
                        phCombinados.push(min.id, id_rubro, f_monto, nota)
                      }
                    }
                  }
                  //revisar si algun rubro fue eliminado
                  const rubrosActivosMin = rubrosDB.filter(
                    ({ id_ministracion, b_activo }) =>
                      id_ministracion == id && !!b_activo
                  )
                  for (const rdb of rubrosActivosMin) {
                    const matchVista = rubros_presupuestales.find(
                      (rp) => rp.id == rdb.id
                    )
                    if (!matchVista) {
                      qCombinados.push(qDlRubro)
                      phCombinados.push(rdb.id)
                    }
                  }
                } else {
                  minAregistrar.push(min)
                }
              }

              //actualizar proyecto y ministraciones
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

                  const qMinistraciones = []
                  const phMinistracion = []

                  for (const min of minAregistrar) {
                    const { i_numero, dt_recepcion } = min
                    qMinistraciones.push(this.qCrMinistracion())
                    phMinistracion.push(
                      id_proyecto,
                      i_numero,
                      0,
                      dt_recepcion,
                      fechaActualAEpoch()
                    )
                  }

                  //crear ministraciones
                  if (qMinistraciones.length > 0) {
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

                        minAregistrar.forEach((min, index) => {
                          for (const rp of min.rubros_presupuestales) {
                            const { id_rubro, f_monto, nota } = rp
                            qRubros.push(this.qCrRubrosMinistracion())
                            phRubros.push(
                              idsMinistracion[index],
                              id_rubro,
                              f_monto,
                              nota
                            )
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
                              res(true)
                            })
                          }
                        )
                      }
                    )
                    return
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
    const qColaboradores = `
      SELECT c.id, CONCAT(TRIM(c.nombre), ' ', TRIM(c.apellido_paterno), ' ', TRIM(c.apellido_materno)) nombre, c.i_tipo, c.clabe, c.id_banco,
      b.nombre banco
      FROM colaboradores c
      JOIN bancos b ON b.id = c.id_banco
      WHERE c.id_proyecto=? AND c.b_activo=1
    `
    const qProveedores = `
      SELECT p.id, p.nombre, p.i_tipo, p.clabe, p.id_banco, p.bank, p.account_number,
      b.nombre banco
      FROM proveedores p
      LEFT JOIN bancos b ON b.id = p.id_banco
      WHERE p.id_proyecto=? AND p.b_activo=1
    `
    const qRubrosProyecto = this.qReRubrosProyectoDistinct

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

  static async obtenerDataAjuste(id_proyecto: number) {
    const qNombreProyecto = `
      SELECT CONCAT(id_alt, " - ", nombre) proyecto FROM proyectos WHERE id=? LIMIT 1
    `

    const ph = [id_proyecto, id_proyecto]

    const qCombinados = [qNombreProyecto, this.qReRubrosProyectoDistinct].join(
      ";"
    )

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
            proyecto: results[0][0]?.proyecto,
            rubros_presupuestales: results[1],
          }

          res(dataProyecto)
        })
      })
    })
  }

  static async obtenerAjuste(id_ajuste: number) {
    const qRe = this.qReAjustes(id_ajuste)
    const qReNotas = this.qReNotasAjuste()

    const qCombinados = [qRe, qReNotas].join(";")
    const ph = [id_ajuste, id_ajuste]

    try {
      const res = await queryDBPlaceHolder(qCombinados, ph)
      const ajuste = {
        ...res[0][0],
        notas: res[1],
      }
      return RespuestaDB.exitosa(ajuste)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearAjuste(id_proyecto: number, data: AjusteProyecto) {
    const query = `
      INSERT INTO proyecto_ajustes ( id_proyecto, id_partida_presupuestal, i_tipo, titular_cuenta,
      clabe, concepto, f_total, dt_ajuste, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `

    const placeHolders = [
      id_proyecto,
      data.id_partida_presupuestal,
      data.i_tipo,
      data.titular_cuenta,
      data.clabe,
      data.concepto,
      data.f_total,
      data.dt_ajuste,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async editarAjuste(data: AjusteProyecto) {
    const query = `
      UPDATE proyecto_ajustes SET id_partida_presupuestal=?, i_tipo=?, titular_cuenta=?,
      clabe=?, concepto=?, f_total=?, dt_ajuste=? WHERE id=? LIMIT 1
    `

    const placeHolders = [
      data.id_partida_presupuestal,
      data.i_tipo,
      data.titular_cuenta,
      data.clabe,
      data.concepto,
      data.f_total,
      data.dt_ajuste,
      data.id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrarAjuste(id_ajuste: number) {
    const query = `
      UPDATE proyecto_ajustes SET b_activo=0 WHERE id=? LIMIT 1
    `

    try {
      const res = await queryDBPlaceHolder(query, [id_ajuste])
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearAjusteNota(
    id_ajuste: number,
    data: NotaAjuste
  ): Promise<NotaAjuste[]> {
    const qCr = `
      INSERT proyecto_ajuste_notas SET id_proyecto_ajuste=?, id_usuario=?, mensaje=?, dt_registro=?
    `

    const phCr = [id_ajuste, data.id_usuario, data.mensaje, fechaActualAEpoch()]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qCr, phCr, (error, results, fields) => {
          if (error) {
            connection.destroy()
            return rej(error)
          }

          const qReNotas = this.qReNotasAjuste()

          connection.query(qReNotas, id_ajuste, (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            connection.destroy()
            res(results as NotaAjuste[])
          })
        })
      })
    })
  }
}

export { ProyectoDB }
