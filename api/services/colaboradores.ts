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

  static trimPayload(data: ColaboradorProyecto): ColaboradorProyecto {
    return {
      ...data,
      nombre: textoMayusculaSinAcentos(data.nombre),
      apellido_paterno: textoMayusculaSinAcentos(data.apellido_paterno),
      apellido_materno: textoMayusculaSinAcentos(data.apellido_materno),
      direccion: {
        ...data.direccion,
        calle: data.direccion.calle.trim(),
        numero_ext: data.direccion.numero_ext.trim(),
        numero_int: data.direccion.numero_int.trim(),
        colonia: data.direccion.colonia.trim(),
        municipio: data.direccion.municipio.trim(),
        cp: data.direccion.cp.trim(),
      },
      periodos_servicio: data.periodos_servicio.map((ps) => ({
        ...ps,
        i_numero_ministracion: Number(ps.i_numero_ministracion),
        f_monto: Number(ps.f_monto),
        servicio: ps.servicio.trim(),
        descripcion: ps.descripcion.trim(),
        cp: ps.cp.trim(),
      })),
    }
  }

  static formatData(colaborador: ResColaboradoreDB): ColaboradorProyecto {

    const [idFinanciar, idCoparte, idProyecto] = colaborador.proyecto.split("_")
    const id_empleado = `${idFinanciar}${idCoparte}${idProyecto}_${colaborador.id}`

    return {
      ...colaborador,
      tipo: this.obtenerTipo(colaborador.i_tipo),
      nombre: textoMayusculaSinAcentos(colaborador.nombre),
      apellido_paterno: textoMayusculaSinAcentos(colaborador.apellido_paterno),
      apellido_materno: textoMayusculaSinAcentos(colaborador.apellido_materno),
      id_empleado,
      direccion: {
        id: colaborador.id_direccion,
        calle: colaborador.calle,
        numero_ext: colaborador.numero_ext,
        numero_int: colaborador.numero_int,
        colonia: colaborador.colonia,
        municipio: colaborador.municipio,
        cp: colaborador.cp_direccion,
        id_estado: colaborador.id_estado,
        estado: colaborador.estado,
      },
      periodos_servicio: colaborador.periodos_servicio,
    }
  }

  static async obtener(id_proyecto: number, id_colaborador?: number) {
    try {
      const re = (await ColaboradorDB.obtener(
        id_proyecto,
        id_colaborador
      )) as ResColaboradoreDB[]

      const colaboradores: ColaboradorProyecto[] = re.map((col) =>
        this.formatData(col)
      )

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
      // quitar periodos servicio si es colaborador sin pago
      let payload: ColaboradorProyecto = {
        ...data,
        periodos_servicio: data.i_tipo == 3 ? [] : [...data.periodos_servicio],
      }
      payload = this.trimPayload(data)
      const cr = await ColaboradorDB.crear(payload)

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
      // quitar periodos servicio si es colaborador sin pago
      let payload: ColaboradorProyecto = {
        ...data,
        periodos_servicio: data.i_tipo == 3 ? [] : [...data.periodos_servicio],
      }
      payload = this.trimPayload(data)
      const up = (await ColaboradorDB.actualizar(
        id_colaborador,
        payload
      )) as ResColaboradoreDB

      const colaboradorUp = this.formatData(up)

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
