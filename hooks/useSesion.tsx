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

  const sesion = {
    user: (data?.user as UsuarioLogin) || null,
    status,
  }

  return sesion
}
