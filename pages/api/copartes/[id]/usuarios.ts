import { CopartesServices } from "@api/services/copartes"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id)
  const min = Boolean(req.query.min)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await CopartesServices.obtenerUsuarios(id, min)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
