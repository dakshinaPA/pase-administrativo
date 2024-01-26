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
      var { status, ...data } = await ProyectosServices.obtenerNotas(
        id_proyecto
      )
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await ProyectosServices.crearNota(
        id_proyecto,
        req.body
      )
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
