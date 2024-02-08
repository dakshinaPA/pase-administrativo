import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Coparte,
  NotaCoparte,
  QueriesCoparte,
} from "@models/coparte.model"
import { fechaActualAEpoch } from "@assets/utils/common"
import { connectionDB } from "./connectionPool"
import { UsuarioDB } from "./usuarios"
import { ProyectoDB } from "./proyectos"

class CoparteDB {
  static async obtenerVmin(id_coparte: number, id_admin: number) {
    let query = `SELECT id, nombre, nombre_corto FROM copartes WHERE b_activo = 1`

    if (id_admin) {
      query += ` AND id_administrador=${id_admin}`
    }

    if (id_coparte) {
      query += ` AND id=${id_coparte}`
    }

    query += " ORDER BY nombre"

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(queries: QueriesCoparte) {
    const { id, id_admin } = queries

    let qCopartes = `
      SELECT c.id, c.id_administrador, c.id_alt, c.nombre, c.nombre_corto, c.i_estatus_legal, c.representante_legal, c.rfc, c.dt_registro,
      cd.id id_coparte_direccion, cd.calle, cd.numero_ext, cd.numero_int, cd.colonia, cd.municipio, cd.cp, cd.id_estado,
      CONCAT(u.nombre, ' ', u.apellido_paterno) administrador,
      e.nombre estado
      FROM copartes c
      JOIN coparte_direccion cd ON c.id = cd.id_coparte
      JOIN usuarios u ON c.id_administrador = u.id
      JOIN estados e ON cd.id_estado = e.id
      WHERE c.b_activo=1`

    const phCopartes = []

    if (id) {
      qCopartes += " AND c.id=? LIMIT 1"
      phCopartes.push(id)
    } else if (id_admin) {
      qCopartes += " AND c.id_administrador=?"
      phCopartes.push(id_admin)
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qCopartes, phCopartes, (error, results, fields) => {
          if (error) {
            connection.destroy()
            return rej(error)
          }

          if (id) {
            const coparte = results[0]
            const qUsuarios = UsuarioDB.queryRe({ id_coparte: id })
            const qProyectos = ProyectoDB.queryRe({ id_coparte: id })
            const qNotas = this.queryNotas()

            const qCombinados = [qUsuarios, qProyectos, qNotas].join(";")
            const phCombinados = [id, id, id]

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
                    ...coparte,
                    usuarios: results[0],
                    proyectos: results[1],
                    notas: results[2],
                  },
                ])
              }
            )
            return
          }
          connection.destroy()
          res(results)
        })
      })
    })
  }

  static async crear(data: Coparte) {
    const { enlace, direccion } = data

    const qCoparte = `INSERT INTO copartes ( id_administrador, id_alt, nombre, nombre_corto, i_estatus_legal,
      representante_legal, rfc, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const phCoparte = [
      data.id_administrador,
      data.id_alt,
      data.nombre,
      data.nombre_corto,
      data.i_estatus_legal,
      data.representante_legal,
      data.rfc,
      fechaActualAEpoch(),
    ]

    const qDireccion = `INSERT INTO coparte_direccion ( id_coparte, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
    ]

    const qUsuario = UsuarioDB.queryCrUsuario()

    const phUsuario = [
      enlace.nombre,
      enlace.apellido_paterno,
      enlace.apellido_materno,
      enlace.email,
      enlace.telefono,
      enlace.password,
      UsuarioDB.encryptKey(),
      3,
      fechaActualAEpoch(),
    ]

    const qCoparteUsuario = UsuarioDB.queryCrCoparteUsuario()

    const phCoparteUsuario = [enlace.cargo, 1]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //guardar coparte
          connection.query(qCoparte, phCoparte, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }
            // @ts-ignore
            const idCoparte = results.insertId
            phDireccion.unshift(idCoparte)
            phCoparteUsuario.unshift(idCoparte)

            //guardar direccion
            connection.query(
              qDireccion,
              phDireccion,
              (error, results, fields) => {
                if (error) {
                  return connection.rollback(() => {
                    connection.destroy()
                    rej(error)
                  })
                }

                //guardar usuario
                connection.query(
                  qUsuario,
                  phUsuario,
                  (error, results, fields) => {
                    if (error) {
                      return connection.rollback(() => {
                        connection.destroy()
                        rej(error)
                      })
                    }

                    // @ts-ignore
                    const idUsuario = results.insertId
                    phCoparteUsuario.unshift(idUsuario)

                    //guardar coparte usuario
                    connection.query(
                      qCoparteUsuario,
                      phCoparteUsuario,
                      (error, results, fields) => {
                        if (error) {
                          return connection.rollback(() => {
                            connection.destroy()
                            rej(error)
                          })
                        }
                        // hacer commit
                        connection.commit((err) => {
                          if (err) connection.rollback(() => rej(err))
                          connection.destroy()
                          res(idCoparte)
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

  static async actualizar(id_coparte: number, data: Coparte) {
    const { direccion } = data

    const qCoparte = `UPDATE copartes SET id_administrador=?, nombre=?, nombre_corto=?,
      i_estatus_legal=?, representante_legal=?, rfc=? WHERE id=? LIMIT 1`

    const phCoparte = [
      data.id_administrador,
      data.nombre,
      data.nombre_corto,
      data.i_estatus_legal,
      data.representante_legal,
      data.rfc,
      id_coparte,
    ]

    const qDireccion = `UPDATE coparte_direccion SET calle=?, numero_ext=?, numero_int=?,
      colonia=?, municipio=?, cp=?, id_estado=? WHERE id=? LIMIT 1`

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

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //actualizar coparte
          connection.query(qCoparte, phCoparte, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }

            //actualizar direccion
            connection.query(
              qDireccion,
              phDireccion,
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
    const query = `UPDATE copartes SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static queryNotas = () => {
    return `SELECT cn.id, cn.mensaje, cn.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM coparte_notas cn JOIN usuarios u ON cn.id_usuario = u.id
      WHERE cn.id_coparte=? AND cn.b_activo=1`
  }

  static async obtenerNotas(idCoparte: number) {
    const query = this.queryNotas()

    try {
      const res = await queryDBPlaceHolder(query, [idCoparte])
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearNota(id_coparte: number, data: NotaCoparte) {
    const { id_usuario, mensaje } = data

    const query = `INSERT INTO coparte_notas ( id_coparte, id_usuario,
      mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`

    const placeHolders = [id_coparte, id_usuario, mensaje, fechaActualAEpoch()]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { CoparteDB }
