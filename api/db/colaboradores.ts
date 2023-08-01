import { RespuestaDB } from "@api/utils/response"
import { queryDB, queryDBPlaceHolder } from "./query"
import {
  ColaboradorProyecto,
  PeriodoServicioColaborador,
} from "@models/proyecto.model"
import { Direccion } from "@models/direccion.model"
import { fechaActualAEpoch } from "@assets/utils/common"

class ColaboradorDB {
  static queryRe = (id_proyecto: number, id_colaborador?: number) => {
    let query = `SELECT c.id, c.id_proyecto, c.id_empleado, c.nombre, c.apellido_paterno, c.apellido_materno, c.i_tipo, c.clabe,
      c.id_banco, c.telefono, c.email, c.rfc, c.curp, c.dt_registro,
      cd.id id_direccion, cd.calle, cd.numero_ext, cd.numero_int, cd.colonia, cd.municipio, cd.cp cp_direccion, cd.id_estado,
      p.id_responsable,  
      e.nombre estado,
      b.nombre banco
      FROM colaboradores c
      JOIN colaborador_direccion cd ON c.id = cd.id_colaborador
      JOIN estados e ON cd.id_estado = e.id
      JOIN bancos b ON c.id_banco = b.id
      JOIN proyectos p ON c.id_proyecto = p.id
      WHERE c.b_activo = 1`

    if (id_proyecto) {
      query += " AND c.id_proyecto=?"
    } else if (id_colaborador) {
      query += " AND c.id=?"
    }

    return query
  }

  static async obtener(id_proyecto: number, id_colaborador?: number) {
    const qColaborador = this.queryRe(id_proyecto, id_colaborador)

    const phColaborador = []

    if (id_proyecto) {
      phColaborador.push(id_proyecto)
    } else if (id_colaborador) {
      phColaborador.push(id_colaborador)
    }

    try {
      const res = await queryDBPlaceHolder(qColaborador, phColaborador)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crear(data: ColaboradorProyecto) {
    const {
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
    } = data

    const query = [
      "INSERT INTO colaboradores ( id_proyecto, nombre, apellido_paterno, apellido_materno, i_tipo, clabe, id_banco, telefono, email, rfc, curp, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )",
      "SELECT id_alt FROM proyectos WHERE id=?",
    ].join(";")

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
      fechaActualAEpoch(),
      id_proyecto,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizar(id_colaborador: number, data: ColaboradorProyecto) {
    const {
      id_empleado,
      nombre,
      apellido_paterno,
      apellido_materno,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      curp,
    } = data

    const query = `UPDATE colaboradores SET id_empleado=?, nombre=?, apellido_paterno=?, apellido_materno=?,
      clabe=?, id_banco=?, telefono=?, email=?, rfc=?, curp=? WHERE id=?`

    const placeHolders = [
      id_empleado,
      nombre,
      apellido_paterno,
      apellido_materno,
      clabe,
      id_banco,
      telefono,
      email,
      rfc,
      curp,
      id_colaborador,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async borrar(id: number) {
    const query = `UPDATE colaboradores SET b_activo=0 WHERE id=${id} LIMIT 1`

    try {
      const res = await queryDB(query)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearDireccion(id_colaborador: number, data: Direccion) {
    const { calle, numero_ext, numero_int, colonia, municipio, cp, id_estado } =
      data

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

    const query = `UPDATE colaborador_direccion SET calle=?, numero_ext=?, numero_int=?,
      colonia=?, municipio=?, cp=?, id_estado=? WHERE id=?`

    const placeHolders = [
      calle,
      numero_ext,
      numero_int,
      colonia,
      municipio,
      cp,
      id_estado,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerPeriodoServicio(id_colaborador: number) {
    const query = `SELECT id, i_numero_ministracion, f_monto, servicio, descripcion, cp, dt_inicio,
      dt_fin, dt_registro FROM colaborador_periodos_servicio WHERE id_colaborador=? AND b_activo=1`

    const placeHolders = [id_colaborador]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearPeriodoServicio(
    id_colaborador: number,
    data: PeriodoServicioColaborador
  ) {
    const {
      i_numero_ministracion,
      f_monto,
      servicio,
      descripcion,
      cp,
      dt_inicio,
      dt_fin,
    } = data

    const query = `INSERT INTO colaborador_periodos_servicio ( id_colaborador, i_numero_ministracion, f_monto, servicio, descripcion, cp,
      dt_inicio, dt_fin, dt_registro ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_colaborador,
      i_numero_ministracion,
      f_monto,
      servicio,
      descripcion,
      cp,
      dt_inicio,
      dt_fin,
      fechaActualAEpoch(),
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarPeriodoServicio(data: PeriodoServicioColaborador) {
    const {
      id,
      i_numero_ministracion,
      f_monto,
      servicio,
      descripcion,
      cp,
      dt_inicio,
      dt_fin,
    } = data

    const query = `UPDATE colaborador_periodos_servicio SET i_numero_ministracion=?, f_monto=?,
    servicio=?, descripcion=?, cp=?, dt_inicio=?, dt_fin=? WHERE id=? LIMIT 1`

    const placeHolders = [
      i_numero_ministracion,
      f_monto,
      servicio,
      descripcion,
      cp,
      dt_inicio,
      dt_fin,
      id,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async obtenerDataNuevoEmpleado(id_proyecto: number) {
  //   const query = "SELECT id_alt FROM proyectos WHERE id=?"

  //   const placeHolders = [id_proyecto]

  //   try {
  //     const res = await queryDBPlaceHolder(query, placeHolders)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  static async actualizarIdEmpleado(id_empleado: string, id: number) {
    const query = "UPDATE colaboradores SET id_empleado=? WHERE id=? LIMIT 1"

    const placeHolders = [id_empleado, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }
}

export { ColaboradorDB }
