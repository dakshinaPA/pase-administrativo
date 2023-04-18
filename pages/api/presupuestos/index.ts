import { PresupuestosServices } from "@api/services/presupuestos"
import { NextApiRequest, NextApiResponse } from "next"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      var { status, ...data } = await PresupuestosServices.obtener()
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await PresupuestosServices.crear(req.body as SolicitudPresupuesto)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
