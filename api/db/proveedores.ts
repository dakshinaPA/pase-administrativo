import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { ProveedorProyecto } from "@models/proyecto.model"
import { Direccion } from "@models/direccion.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ProveedorDB {
  static async obtener(id_proyecto: number, id_proveedor: number) {
    let query = `SELECT p.id, p.nombre, p.i_tipo, p.clabe, p.id_banco, p.telefono, p.email, p.rfc, p.descripcion_servicio, p.dt_registro,
      pd.id id_direccion, pd.calle, pd.numero_ext, pd.numero_int, pd.colonia, pd.municipio, pd.cp, pd.id_estado,
      e.nombre estado,
      b.nombre banco
      FROM proveedores p
      JOIN proveedor_direccion pd ON p.id = pd.id_proveedor
      JOIN estados e ON pd.id_estado = e.id
      JOIN bancos b ON p.id_banco = b.id
      WHERE p.b_activo = 1`

    if (id_proyecto) {
      query += ` AND p.id_proyecto=${id_proyecto}`
    }

    if (id_proveedor) {
      query += ` AND p.id=${id_proveedor}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: ProveedorProyecto) {
    const {
      id_proyecto,
      nombre,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      descripcion_servicio,
    } = data

    const query = `INSERT INTO proveedores ( id_proyecto, nombre, i_tipo, clabe, id_banco, telefono, email, rfc, descripcion_servicio, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_proyecto,
      nombre,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      descripcion_servicio,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id_proveedor: number, data: ProveedorProyecto) {
    const {
      nombre,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      descripcion_servicio,
    } = data

    const query = `UPDATE proveedores SET nombre=?, i_tipo=?, clabe=?, id_banco=?,
    telefono=?, email=?, rfc=?, descripcion_servicio=? WHERE id=? LIMIT 1`

    const placeHolders = [
      nombre,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      descripcion_servicio,
      id_proveedor,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE proveedores SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearDireccion(id_proveedor: number, data: Direccion) {
    const { calle, numero_ext, numero_int, colonia, municipio, cp, id_estado } =
      data

    const query = `INSERT INTO proveedor_direccion ( id_proveedor, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_proveedor,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarDireccion(data: Direccion) {
    const {
      id,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
    } = data

    const query = `UPDATE proveedor_direccion SET calle=?, numero_ext=?, numero_int=?,
      colonia=?, municipio=?, cp=?, id_estado=? WHERE id=?`

    const placeHolders = [
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      id
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ProveedorDB }
