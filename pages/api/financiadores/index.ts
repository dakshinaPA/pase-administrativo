import { FinanciadoresServices } from "@api/services/financiadores"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const min = Boolean(req.query.min)
  const sesion = await getServerSession(req, res, authOptions)
  if (!sesion) {
    return res.status(401).json({ mensaje: "Acceso no autorizado" })
  }

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
      res.status(401).json({ mensaje: "Acceso no autorizado" })
  }
}
