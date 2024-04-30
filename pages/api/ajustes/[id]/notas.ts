import { ProyectosServices } from "@api/services/proyectos"
import { NotaAjuste } from "@models/proyecto.model"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idAjuste = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

  //@ts-ignore
  const id_usuario = sesion.user.id as number
  const mensaje = req.body.mensaje as string

  const payload = {
    id_usuario,
    mensaje,
  }

  switch (req.method) {
    case "POST":
      var { status, ...data } = await ProyectosServices.crearAjusteNota(
        idAjuste,
        payload
      )
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
