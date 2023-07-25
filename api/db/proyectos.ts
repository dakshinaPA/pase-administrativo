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

  static async obtener(
    id_coparte: number,
    id_proyecto: number,
    id_responsable: number
  ) {
    let query = `SELECT p.id, p.id_financiador, p.id_coparte, p.id_responsable, p.id_alt, p.nombre, p.id_tema_social, p.sector_beneficiado,
      p.i_tipo_financiamiento, p.i_beneficiados, p.id_estado, p.municipio, p.descripcion, p.dt_inicio, p.dt_fin, p.dt_registro,
      f.nombre financiador,
      c.nombre coparte, c.id_administrador,
      CONCAT(u.nombre, ' ', u.apellido_paterno) responsable,
      ts.nombre tema_social,
      e.nombre estado
      FROM proyectos p
      JOIN financiadores f ON p.id_financiador = f.id
      JOIN copartes c ON p.id_coparte = c.id
      JOIN usuarios u ON p.id_responsable = u.id
      JOIN temas_sociales ts ON p.id_tema_social = ts.id
      JOIN estados e ON p.id_estado = e.id
      WHERE p.b_activo = 1`

    if (id_coparte) {
      query += ` AND p.id_coparte = ${id_coparte}`
    }

    if (id_proyecto) {
      query += ` AND p.id=${id_proyecto}`
    }

    if (id_responsable) {
      query += ` AND p.id_responsable=${id_responsable}`
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
      id_financiador,
      id_coparte,
      id_responsable,
      id_alt,
      nombre,
      id_tema_social,
      sector_beneficiado,
      i_tipo_financiamiento,
      i_beneficiados,
      id_estado,
      municipio,
      descripcion,
      dt_inicio,
      dt_fin,
    } = data

    const query = `INSERT INTO proyectos ( id_financiador, id_coparte, id_responsable, id_alt, nombre, id_tema_social, sector_beneficiado,
      i_tipo_financiamiento, i_beneficiados, id_estado, municipio, descripcion, dt_inicio, dt_fin, dt_registro) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`

    const placeHolders = [
      id_financiador,
      id_coparte,
      id_responsable,
      id_alt,
      nombre,
      id_tema_social,
      sector_beneficiado,
      i_tipo_financiamiento,
      i_beneficiados,
      id_estado,
      municipio,
      descripcion,
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

  static async obtenerMinistraciones(id_proyecto: number) {
    let query = `SELECT pm.id, pm.i_numero, SUM(mrp.f_monto) f_monto, pm.i_grupo, pm.dt_recepcion, pm.dt_registro
      FROM proyecto_ministraciones pm
      JOIN ministracion_rubros_presupuestales mrp ON pm.id = mrp.id_ministracion
      WHERE pm.id_proyecto = ${id_proyecto} AND pm.b_activo=1 AND mrp.b_activo=1 GROUP BY pm.id`

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

  static async actualizarMinistracion(
    id_ministracion: number,
    data: MinistracionProyecto
  ) {
    const { i_numero, i_grupo, dt_recepcion } = data

    const query = `UPDATE proyecto_ministraciones SET i_numero=?,
      i_grupo=?, dt_recepcion=? WHERE id=? LIMIT 1`

    const placeHolders = [i_numero, i_grupo, dt_recepcion, id_ministracion]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerRubrosMinistracion(id_ministracion: number) {
    const query = `SELECT mrp.id, mrp.id_ministracion, mrp.id_rubro, mrp.f_monto,
    rp.nombre nombre
    FROM ministracion_rubros_presupuestales mrp
    JOIN rubros_presupuestales rp ON mrp.id_rubro = rp.id
    WHERE mrp.id_ministracion=? AND mrp.b_activo=1`

    const placeHolders = [id_ministracion]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async obtenerTodosRubrosMinistracion(id_ministracion: number) {
    const query = `SELECT id, id_rubro, b_activo FROM ministracion_rubros_presupuestales WHERE id_ministracion=?`

    const placeHolders = [id_ministracion]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

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

  static async crearRubroMinistracion(
    id_ministracion: number,
    data: RubroMinistracion
  ) {
    const { id_rubro, f_monto } = data

    const query = `INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )`

    const placeHolders = [id_ministracion, id_rubro, f_monto]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async crearRubrosMinistraciones(
    rubrosConIdMinistracion: RubrosConIdMinistracion[]
  ) {
    const queries = []
    const placeHolders = []

    for (const rubMin of rubrosConIdMinistracion) {
      const { id_ministracion, rubros } = rubMin

      for (const { id_rubro, f_monto } of rubros) {
        queries.push(
          "INSERT INTO ministracion_rubros_presupuestales ( id_ministracion, id_rubro, f_monto ) VALUES ( ?, ?, ? )"
        )

        placeHolders.push(id_ministracion, id_rubro, f_monto)
      }
    }

    const query = queries.join(";")

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  static async actualizarRubroMinistracion(data: RubroMinistracion) {
    const { id, f_monto } = data

    const query = `UPDATE ministracion_rubros_presupuestales SET f_monto=? WHERE id=? LIMIT 1`

    const placeHolders = [f_monto, id]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

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

  static async obtenerDataCrearIdAlt(
    id_financiador: number,
    id_coparte: number
  ) {
    const query = [
      "SELECT id_alt FROM financiadores WHERE id=? LIMIT 1",
      "SELECT id_alt FROM copartes WHERE id=? LIMIT 1",
      "SELECT count(*) cantidad FROM proyectos WHERE id_financiador=? AND id_coparte=?",
    ].join(";")

    const placeHolders = [
      id_financiador,
      id_coparte,
      id_financiador,
      id_coparte,
    ]

    try {
      const res = await queryDBPlaceHolder(query, placeHolders)
      return RespuestaDB.exitosa(res)
    } catch (error) {
      return RespuestaDB.fallida(error)
    }
  }

  // static async obtenerIdAltFinanciador(id_financiador: number) {
  //   let query = `SELECT id_alt FROM financiadores WHERE id=${id_financiador} LIMIT 1`

  //   try {
  //     const res = await queryDB(query)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async obtenerIdAltCoparte(id_coparte: number) {
  //   let query = `SELECT id_alt FROM copartes WHERE id=${id_coparte} LIMIT 1`

  //   try {
  //     const res = await queryDB(query)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  // static async obtenerUltimoId() {
  //   let query = `SELECT id FROM proyectos ORDER BY id DESC LIMIT 1`

  //   try {
  //     const res = await queryDB(query)
  //     return RespuestaDB.exitosa(res)
  //   } catch (error) {
  //     return RespuestaDB.fallida(error)
  //   }
  // }

  static async obtenerNotas(idProyecto: number) {
    let query = `SELECT p.id, p.mensaje, p.dt_registro,
      CONCAT(u.nombre, ' ', u.apellido_paterno) usuario
      FROM proyecto_notas p JOIN usuarios u ON p.id_usuario = u.id
      WHERE p.id_proyecto=${idProyecto} AND p.b_activo=1`

    try {
      const res = await queryDB(query)
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
