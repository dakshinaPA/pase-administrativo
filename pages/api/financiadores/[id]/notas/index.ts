import { FinanciadoresServices } from "@api/services/financiadores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_financiador = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await FinanciadoresServices.obtenerNotas(id_financiador)
      res.status(status).json(data)
      break
    case "POST":
      var { status, ...data } = await FinanciadoresServices.crearNota(id_financiador, req.body)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
