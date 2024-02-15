import { UsuarioLogin } from "@models/usuario.model"
import { useSession } from "next-auth/react"

export const useSesion = () => {
  const { data, status } = useSession()

  const usuario = (data?.user as UsuarioLogin) || null

  const sesion = {
    user: usuario ? { ...usuario, id: Number(usuario.id) } : null,
    status,
  }

  return sesion
}
