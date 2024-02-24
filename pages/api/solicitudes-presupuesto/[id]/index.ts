import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_solicitud = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
  //@ts-ignore
  const rolUsuario = sesion.user.id_rol

  switch (req.method) {
    case "GET":
      var { status, ...data } = await SolicitudesPresupuestoServices.obtener({
        id: id_solicitud,
      })
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await SolicitudesPresupuestoServices.actualizar(
        id_solicitud,
        req.body,
        rolUsuario
      )
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await SolicitudesPresupuestoServices.borrar(
        id_solicitud
      )
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
