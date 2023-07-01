import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id)

  switch (req.method) {
    case "PUT":
      var { status, ...data } = await ProyectosServices.actualizarMinistracion(
        id,
        req.body
      )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
