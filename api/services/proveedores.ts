import { ProveedorDB } from "@api/db/proveedores"
import { RespuestaController } from "@api/utils/response"
import { ResProveedorDB } from "@api/models/proveedor.model"
import { ProveedorProyecto } from "@models/proyecto.model"
import { textoMayusculaSinAcentos } from "@assets/utils/common"

class ProveedorServices {
  static obtenerTipo(id_tipo: 1 | 2 | 3) {
    switch (id_tipo) {
      case 1:
        return "Persona Física"
      case 2:
        return "Persona Moral"
      case 3:
        return "Extranjero"
    }
  }

  static async obtener(id_proyecto: number, id_proveedor?: number) {
    try {
      const re = (await ProveedorDB.obtener(
        id_proyecto,
        id_proveedor
      )) as ResProveedorDB[]

      const proveedores: ProveedorProyecto[] = re.map((proveedor) => {
        return {
          id: proveedor.id,
          id_proyecto: proveedor.id_proyecto,
          proyecto: proveedor.proyecto,
          id_responsable: proveedor.id_responsable,
          nombre: textoMayusculaSinAcentos(proveedor.nombre),
          i_tipo: proveedor.i_tipo,
          tipo: this.obtenerTipo(proveedor.i_tipo),
          clabe: proveedor.clabe,
          id_banco: proveedor.id_banco,
          banco: proveedor.banco || "",
          telefono: proveedor.telefono,
          email: proveedor.email,
          rfc: proveedor.rfc,
          bank: proveedor.bank,
          bank_branch_address: proveedor.bank_branch_address,
          account_number: proveedor.account_number,
          bic_code: proveedor.bic_code,
          intermediary_bank: proveedor.intermediary_bank,
          routing_number: proveedor.routing_number,
          descripcion_servicio: proveedor.descripcion_servicio,
          direccion: {
            id: proveedor.id_direccion,
            calle: proveedor.calle,
            numero_ext: proveedor.numero_ext,
            numero_int: proveedor.numero_int,
            colonia: proveedor.colonia,
            municipio: proveedor.municipio,
            cp: proveedor.cp,
            id_estado: proveedor.id_estado,
            estado: proveedor.estado,
            pais: proveedor.pais,
          },
        }
      })

      return RespuestaController.exitosa(200, "Consulta exitosa", proveedores)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        `Error al obtener proveedor${
          id_proveedor ? "" : "es"
        }, contactar a soporte`,
        error
      )
    }
  }

  static async crear(data: ProveedorProyecto) {
    try {
      const dataTransformada: ProveedorProyecto = {
        ...data,
        nombre: textoMayusculaSinAcentos(data.nombre),
        bank: textoMayusculaSinAcentos(data.bank),
        bank_branch_address: data.bank_branch_address.trim(),
        bic_code: data.bic_code.trim(),
        intermediary_bank: textoMayusculaSinAcentos(data.intermediary_bank),
        routing_number: data.routing_number.trim(),
        descripcion_servicio: data.descripcion_servicio.trim(),
        direccion: {
          ...data.direccion,
          calle: data.direccion.calle.trim(),
          numero_int: data.direccion.numero_int.trim(),
          colonia: data.direccion.colonia.trim(),
          municipio: data.direccion.municipio.trim(),
          cp: data.direccion.cp.trim(),
          estado: textoMayusculaSinAcentos(data.direccion.estado),
          pais: textoMayusculaSinAcentos(data.direccion.pais),
        },
      }

      const cr = await ProveedorDB.crear(dataTransformada)

      return RespuestaController.exitosa(201, "Proveedor creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear proveedor, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(id_proveedor: number, data: ProveedorProyecto) {
    try {
      const dataTransformada = {
        ...data,
        nombre: textoMayusculaSinAcentos(data.nombre),
      }

      const up = await ProveedorDB.actualizar(id_proveedor, dataTransformada)

      return RespuestaController.exitosa(
        200,
        "Proveedor actualizado con éxito",
        up
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar proveedor, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ProveedorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar proveedor, contactar a soporte",
        dl.data
      )
    }
    return RespuestaController.exitosa(200, "proveedor borrado con éxito", null)
  }
}

export { ProveedorServices }
