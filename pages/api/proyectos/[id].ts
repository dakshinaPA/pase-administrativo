import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_proyecto = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProyectosServices.obtener(0, id_proyecto)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await ProyectosServices.actualizar(id_proyecto, req.body)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await ProyectosServices.borrar(id_proyecto)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}