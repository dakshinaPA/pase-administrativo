import { ColaboradorServices } from "@api/services/colaboradores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_proyecto = Number(req.query.id)

  switch (req.method) {
    case "POST":
      var { status, ...data } = await ColaboradorServices.crear(id_proyecto, req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}