import { ProveedorServices } from "@api/services/proveedores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idProyecto = Number(req.query.id_proyecto)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProveedorServices.obtener(idProyecto, 0)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await ProveedorServices.crear(req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
