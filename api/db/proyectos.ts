import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  Proyecto,
  RubroProyecto,
  MinistracionProyecto,
} from "@models/proyecto.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ProyectoDB {
  static async obtenerVMin(id_proyecto?: number) {
    let query = `SELECT id, id_alt from proyectos WHERE b_activo=1`

    if (id_proyecto) {
      query += ` AND id=${id_proyecto}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtener(
    id_coparte: number,
    id_proyecto: number,
    id_usuario: number
  ) {
    let query = `SELECT p.id, p.id_financiador, p.id_coparte, p.id_responsable, p.id_alt, p.f_monto_total, p.i_tipo_financiamiento, p.i_beneficiados, p.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) nombre_responsable,
      f.nombre financiador
      FROM proyectos p
      JOIN usuarios u ON p.id_responsable = u.id
      JOIN financiadores f ON p.id_financiador = f.id
      WHERE p.b_activo = 1`

    if (id_coparte) {
      query += ` AND p.id_coparte = ${id_coparte}`
    }

    if (id_proyecto) {
      query += ` AND p.id=${id_proyecto} LIMIT 1`
    }

    if (id_usuario) {
      query += ` AND p.id_responsable=${id_usuario}`
    }

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: Proyecto) {
    const {
      id_coparte,
      financiador,
      responsable,
      id_alt,
      f_monto_total,
      i_tipo_financiamiento,
      i_beneficiados,
    } = data

    const query = `INSERT INTO proyectos ( id_financiador, id_coparte, id_responsable, id_alt,
      f_monto_total, i_tipo_financiamiento, i_beneficiados, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      financiador.id,
      id_coparte,
      responsable.id,
      id_alt,
      f_monto_total,
      i_tipo_financiamiento,
      i_beneficiados,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    const {
      financiador,
      responsable,
      id_alt,
      f_monto_total,
      i_tipo_financiamiento,
      i_beneficiados,
    } = data

    // const query = `UPDATE proyectos SET id_financiador=?, id_responsable=?,
    // id_alt=?, f_monto_total=?, i_tipo_financiamiento=?, i_beneficiados=? WHERE id=? LIMIT 1`
    const query = `UPDATE proyectos SET id_responsable=?,
    f_monto_total=?, i_beneficiados=? WHERE id=? LIMIT 1`

    const placeHolders = [
      // financiador.id,
      responsable.id,
      // id_alt,
      f_monto_total,
      // i_tipo_financiamiento,
      i_beneficiados,
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

  static async obtenerRubros(id_proyecto: number) {
    let query = `SELECT prp.id, prp.id_rubro, prp.f_monto,
      rp.nombre
      FROM proyecto_rubros_presupuestales prp
      JOIN rubros_presupuestales rp ON prp.id_rubro = rp.id
      WHERE prp.id_proyecto = ${id_proyecto} AND prp.b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearRubro(id_proyecto: number, data: RubroProyecto) {
    const { id_rubro, f_monto } = data

    const query = `INSERT INTO proyecto_rubros_presupuestales ( id_proyecto, id_rubro, f_monto ) VALUES ( ?, ?, ? )`

    const placeHolders = [id_proyecto, id_rubro, f_monto]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async limpiarRubros(id_proyecto: number) {
    const query = `UPDATE proyecto_rubros_presupuestales SET b_activo=0 WHERE id_proyecto=${id_proyecto}`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarRubro(rubro: RubroProyecto) {
    const { id, f_monto } = rubro

    const query = `UPDATE proyecto_rubros_presupuestales SET f_monto=?, b_activo=1 WHERE id=?`

    const placeHolders = [f_monto, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerMinistraciones(id_proyecto: number) {
    let query = `SELECT id, i_numero, f_monto, i_grupo, dt_recepcion, dt_registro
      FROM proyecto_ministraciones WHERE id_proyecto = ${id_proyecto} AND b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearMinistracion(
    id_proyecto: number,
    data: MinistracionProyecto
  ) {
    const { i_numero, f_monto, i_grupo, dt_recepcion } = data

    const query = `INSERT INTO proyecto_ministraciones ( id_proyecto, i_numero, f_monto, i_grupo, dt_recepcion, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_proyecto,
      i_numero,
      f_monto,
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

  static async actualizarMinistracion(data: MinistracionProyecto) {
    const { id, i_numero, f_monto, i_grupo, dt_recepcion } = data

    const query = `UPDATE proyecto_ministraciones SET i_numero=?, f_monto=?,
      i_grupo=?, dt_recepcion=? WHERE id=? LIMIT 1`

    const placeHolders = [i_numero, f_monto, i_grupo, dt_recepcion, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerIdAltFinanciador(id_financiador: number) {
    let query = `SELECT id_alt FROM financiadores WHERE id=${id_financiador} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerIdAltCoparte(id_coparte: number) {
    let query = `SELECT id_alt FROM copartes WHERE id=${id_coparte} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerUltimoId() {
    let query = `SELECT id FROM proyectos ORDER BY id DESC LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ProyectoDB }
