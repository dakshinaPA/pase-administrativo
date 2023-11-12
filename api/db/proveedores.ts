import { RespuestaDB } from "@api/utils/response"
import { queryDBPlaceHolder } from "./query"
import { connectionDB } from "./connectionPool"
import { ProveedorProyecto } from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ProveedorDB {
  static queryRe = (id_proyecto: number, id_proveedor?: number) => {
    let query = `SELECT p.id, p.id_proyecto, p.nombre, p.i_tipo, p.clabe, p.id_banco, p.telefono, p.email, p.rfc, p.bank, p.bank_branch_address, p.account_number, p.bic_code, p.intermediary_bank, p.routing_number, p.descripcion_servicio, p.dt_registro,
    pd.id id_direccion, pd.calle, pd.numero_ext, pd.numero_int, pd.colonia, pd.municipio, pd.cp, pd.id_estado, pd.estado, pd.pais,
    pr.id_responsable, CONCAT(pr.nombre, ' - ', pr.id_alt) proyecto,
    b.nombre banco
    FROM proveedores p
    JOIN proyectos pr ON p.id_proyecto = pr.id
    JOIN proveedor_direccion pd ON p.id = pd.id_proveedor
    LEFT JOIN bancos b ON p.id_banco = b.id
    WHERE p.b_activo = 1`

    if (id_proyecto) {
      query += " AND p.id_proyecto=?"
    } else if (id_proveedor) {
      query += " AND p.id=?"
    }

    return query
  }

  static async obtener(id_proyecto: number, id_proveedor?: number) {
    const qProveedor = this.queryRe(id_proyecto, id_proveedor)

    const phProveedor = []

    if (id_proyecto) {
      phProveedor.push(id_proyecto)
    } else if (id_proveedor) {
      phProveedor.push(id_proveedor)
    }

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.query(qProveedor, phProveedor, (error, results, fields) => {
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

  static async crear(data: ProveedorProyecto) {
    const { direccion } = data

    const qProveedor = `INSERT INTO proveedores ( id_proyecto, nombre, i_tipo, clabe, id_banco, telefono, email, rfc, bank, bank_branch_address,
      account_number, bic_code, intermediary_bank, routing_number, descripcion_servicio, dt_registro ) VALUES ( ?, UPPER(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const phProveedor = [
      data.id_proyecto,
      data.nombre,
      data.i_tipo,
      data.clabe,
      data.id_banco,
      data.telefono,
      data.email,
      data.rfc,
      data.bank,
      data.bank_branch_address,
      data.account_number,
      data.bic_code,
      data.intermediary_bank,
      data.routing_number,
      data.descripcion_servicio,
      fechaActualAEpoch(),
    ]

    const qDireccion = `INSERT INTO proveedor_direccion ( id_proveedor, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado, estado, pais ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
      direccion.estado,
      direccion.pais,
    ]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //crear proveedor
          connection.query(
            qProveedor,
            phProveedor,
            (error, results, fields) => {
              if (error) {
                return connection.rollback(() => {
                  connection.destroy()
                  rej(error)
                })
              }

              // @ts-ignore
              const idProveedor = results.insertId
              phDireccion.unshift(idProveedor)

              //crear direccion
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
                    res(idProveedor)
                  })
                }
              )
            }
          )
        })
      })
    })
  }

  static async actualizar(id_proveedor: number, data: ProveedorProyecto) {
    const { direccion } = data

    const qProveedor = `UPDATE proveedores SET nombre=UPPER(?), i_tipo=?, clabe=?, id_banco=?, telefono=?, email=?, rfc=?, bank=?, bank_branch_address=?, account_number=?,
      bic_code=?, intermediary_bank=?, routing_number=?, descripcion_servicio=? WHERE id=? LIMIT 1`

    const phProveedor = [
      data.nombre,
      data.i_tipo,
      data.clabe,
      data.id_banco,
      data.telefono,
      data.email,
      data.rfc,
      data.bank,
      data.bank_branch_address,
      data.account_number,
      data.bic_code,
      data.intermediary_bank,
      data.routing_number,
      data.descripcion_servicio,
      id_proveedor,
    ]

    const qDireccion = `UPDATE proveedor_direccion SET calle=?, numero_ext=?, numero_int=?,
      colonia=?, municipio=?, cp=?, id_estado=?, estado=?, pais=? WHERE id=?`

    const phDireccion = [
      direccion.calle,
      direccion.numero_ext,
      direccion.numero_int,
      direccion.colonia,
      direccion.municipio,
      direccion.cp,
      direccion.id_estado,
      direccion.estado,
      direccion.pais,
      direccion.id,
    ]

    const qCombinados = [qProveedor, qDireccion]
    const phCombinados = [...phProveedor, ...phDireccion]

    return new Promise((res, rej) => {
      connectionDB.getConnection((err, connection) => {
        if (err) return rej(err)

        connection.beginTransaction((err) => {
          if (err) {
            connection.destroy()
            return rej(err)
          }

          //actualizar proveedor
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
  }

  static async borrar(id: number) {
    const query = `UPDATE proveedores SET b_activo=0 WHERE id=? LIMIT 1`

    try {
      const res = await queryDBPlaceHolder(query, [id])
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ProveedorDB }
