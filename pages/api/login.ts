import { getServerSession } from "next-auth/next"
import { UsuariosServices } from "../../api/services/usuarios"
import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "./auth/[...nextauth]"

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
  if (req.method === "POST") {
    const { status, ...data } = await UsuariosServices.login(req.body)
    return res.status(status).json(data)
  }
  res.status(401).json({ mensaje: "Acceso no autorizado" })
}

export default login
