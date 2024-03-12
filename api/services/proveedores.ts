import { ProveedorDB } from "@api/db/proveedores"
import { RespuestaController } from "@api/utils/response"
import { ResProveedorDB } from "@api/models/proveedor.model"
import { ProveedorProyecto } from "@models/proyecto.model"
import { textoMayusculaSinAcentos } from "@assets/utils/common"
import { tiposProveedor } from "@assets/utils/constantes"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"

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

  static trimPayload(data: ProveedorProyecto): ProveedorProyecto {
    return {
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
        numero_ext: data.direccion.numero_ext.trim(),
        numero_int: data.direccion.numero_int.trim(),
        colonia: data.direccion.colonia.trim(),
        municipio: data.direccion.municipio.trim(),
        cp: data.direccion.cp.trim(),
        estado: textoMayusculaSinAcentos(data.direccion.estado),
        pais: textoMayusculaSinAcentos(data.direccion.pais),
      },
    }
  }

  static formatData(proveedor: ResProveedorDB): ProveedorProyecto {
    return {
      ...proveedor,
      nombre: textoMayusculaSinAcentos(proveedor.nombre),
      tipo: this.obtenerTipo(proveedor.i_tipo),
      banco: proveedor.banco || "",
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
      historial_pagos: proveedor.historial_pagos?.map((hp) => ({
        ...hp,
        tipo_gasto: SolicitudesPresupuestoServices.obtenerTipoGasto(
          hp.i_tipo_gasto
        ),
        f_importe: Number(hp.f_importe),
      })),
    }
  }

  static validarData(proveedor: ProveedorProyecto): ProveedorProyecto {
    if (proveedor.i_tipo == tiposProveedor.EXTRANJERO) {
      return {
        ...proveedor,
        clabe: "",
        id_banco: 0,
        rfc: "",
        direccion: {
          ...proveedor.direccion,
          id_estado: 0,
        },
      }
    }

    return {
      ...proveedor,
      bank: "",
      bank_branch_address: "",
      account_number: "",
      bic_code: "",
      intermediary_bank: "",
      routing_number: "",
      direccion: {
        ...proveedor.direccion,
        estado: "",
        pais: "",
      },
    }
  }

  static async obtener(id_proyecto: number, id_proveedor?: number) {
    try {
      const re = (await ProveedorDB.obtener(
        id_proyecto,
        id_proveedor
      )) as ResProveedorDB[]

      const proveedores: ProveedorProyecto[] = re.map((prov) =>
        this.formatData(prov)
      )

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
      let payload = this.validarData(data)
      payload = this.trimPayload(payload)
      const cr = await ProveedorDB.crear(payload)

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
      let payload = this.validarData(data)
      payload = this.trimPayload(payload)
      const up = (await ProveedorDB.actualizar(
        id_proveedor,
        payload
      )) as ResProveedorDB
      const proveedorUp = this.formatData(up)

      return RespuestaController.exitosa(
        200,
        "Proveedor actualizado con éxito",
        proveedorUp
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
