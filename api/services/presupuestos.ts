import { PresupuestoDB } from "@api/db/presupuestos"
import { RespuestaController } from "@api/utils/response"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"

class PresupuestosServices {

  static async obtener(id?: number) {
    const res = await PresupuestoDB.obtener(id)

    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener solicitudes de presupuesto",
        res.data
      )
    }

    const presupuestosDB = res.data as SolicitudPresupuesto[]
    // const usuariosHidratadas: SolicitudPresupuesto[] = presupuestosDB.map((presupuesto: SolicitudPresupuesto) => {
    //   let rol: string

    //   switch (Number(presupuesto.id_rol)) {
    //     case 1:
    //       rol = "Super Usuario"
    //       break
    //     case 2:
    //       rol = "Administrador"
    //       break
    //     case 3:
    //       rol = "Coparte"
    //       break
    //   }

    //   return { ...usuario, rol }
    // })
    return RespuestaController.exitosa(
      200,
      "Consulta exitosa",
      presupuestosDB
    )
  }

  static async crear(data: SolicitudPresupuesto) {
    const res = await PresupuestoDB.crear(data)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar solicitud de presupuesto",
        res.data
      )
    }
    return RespuestaController.exitosa(
      201,
      "Solicitud de presupuesto actualizada con éxito",
      res.data
    )
  }

  static async actualizar(id: number, data: SolicitudPresupuesto) {
    const res = await PresupuestoDB.actualizar(id, data)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar solicitud de presupuesto",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Solicitud de presupuesto actualizada con éxito",
      res.data
    )
  }

  static async borrar(id: number) {
    const res = await PresupuestoDB.borrar(id)
    if (res.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar solicitud de presupuesto",
        res.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Solicitud de presupuesto borrada con éxito",
      res.data
    )
  }
}

export { PresupuestosServices }