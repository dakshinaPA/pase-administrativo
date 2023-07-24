import { ColaboradorDB } from "@api/db/colaboradores"
import { RespuestaController } from "@api/utils/response"
import { ResColaboradoreDB } from "@api/models/colaborador.model"
import {
  ColaboradorProyecto,
  PeriodoServicioColaborador,
} from "@models/proyecto.model"

class ColaboradorServices {
  static obtenerTipo(id_tipo: 1 | 2 | 3) {
    switch (id_tipo) {
      case 1:
        return "Asimilado"
      case 2:
        return "Honorarios"
      case 3:
        return "Sin pago"
    }
  }

  static async obtener(id_proyecto: number, id_colaborador?: number) {
    try {
      const obtenerDB = await ColaboradorDB.obtener(id_proyecto, id_colaborador)
      if (obtenerDB.error) throw obtenerDB.data

      const colaboradoresDB = obtenerDB.data as ResColaboradoreDB[]

      const dataTransformada: ColaboradorProyecto[] = await Promise.all(
        colaboradoresDB.map(async (colaborador) => {
          const {
            id,
            id_proyecto,
            id_responsable,
            id_empleado,
            nombre,
            apellido_paterno,
            apellido_materno,
            i_tipo,
            clabe,
            id_banco,
            banco,
            telefono,
            email,
            rfc,
            curp,
            id_direccion,
            calle,
            numero_ext,
            numero_int,
            colonia,
            municipio,
            cp_direccion,
            id_estado,
            estado,
          } = colaborador

          let periodos_servicio: PeriodoServicioColaborador[] = null

          if (id_colaborador) {
            const rePeriodosServicio = await this.obtenerPeriodosServicio(id)
            if (rePeriodosServicio.error) throw rePeriodosServicio.data
            periodos_servicio =
              rePeriodosServicio.data as PeriodoServicioColaborador[]
          }

          return {
            id,
            id_proyecto,
            id_responsable,
            id_empleado,
            nombre,
            apellido_paterno,
            apellido_materno,
            i_tipo,
            tipo: this.obtenerTipo(i_tipo),
            clabe,
            id_banco,
            banco,
            telefono,
            email,
            rfc,
            curp,
            direccion: {
              id: id_direccion,
              calle,
              numero_ext,
              numero_int,
              colonia,
              municipio,
              cp: cp_direccion,
              id_estado,
              estado,
            },
            periodos_servicio,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        dataTransformada
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener colaboradores",
        error
      )
    }
  }

  static async crear(data: ColaboradorProyecto) {
    try {
      const { direccion, periodos_servicio } = data

      const cr = await ColaboradorDB.crear(data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data[0].insertId as number
      const idAltProyecto = cr.data[1][0].id_alt
      const [idFinanciador, idCoparte, idProyecto] = idAltProyecto.split("_")
      const idEmpleado = `${idFinanciador}${idCoparte}${idProyecto}_${idInsertado}`

      const upNumeroEmpleado = ColaboradorDB.actualizarIdEmpleado(
        idEmpleado,
        idInsertado
      )
      const crDireccion = ColaboradorDB.crearDireccion(idInsertado, direccion)

      const promesas = [upNumeroEmpleado, crDireccion]

      for (const ps of periodos_servicio) {
        promesas.push(ColaboradorDB.crearPeriodoServicio(idInsertado, ps))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(201, "Colaborador creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear colaborador",
        error
      )
    }
  }

  static async actualizar(id_colaborador: number, data: ColaboradorProyecto) {
    try {
      const { direccion, periodos_servicio } = data

      const up = ColaboradorDB.actualizar(id_colaborador, data)
      const upDireccion = ColaboradorDB.actualizarDireccion(direccion)

      const promesas = [up, upDireccion]

      for (const ps of periodos_servicio) {
        if (ps.id) {
          promesas.push(ColaboradorDB.actualizarPeriodoServicio(ps))
        } else {
          promesas.push(ColaboradorDB.crearPeriodoServicio(id_colaborador, ps))
        }
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const reColaborador = await this.obtener(0, id_colaborador)
      if (reColaborador.error) throw reColaborador.data

      const colaboradorUp = reColaborador.data[0] as ColaboradorDB

      return RespuestaController.exitosa(
        200,
        "Colaborador actualizado con éxito",
        colaboradorUp
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar colaborador",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ColaboradorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar colaborador",
        null
      )
    }
    return RespuestaController.exitosa(
      200,
      "Colaborador borrado con éxito",
      dl.data
    )
  }

  static async obtenerPeriodosServicio(id_colaborador: number) {
    const re = await ColaboradorDB.obtenerPeriodoServicio(id_colaborador)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener periodos de servicio de colaborador",
        null
      )
    }

    const periodosServicio = re.data as PeriodoServicioColaborador[]
    const dataTransformada = periodosServicio.map((periodo) => ({
      ...periodo,
      f_monto: Number(periodo.f_monto),
    }))

    return RespuestaController.exitosa(
      200,
      "Consulta exitosa",
      dataTransformada
    )
  }
}

export { ColaboradorServices }
