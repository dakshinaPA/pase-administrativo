import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const idCoaprte = Number(req.query.id)
  const queries = {
    ...req.query,
    id_coparte: idCoaprte
  }

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProyectosServices.obtener(queries)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
