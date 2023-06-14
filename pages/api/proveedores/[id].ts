import { ProveedorServices } from "@api/services/proveedores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_proveedor = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ProveedorServices.obtener(0, id_proveedor)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await ProveedorServices.actualizar(id_proveedor, req.body)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await ProveedorServices.borrar(id_proveedor)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
