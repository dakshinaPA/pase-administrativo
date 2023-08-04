import { ColaboradorDB } from "@api/db/colaboradores"
import { RespuestaController } from "@api/utils/response"
import { ResColaboradoreDB } from "@api/models/colaborador.model"
import {
  ColaboradorProyecto,
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
      const re = (await ColaboradorDB.obtener(
        id_proyecto,
        id_colaborador
      )) as ResColaboradoreDB[]

      const colaboradores: ColaboradorProyecto[] = re.map((colaborador) => {
        const {
          periodos_servicio,
          id_direccion,
          calle,
          numero_ext,
          numero_int,
          colonia,
          municipio,
          cp_direccion,
          id_estado,
          estado,
          ...resto
        } = colaborador

        const data: ColaboradorProyecto = {
          ...resto,
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

        return data
      })

      return RespuestaController.exitosa(200, "Consulta exitosa", colaboradores)
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
      const cr = await ColaboradorDB.crear(data)

      return RespuestaController.exitosa(201, "Colaborador creado con éxito", {
        idInsertado: cr,
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

      // for (const ps of periodos_servicio) {
      //   if (ps.id) {
      //     promesas.push(ColaboradorDB.actualizarPeriodoServicio(ps))
      //   } else {
      //     promesas.push(ColaboradorDB.crearPeriodoServicio(id_colaborador, ps))
      //   }
      // }

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


}

export { ColaboradorServices }
