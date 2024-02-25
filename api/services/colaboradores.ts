import { ColaboradorDB } from "@api/db/colaboradores"
import { RespuestaController } from "@api/utils/response"
import { ResColaboradoreDB } from "@api/models/colaborador.model"
import { ColaboradorProyecto } from "@models/proyecto.model"
import { textoMayusculaSinAcentos } from "@assets/utils/common"

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
          tipo: this.obtenerTipo(resto.i_tipo),
          nombre: textoMayusculaSinAcentos(resto.nombre),
          apellido_paterno: textoMayusculaSinAcentos(resto.apellido_paterno),
          apellido_materno: textoMayusculaSinAcentos(resto.apellido_materno),
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
        `Error al obtener colaborador${
          id_colaborador ? "" : "es"
        }, contactar a soporte`,
        error
      )
    }
  }

  static async crear(data: ColaboradorProyecto) {
    try {
      const dataTransformada: ColaboradorProyecto = {
        ...data,
        nombre: textoMayusculaSinAcentos(data.nombre),
        apellido_paterno: textoMayusculaSinAcentos(data.apellido_paterno),
        apellido_materno: textoMayusculaSinAcentos(data.apellido_materno),
        direccion: {
          ...data.direccion,
          calle: data.direccion.calle.trim(),
          numero_int: data.direccion.numero_int.trim(),
          colonia: data.direccion.colonia.trim(),
          municipio: data.direccion.municipio.trim(),
          cp: data.direccion.cp.trim(),
        }
      }

      const cr = await ColaboradorDB.crear(dataTransformada)

      return RespuestaController.exitosa(201, "Colaborador creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear colaborador, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(id_colaborador: number, data: ColaboradorProyecto) {
    try {
      const dataTransformada = {
        ...data,
        nombre: textoMayusculaSinAcentos(data.nombre),
        apellido_paterno: textoMayusculaSinAcentos(data.apellido_paterno),
        apellido_materno: textoMayusculaSinAcentos(data.apellido_materno),
      }
      const up = await ColaboradorDB.actualizar(
        id_colaborador,
        dataTransformada
      )
      const reColaboradorUp = await this.obtener(null, id_colaborador)
      if (reColaboradorUp.error) throw reColaboradorUp.data

      const colaboradorUp = reColaboradorUp.data[0] as ColaboradorProyecto

      return RespuestaController.exitosa(
        200,
        "Colaborador actualizado con éxito",
        colaboradorUp
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar colaborador, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ColaboradorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar colaborador, contactar a soporte",
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
