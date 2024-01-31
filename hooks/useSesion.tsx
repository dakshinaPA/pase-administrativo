import { UsuarioLogin } from "@models/usuario.model"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export const useSesion = () => {
  const router = useRouter()
  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })

  const usuario = (data?.user as UsuarioLogin) || null

  const sesion = {
    user: usuario ? { ...usuario, id: Number(usuario.id) } : null,
    status,
  }

  return sesion
}
