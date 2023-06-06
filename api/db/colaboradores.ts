import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import { ColaboradorProyecto } from "@models/proyecto.model"
import { Direccion } from "@models/direccion.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ColaboradorDB {
  static async obtener(id_proyecto: number) {
    let query = `SELECT c.id, c.nombre, c.apellido_paterno, c.apellido_materno, c.i_tipo, c.clabe, c.id_banco, c.telefono, c.email, c.rfc,
      c.curp, c.cp, c.nombre_servicio, c.descripcion_servicio, c.f_monto_total, c.dt_inicio_servicio, c.dt_fin_servicio, c.dt_registro,
      cd.id id_direccion, cd.calle, cd.numero_ext, cd.numero_int, cd.colonia, cd.municipio, cd.cp cp_direccion, cd.id_estado,
      e.nombre estado,
      b.nombre banco
      FROM colaboradores c
      JOIN colaborador_direccion cd ON c.id = cd.id_colaborador
      JOIN estados e ON cd.id_estado = e.id
      JOIN bancos b ON c.id_banco = b.id
      WHERE c.id_proyecto = ${id_proyecto} AND c.b_activo = 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(
    id_proyecto: number,
    data: ColaboradorProyecto
  ) {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      curp,
      cp,
      nombre_servicio,
      descripcion_servicio,
      f_monto_total,
      dt_inicio_servicio,
      dt_fin_servicio,
    } = data

    const query = `INSERT INTO colaboradores ( id_proyecto, nombre, apellido_paterno, apellido_materno, i_tipo, clabe, id_banco, telefono, email, rfc, curp, cp, nombre_servicio,
      descripcion_servicio, f_monto_total, dt_inicio_servicio, dt_fin_servicio, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_proyecto,
      nombre,
      apellido_paterno,
      apellido_materno,
      i_tipo,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      curp,
      cp,
      nombre_servicio,
      descripcion_servicio,
      f_monto_total,
      dt_inicio_servicio,
      dt_fin_servicio,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearDireccion(
    id_colaborador: number,
    data: Direccion
  ) {
    const {
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado
    } = data

    const query = `INSERT INTO colaborador_direccion ( id_colaborador, calle, numero_ext, numero_int,
      colonia, municipio, cp, id_estado ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_colaborador,
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ColaboradorDB }
