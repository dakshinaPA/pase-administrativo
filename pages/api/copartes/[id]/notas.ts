import { CopartesServices } from "@api/services/copartes"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_coparte = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await CopartesServices.obtenerNotas(id_coparte)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await CopartesServices.crearNota(id_coparte, req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
