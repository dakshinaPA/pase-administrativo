import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_solicitud = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } =
        await SolicitudesPresupuestoServices.obtenerNotas(id_solicitud)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await SolicitudesPresupuestoServices.crearNota(
        id_solicitud,
        req.body
      )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
