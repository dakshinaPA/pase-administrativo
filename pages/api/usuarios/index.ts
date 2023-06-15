import { UsuariosServices } from "@api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_rol = Number(req.query.id_rol)
  const id_coparte = Number(req.query.id_coparte)
  const min = Boolean(req.query.min)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await UsuariosServices.obtener(id_rol, id_coparte, 0, min)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await UsuariosServices.crear(req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
