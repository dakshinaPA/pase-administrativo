import { ColaboradorServices } from "@api/services/colaboradores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_proyecto = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ColaboradorServices.obtener(id_proyecto)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
