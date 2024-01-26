import { UsuariosServices } from "@api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idUsuario = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

  switch (req.method) {
    case "GET":
      var { status, ...data } = await UsuariosServices.obtener(req.query)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await UsuariosServices.actualizar(
        idUsuario,
        req.body
      )
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await UsuariosServices.borrar(idUsuario)
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
