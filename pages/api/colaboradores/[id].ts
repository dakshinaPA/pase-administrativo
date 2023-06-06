import { ColaboradorServices } from "@api/services/colaboradores"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id_colaborador = Number(req.query.id)

  switch (req.method) {
    case "GET":
      var { status, ...data } = await ColaboradorServices.obtener(0, id_colaborador)
      res.status(status).json(data)
      break
    case "PUT":
      var { status, ...data } = await ColaboradorServices.actualizar(id_colaborador, req.body)
      res.status(status).json(data)
      break
    case "DELETE":
      var { status, ...data } = await ColaboradorServices.borrar(id_colaborador)
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
