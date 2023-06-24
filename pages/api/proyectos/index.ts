import { ProyectosServices } from "@api/services/proyectos"
import { QueriesProyecto } from "@models/proyecto.model"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // const id_coparte = Number(req.query.id_coparte)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProyectosServices.obtener(req.query)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await ProyectosServices.crear(req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
