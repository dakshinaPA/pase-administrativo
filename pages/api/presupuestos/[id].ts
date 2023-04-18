import { PresupuestosServices } from "@api/services/presupuestos"
import { NextApiRequest, NextApiResponse } from "next"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await PresupuestosServices.obtener(id)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await PresupuestosServices.actualizar(id, req.body as SolicitudPresupuesto)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await PresupuestosServices.borrar(id)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
