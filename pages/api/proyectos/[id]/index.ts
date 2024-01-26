import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_proyecto = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProyectosServices.obtener(req.query)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await ProyectosServices.actualizar(
        id_proyecto,
        req.body
      )
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await ProyectosServices.borrar(id_proyecto)
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
