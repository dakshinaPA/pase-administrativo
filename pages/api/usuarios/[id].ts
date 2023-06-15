import { UsuariosServices } from "@api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idUsuario = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await UsuariosServices.obtener(0, 0, idUsuario, false)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await UsuariosServices.actualizar(idUsuario, req.body)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await UsuariosServices.borrar(idUsuario)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
