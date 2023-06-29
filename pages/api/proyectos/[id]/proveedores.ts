import { ProveedorServices } from "@api/services/proveedores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_proyecto = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProveedorServices.obtener(id_proyecto)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
