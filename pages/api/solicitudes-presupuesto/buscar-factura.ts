import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { folio } = req.query

  switch (req.method) {
    case "GET":
      var { status, ...data } =
        await SolicitudesPresupuestoServices.buscarFactura(folio as string)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
