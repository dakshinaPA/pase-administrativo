import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { connectionDB } from "./connectionPool"
import {
  Financiador,
  EnlaceFinanciador,
  DireccionFinanciador,
  NotaFinanciador,
} from "@models/financiador.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class FinanciadorDB {
  static async obtenerVminimalista() {
    let query = `SELECT id, nombre from financiadores`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(id: number) {
    let qFinanciador = `SELECT f.id, f.id_alt, f.nombre, f.representante_legal, f.rfc_representante_legal, f.pagina_web, f.rfc, f.actividad, f.i_tipo, f.dt_constitucion, f.dt_registro,
      fe.id id_enlace, fe.nombre nombre_enlace, fe.apellido_paterno, fe.apellido_materno, fe.email, fe.telefono,
      fd.id id_direccion, fd.calle, fd.numero_ext, fd.numero_int, fd.colonia, fd.municipio, fd.cp, fd.id_estado, fd.estado, fd.id_pais,
      p.nombre pais
      FROM financiadores f
      JOIN financiador_enlace fe ON f.id = fe.id_financiador
      JOIN financiador_direccion fd ON f.id = fd.id_financiador
      JOIN paises p ON fd.id_pais = p.id
      WHERE f.b_activo=1`

    if (id) {
      qFinanciador += " AND f.id=? LIMIT 1"
    }

    const qNotas = `SELECT fn.id, fn.mensaje, fn.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM financiador_notas fn JOIN usuarios u ON fn.id_usuario = u.id
      WHERE fn.id_financiador=? AND fn.b_activo=1`

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qFinanciador, id, (error, results, fields) => {
          if (error) {
            connection.destroy()
            return rej(error)
          }

          if (id) {
            let financiador = results[0]

            connection.query(qNotas, id, (error, results, fields) => {
              if (error) {
                connection.destroy()
                return rej(error)
              }

              connection.destroy()
              res([{
                ...financiador,
                notas: results,
              }])
            })
            return
          }
          connection.destroy()
          res(results)
        })
      })
    })
  }

  static async crear(data: Financiador) {
    const { enlace, direccion } = data

    const qFinanciador = `INSERT INTO financiadores ( id_alt, nombre, representante_legal, rfc_representante_legal, pagina_web,
      rfc, actividad, i_tipo, dt_constitucion, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const phFinanciador = [
      data.id_alt,
      data.nombre,
      data.representante_legal,
      data.rfc_representante_legal,
      data.pagina_web,
      data.rfc,
      data.actividad,
      data.i_tipo,
      data.dt_constitucion,
      fechaActualAEpoch(),
    ]

    const qEnlace = `INSERT INTO financiador_enlace ( id_financiador, nombre, apellido_paterno,
      apellido_materno, email, telefono ) VALUES ( ?, ?, ?, ?, ?, ? )`

    const phEnlace = [
      enlace.nombre,
      enlace.apellido_paterno,
      enlace.apellido_materno,
      enlace.email,
      enlace.telefono,
    ]

    const qDireccion = `INSERT INTO financiador_direccion ( id_financiador, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado, estado, id_pais ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
      direccion.estado,
      direccion.id_pais,
    ]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          const idsCreados = {
            financiador: 0,
            enlace: 0,
            direccion: 0,
          }

          //guardar financiador
          connection.query(
            qFinanciador,
            phFinanciador,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }
              // @ts-ignore
              const idFinanciador = results.insertId
              idsCreados.financiador = idFinanciador
              phEnlace.unshift(idFinanciador)
              phDireccion.unshift(idFinanciador)

              //guardar enlace
              connection.query(qEnlace, phEnlace, (error, results, fields) => {
                if (error) {
                  return connection.rollback(() => {
                    connection.destroy()
                    rej(error)
                  })
                }
                // @ts-ignore
                idsCreados.enlace = results.insertId

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
                    // @ts-ignore
                    idsCreados.direccion = results.insertId

                    connection.commit((err) => {
                      if (err) {
                        return connection.rollback(() => rej(error))
                      }
                      connection.destroy()
                      res(idsCreados)
                    })
                  }
                )
              })
            }
          )
        })
      })
    })
  }

  static async actualizar(id: number, data: Financiador) {
    const { enlace, direccion } = data

    const qFinanciador = `UPDATE financiadores SET nombre=?, representante_legal=?, rfc_representante_legal=?,
      pagina_web=?, rfc=?, actividad=?, i_tipo=?, dt_constitucion=? WHERE id=? LIMIT 1`

    const phFinanciador = [
      data.nombre,
      data.representante_legal,
      data.rfc_representante_legal,
      data.pagina_web,
      data.rfc,
      data.actividad,
      data.i_tipo,
      data.dt_constitucion,
      id,
    ]

    const qEnlace = `UPDATE financiador_enlace SET nombre=?, apellido_paterno=?,
    apellido_materno=?, email=?, telefono=? WHERE id=? LIMIT 1`

    const phEnlace = [
      enlace.nombre,
      enlace.apellido_paterno,
      enlace.apellido_materno,
      enlace.email,
      enlace.telefono,
      enlace.id,
    ]

    const qDireccion = `UPDATE financiador_direccion SET calle=?, numero_ext=?,
    numero_int=?, colonia=?, municipio=?, cp=?, id_estado=?, estado=?, id_pais=? WHERE id=? LIMIT 1`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
      direccion.estado,
      direccion.id_pais,
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

          //actualizar financiador
          connection.query(
            qFinanciador,
            phFinanciador,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }

              //actualizar enlace
              connection.query(qEnlace, phEnlace, (error, results, fields) => {
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
                      if (err) {
                        return connection.rollback(() => rej(error))
                      }
                      connection.destroy()
                      res(true)
                    })
                  }
                )
              })
            }
          )
        })
      })
    })
  }

  static async borrar(id: number) {
    const query = `UPDATE financiadores SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerNotas(idFinanciador: number) {
    let query = `SELECT fn.id, fn.mensaje, fn.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM financiador_notas fn JOIN usuarios u ON fn.id_usuario = u.id
      WHERE fn.id_financiador=${idFinanciador} AND fn.b_activo=1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearNota(id_financiador: number, data: NotaFinanciador) {
    const { id_usuario, mensaje } = data

    const query = `INSERT INTO financiador_notas ( id_financiador, id_usuario,
      mensaje, dt_registro ) VALUES ( ?, ?, ?, ? )`

    const placeHolders = [
      id_financiador,
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
}

export { FinanciadorDB }
