import { FinanciadoresServices } from "@api/services/financiadores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const min = Boolean(req.query.min)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await FinanciadoresServices.obtener(0, min)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await FinanciadoresServices.crear(req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
