import { ProveedorDB } from "@api/db/proveedores"
import { RespuestaController } from "@api/utils/response"
import { ResProveedorDB } from "@api/models/proveedor.model"
import { epochAFecha } from "@assets/utils/common"
import { ProveedorProyecto } from "@models/proyecto.model"

class ProveedorServices {
  static obtenerTipo(id_tipo: 1 | 2) {
    switch (id_tipo) {
      case 1:
        return "FÍSICA"
      case 2:
        return "MORAL"
    }
  }

  static async obtener(id_proyecto: number, id_proveedor: number) {
    try {
      const re = await ProveedorDB.obtener(id_proyecto, id_proveedor)
      if (re.error) throw re.data

      const proveedoresDB = re.data as ResProveedorDB[]

      const dataTransformada: ProveedorProyecto[] = await Promise.all(
        proveedoresDB.map(async (proveedor) => {
          const {
            id,
            nombre,
            i_tipo,
            clabe,
            id_banco,
            banco,
            telefono,
            email,
            rfc,
            descripcion_servicio,
            id_direccion,
            calle,
            numero_ext,
            numero_int,
            colonia,
            municipio,
            cp,
            id_estado,
            estado,
          } = proveedor

          return {
            id,
            nombre,
            i_tipo,
            tipo: this.obtenerTipo(i_tipo),
            clabe,
            id_banco,
            banco,
            telefono,
            email,
            rfc,
            descripcion_servicio,
            direccion: {
              id: id_direccion,
              calle,
              numero_ext,
              numero_int,
              colonia,
              municipio,
              cp,
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
        "Error al obtener proveedores",
        error
      )
    }
  }

  static async crear(data: ProveedorProyecto) {
    try {
      const { direccion } = data
      const cr = await ProveedorDB.crear(data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const crDireccion = await ProveedorDB.crearDireccion(
        idInsertado,
        direccion
      )
      if (crDireccion.error) throw crDireccion.data

      return RespuestaController.exitosa(201, "Proveedor creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear proveedor",
        error
      )
    }
  }

  static async actualizar(id_proveedor: number, data: ProveedorProyecto) {
    try {
      const { direccion } = data

      const up = ProveedorDB.actualizar(id_proveedor, data)
      const upDireccion = ProveedorDB.actualizarDireccion(direccion)

      const resCombinadas = await Promise.all([up, upDireccion])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "Proveedor actualizado con éxito",
        null
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar proveedor",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ProveedorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar proveedor",
        dl.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "proveedor borrado con éxito",
      null
    )
  }
}

export { ProveedorServices }
