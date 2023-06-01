import { UsuariosServices } from "@api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"
import { Usuario } from "@api/models/usuario.model"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_rol = Number(req.query.id_rol) || 0

  switch (req.method) {
    case "GET":
      var { status, ...data } = await UsuariosServices.obtener(0, id_rol)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await UsuariosServices.crear(req.body as Usuario)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
