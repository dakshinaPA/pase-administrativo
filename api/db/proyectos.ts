import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Proyecto,
  MinistracionProyecto,
  RubroMinistracion,
  NotaProyecto,
  QueriesProyecto,
} from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"
import { connectionDB } from "./connectionPool"
import { ResProyectoDB } from "@api/models/proyecto.model"
import {
  ComprobanteSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { ColaboradorDB } from "./colaboradores"
import proveedores from "pages/api/proveedores"
import { ProveedorDB } from "./proveedores"
import { SolicitudesPresupuestoDB } from "./solicitudes-presupuesto"

interface RubrosConIdMinistracion {
  id_ministracion: number
  rubros: RubroMinistracion[]
}

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
      e.nombre estado,
      ps.id id_proyecto_saldo, ps.f_monto_total, ps.f_solicitado, ps.f_transferido, ps.f_comprobado, ps.f_retenciones, ps.f_pa, ps.p_avance
      FROM proyectos p
      JOIN proyecto_saldo ps ON ps.id_proyecto = p.id
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

        connection.query(qProyectos, phProyectos, (error, results, fields) => {
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

  static obtenerUno = async (id: number) => {
    const qProyecto = this.queryRe({ id })
    const qMinistracioens = `SELECT id, id_proyecto, i_numero, i_grupo, dt_recepcion, dt_registro
      FROM proyecto_ministraciones pm WHERE id_proyecto=? AND b_activo=1`
    const qRubrosMinistracion = `SELECT mrp.id, mrp.id_ministracion, mrp.id_rubro, mrp.f_monto, rp.nombre rubro
      FROM ministracion_rubros_presupuestales mrp
      JOIN rubros_presupuestales rp ON rp.id = mrp.id_rubro
      WHERE mrp.id_ministracion IN (
      SELECT id FROM proyecto_ministraciones WHERE id_proyecto=? AND b_activo=1
      ) AND mrp.b_activo=1`
    const qColaboradores = ColaboradorDB.queryRe(id)
    const qProveedores = ProveedorDB.queryRe(id)
    const qSolicitudes = SolicitudesPresupuestoDB.queryRe({ id_proyecto: id })
    const qNotas = this.reNotas()

    const qCombinados = [
      qProyecto,
      qMinistracioens,
      qRubrosMinistracion,
      qColaboradores,
      qProveedores,
      qSolicitudes,
      qNotas,
    ].join(";")

    const phCombinados = [id, id, id, id, id, id, id]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        //obtener proyecto
        connection.query(
          qCombinados,
          phCombinados,
          (error, results, fields) => {
            if (error) {
              connection.destroy()
              return rej(error)
            }

            connection.destroy()

            const dataProyecto: ResProyectoDB = {
              ...results[0][0],
              ministraciones: results[1],
              rubros_ministracion: results[2],
              colaboradores: results[3],
              proveedores: results[4],
              solicitudes: results[5],
              notas: results[6],
            }

            res(dataProyecto)
          }
        )
      })
    })
  }

  static qCrMinistracion =
    () => `INSERT INTO proyecto_ministraciones ( id_proyecto, i_numero, i_grupo,
    dt_recepcion, dt_registro ) VALUES ( ?, ?, ?, ?, ? )`

  static qCrRubrosMinistracion = () =>
    `INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )`

  static async crear(data: Proyecto) {
    const { ministraciones, saldo } = data

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

    const qSaldoProyecto = `INSERT INTO proyecto_saldo (id_proyecto, f_monto_total, 
      f_pa, p_avance) VALUES(?, ?, ?, ?)`

    const phSaldoProyecto = [saldo.f_monto_total, saldo.f_pa, saldo.p_avance]

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
                phSaldoProyecto.unshift(idProyecto)

                //crear saldo proyecto
                connection.query(
                  qSaldoProyecto,
                  phSaldoProyecto,
                  (error, results, fields) => {
                    if (error) {
                      return connection.rollback(() => {
                        connection.destroy()
                        rej(error)
                      })
                    }

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
                            phRubros.push(
                              idsMinistracion[index],
                              id_rubro,
                              f_monto
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
              }
            )
          })
        })
      })
    })
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    const {
      id_responsable,
      nombre,
      id_tema_social,
      sector_beneficiado,
      i_beneficiados,
      id_estado,
      municipio,
      descripcion,
      dt_inicio,
      dt_fin,
    } = data

    const query = `UPDATE proyectos SET id_responsable=?, nombre=?, id_tema_social=?, sector_beneficiado=?,
      i_beneficiados=?, id_estado=?, municipio=?, descripcion=?, dt_inicio=?, dt_fin=? WHERE id=? LIMIT 1`

    const placeHolders = [
      id_responsable,
      nombre,
      id_tema_social,
      sector_beneficiado,
      i_beneficiados,
      id_estado,
      municipio,
      descripcion,
      dt_inicio,
      dt_fin,
      id_proyecto,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
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

  // static async obtenerMinistraciones(id_proyecto: number) {
  //   let query = `SELECT pm.id, pm.i_numero, SUM(mrp.f_monto) f_monto, pm.i_grupo, pm.dt_recepcion, pm.dt_registro
  //     FROM proyecto_ministraciones pm
  //     JOIN ministracion_rubros_presupuestales mrp ON pm.id = mrp.id_ministracion
  //     WHERE pm.id_proyecto = ${id_proyecto} AND pm.b_activo=1 AND mrp.b_activo=1 GROUP BY pm.id`

  //   try {
  //     const res = await queryDB(query)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  static async crearMinistracion(
    id_proyecto: number,
    data: MinistracionProyecto
  ) {
    const { i_numero, i_grupo, dt_recepcion } = data

    const query = `INSERT INTO proyecto_ministraciones ( id_proyecto, i_numero, i_grupo,
      dt_recepcion, dt_registro ) VALUES ( ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_proyecto,
      i_numero,
      i_grupo,
      dt_recepcion,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearMinistraciones(
    id_proyecto: number,
    ministraciones: MinistracionProyecto[]
  ) {
    const queries = []
    const placeHolders = []

    for (const ministracion of ministraciones) {
      const { i_numero, i_grupo, dt_recepcion, rubros_presupuestales } =
        ministracion

      queries.push(
        "INSERT INTO proyecto_ministraciones ( id_proyecto, i_numero, i_grupo, dt_recepcion, dt_registro ) VALUES ( ?, ?, ?, ?, ? )"
      )

      placeHolders.push(
        id_proyecto,
        i_numero,
        i_grupo,
        dt_recepcion,
        fechaActualAEpoch()
      )
    }

    const query = queries.join(";")

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async actualizarMinistracion(
  //   id_ministracion: number,
  //   data: MinistracionProyecto
  // ) {
  //   const { i_numero, i_grupo, dt_recepcion } = data

  //   const query = `UPDATE proyecto_ministraciones SET i_numero=?,
  //     i_grupo=?, dt_recepcion=? WHERE id=? LIMIT 1`

  //   const placeHolders = [i_numero, i_grupo, dt_recepcion, id_ministracion]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async obtenerRubrosMinistracion(id_ministracion: number) {
  //   const query = `SELECT mrp.id, mrp.id_ministracion, mrp.id_rubro, mrp.f_monto,
  //   rp.nombre nombre
  //   FROM ministracion_rubros_presupuestales mrp
  //   JOIN rubros_presupuestales rp ON mrp.id_rubro = rp.id
  //   WHERE mrp.id_ministracion=? AND mrp.b_activo=1`

  //   const placeHolders = [id_ministracion]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async obtenerTodosRubrosMinistracion(id_ministracion: number) {
  //   const query = `SELECT id, id_rubro, b_activo FROM ministracion_rubros_presupuestales WHERE id_ministracion=?`

  //   const placeHolders = [id_ministracion]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  static async obtenerRubrosMinistraciones(id_proyecto: number) {
    const query = `SELECT DISTINCT mrp.id_rubro,
      rp.nombre
      FROM ministracion_rubros_presupuestales mrp
      JOIN rubros_presupuestales rp ON mrp.id_rubro = rp.id
      WHERE mrp.id_ministracion IN
      (SELECT pm.id FROM proyecto_ministraciones pm WHERE pm.id_proyecto=?)
      AND mrp.id_rubro!=1 AND mrp.b_activo=1`

    const placeHolders = [id_proyecto]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async crearRubroMinistracion(
  //   id_ministracion: number,
  //   data: RubroMinistracion
  // ) {
  //   const { id_rubro, f_monto } = data

  //   const query = `INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )`

  //   const placeHolders = [id_ministracion, id_rubro, f_monto]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async crearRubrosMinistraciones(
  //   rubrosConIdMinistracion: RubrosConIdMinistracion[]
  // ) {
  //   const queries = []
  //   const placeHolders = []

  //   for (const rubMin of rubrosConIdMinistracion) {
  //     const { id_ministracion, rubros } = rubMin

  //     for (const { id_rubro, f_monto } of rubros) {
  //       queries.push(
  //         "INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )"
  //       )

  //       placeHolders.push(id_ministracion, id_rubro, f_monto)
  //     }
  //   }

  //   const query = queries.join(";")

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async actualizarRubroMinistracion(data: RubroMinistracion) {
  //   const { id, f_monto } = data

  //   const query = `UPDATE ministracion_rubros_presupuestales SET f_monto=? WHERE id=? LIMIT 1`

  //   const placeHolders = [f_monto, id]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  static async reactivarRubroMinistracion(data: RubroMinistracion) {
    const { id, f_monto } = data

    const query = `UPDATE ministracion_rubros_presupuestales SET f_monto=?, b_activo=? WHERE id=? LIMIT 1`

    const placeHolders = [f_monto, 1, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async desactivarRubroMinistracion(id: number) {
    const query = `UPDATE ministracion_rubros_presupuestales SET b_activo=? WHERE id=? LIMIT 1`

    const placeHolders = [0, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
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
