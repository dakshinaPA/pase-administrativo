import { ColaboradorDB } from "@api/db/colaboradores"
import { RespuestaController } from "@api/utils/response"
import { ResColaboradoreDB } from "@api/models/colaborador.model"
import { epochAFecha } from "@assets/utils/common"
import { ColaboradorProyecto } from "@models/proyecto.model"

class ColaboradorServices {
  static obtenerTipo(id_tipo: 1 | 2) {
    switch (id_tipo) {
      case 1:
        return "ASIMILADO"
      case 2:
        return "HONORARIOS"
    }
  }

  static async obtener(id_proyecto: number) {
    try {
      const obtenerDB = await ColaboradorDB.obtener(id_proyecto)
      if (obtenerDB.error) throw obtenerDB.data

      const colaboradoresDB = obtenerDB.data as ResColaboradoreDB[]

      const dataTransformada: ColaboradorProyecto[] = await Promise.all(
        colaboradoresDB.map(async (colaborador) => {
          const {
            id,
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
            cp,
            nombre_servicio,
            descripcion_servicio,
            f_monto_total,
            dt_inicio_servicio,
            dt_fin_servicio,
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

          return {
            id,
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
            cp,
            nombre_servicio,
            descripcion_servicio,
            f_monto_total,
            dt_inicio_servicio,
            dt_fin_servicio,
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

  static async crear(id_proyecto: number, data: ColaboradorProyecto) {
    try {
      const { direccion } = data
      const cr = await ColaboradorDB.crear(id_proyecto, data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const crDireccion = await ColaboradorDB.crearDireccion(idInsertado, direccion)
      if (crDireccion.error) throw crDireccion.data

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

  // static async actualizar(id: number, data: Financiador) {
  //   try {
  //     const { enlace, direccion } = data

  //     const upFianciador = FinanciadorDB.actualizar(id, data)
  //     const upEnlace = FinanciadorDB.actualizarEnlace(enlace)
  //     const upDireccion = FinanciadorDB.actualizarDireccion(direccion)

  //     const resCombinadas = await Promise.all([
  //       upFianciador,
  //       upEnlace,
  //       upDireccion,
  //     ])

  //     for (const rc of resCombinadas) {
  //       if (rc.error) throw rc.data
  //     }

  //     return RespuestaController.exitosa(
  //       200,
  //       "Financiador actualizado con éxito",
  //       null
  //     )
  //   } catch (error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al actualziar financiador",
  //       error
  //     )
  //   }
  // }

  // static async borrar(id: number) {
  //   const dl = await FinanciadorDB.borrar(id)

  //   if (dl.error) {
  //     return RespuestaController.fallida(
  //       400,
  //       "Error al borrar financiador",
  //       null
  //     )
  //   }
  //   return RespuestaController.exitosa(
  //     200,
  //     "Financiador borrado con éxito",
  //     dl.data
  //   )
  // }
}

export { ColaboradorServices }
