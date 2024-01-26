import { ProveedorServices } from "@api/services/proveedores"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_proveedor = Number(req.query.id)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProveedorServices.obtener(0, id_proveedor)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await ProveedorServices.actualizar(
        id_proveedor,
        req.body
      )
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await ProveedorServices.borrar(id_proveedor)
      res.status(status).json(data)
      break
    default:
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
