import { queryDB, queryDBPlaceHolder } from "./query"
import { connectionDB } from "./connectionPool"
import { QueriesUsuario, Usuario } from "@models/usuario.model"
import { LoginUsuario } from "@api/models/usuario.model"
import { RespuestaDB } from "@api/utils/response"
import { fechaActualAEpoch } from "@assets/utils/common"

const encryptKey = "dakshina23"

class UsuarioDB {
  static async login({ email, password }: LoginUsuario) {
    const query = `SELECT id, nombre, apellido_paterno, apellido_materno, id_rol
      FROM usuarios WHERE email=? AND password=AES_ENCRYPT(?,?) AND b_activo=1`
    const placeHolders = [email, password, encryptKey]

    try {
      // const res = await queryDBPlaceHolder(query, placeHolders)
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(queries: QueriesUsuario) {
    const { id, id_rol, id_coparte, min } = queries

    let qUsuario = `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.telefono, CAST(AES_DECRYPT(u.password, '${encryptKey}') AS CHAR) password, u.id_rol,
      r.nombre rol,
      cu.id id_coparte_usuario, cu.id_coparte, cu.cargo, cu.b_enlace,
      c.nombre coparte
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id
      LEFT JOIN coparte_usuarios cu ON cu.id_usuario = u.id
      LEFT JOIN copartes c ON cu.id_coparte = c.id
      WHERE u.b_activo=1`

    const phUsuario = []

    if (id) {
      qUsuario += " AND u.id=? LIMIT 1"
      phUsuario.push(id)
    } else if ([1, 2].includes(Number(id_rol))) {
      qUsuario += " AND u.id_rol=?"
      phUsuario.push(id_rol)
    } else if (id_coparte) {
      qUsuario += " AND u.id_rol=3 AND cu.id_coparte=?"
      phUsuario.push(id_coparte)
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qUsuario, phUsuario, (error, results, fields) => {
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

  static async crear(data: Usuario) {
    const { coparte } = data

    const qUsuario = `INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno,
    email, telefono, password, id_rol, dt_registro ) VALUES (?, ?, ?, ?, ?, AES_ENCRYPT(?,?), ?, ?)`

    const phUsuario = [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.email,
      data.telefono,
      data.password,
      encryptKey,
      data.id_rol,
      fechaActualAEpoch(),
    ]

    const qCoparteUsuario = `INSERT INTO coparte_usuarios ( id_usuario, id_coparte,
      cargo ) VALUES ( ?, ?, ? )`

    const phCoparteUsuario = [coparte.id_coparte, coparte.cargo]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //crear usuario
          connection.query(qUsuario, phUsuario, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }

            // @ts-ignore
            const id_usuario = results.insertId
            phCoparteUsuario.unshift(id_usuario)

            if (data.id_rol == 3) {
              //crear coparte - usuario
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

                  connection.commit((err) => {
                    if (err) return connection.rollback(() => rej(error))
                    connection.destroy()
                    res(id_usuario)
                  })
                }
              )
              return
            }
            connection.commit((err) => {
              if (err) return connection.rollback(() => rej(error))
              connection.destroy()
              res(id_usuario)
            })
          })
        })
      })
    })
  }

  static async actualizar(id: number, data: Usuario) {
    const { coparte } = data

    const qUsuario = `UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=?,
      password=AES_ENCRYPT(?,?) WHERE id=? LIMIT 1`

    const phUsuario = [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.email,
      data.telefono,
      data.password,
      encryptKey,
      id,
    ]

    const qCoparteUsuario = `UPDATE coparte_usuarios SET cargo=? WHERE id=? LIMIT 1`

    const phCoparteUsuario = [coparte?.cargo, coparte?.id]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //actualizar usuario
          connection.query(qUsuario, phUsuario, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                connection.destroy()
                rej(error)
              })
            }

            if (data.id_rol == 3) {
              //actualizar coparte - usuario
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

                  connection.commit((err) => {
                    if (err) return connection.rollback(() => rej(error))
                    connection.destroy()
                    res(true)
                  })
                }
              )
              return
            }
            connection.commit((err) => {
              if (err) return connection.rollback(() => rej(error))
              connection.destroy()
              res(true)
            })
          })
        })
      })
    })
  }

  static async borrar(id: number) {
    const query = `UPDATE usuarios SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async obtenerCoparteCoparte(id: number) {
  //   let query = `SELECT cu.id, cu.id_coparte, c.nombre, cu.cargo, cu.b_enlace
  //   FROM coparte_usuarios cu JOIN copartes c ON cu.id_coparte = c.id
  //   WHERE id_usuario=${id} LIMIT 1`

  //   try {
  //     const res = await queryDB(query)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }
}

export { UsuarioDB }
