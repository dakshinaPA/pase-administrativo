import { FinanciadoresServices } from "@api/services/financiadores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await FinanciadoresServices.obtener(id)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await FinanciadoresServices.actualizar(id, req.body)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await FinanciadoresServices.borrar(id)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}