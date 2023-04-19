import { UsuariosServices } from "../../api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { status, ...data } = await UsuariosServices.login(req.body)
    return res.status(status).json(data)
  }
  res.status(500).json({ mensaje: "Acceso no autorizado" })
}

export default login
