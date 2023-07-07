import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_solicitud = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await SolicitudesPresupuestoServices.obtener({
        id: id_solicitud,
      })
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await SolicitudesPresupuestoServices.actualizar(
        id_solicitud,
        req.body
      )
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await SolicitudesPresupuestoServices.borrar(
        id_solicitud
      )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
