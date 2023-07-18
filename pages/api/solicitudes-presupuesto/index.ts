import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      var { status, ...data } = await SolicitudesPresupuestoServices.obtener(
        req.query
      )
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await SolicitudesPresupuestoServices.crear(
        req.body
      )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
