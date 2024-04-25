import { ProyectosServices } from "@api/services/proyectos"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idAjuste = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

  switch (req.method) {
    case "DELETE":
      var { status, ...data } = await ProyectosServices.borrarAjuste(idAjuste)
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
