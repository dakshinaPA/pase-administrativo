import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_coparte = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProyectosServices.obtener(id_coparte, 0)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await ProyectosServices.crear(
        id_coparte,
        req.body
      )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
