import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export const useSesion = () => {
  const router = useRouter()
  const sesion = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })
  return sesion
}
