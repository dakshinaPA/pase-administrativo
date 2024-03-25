import { rolesUsuario } from "@assets/utils/constantes"
import { useSesion } from "@hooks/useSesion"
import { useRouter } from "next/router"

const Home = () => {
  const { user, status } = useSesion()
  const router = useRouter()

  if (status === "authenticated") {
    let route = ""

    switch (user.id_rol) {
      case rolesUsuario.SUPER_USUARIO:
        route = "proyectos"
        break
      case rolesUsuario.ADMINISTRADOR:
        route = "copartes"
        break
      case rolesUsuario.COPARTE:
        route = "proyectos"
        break
      default:
        route = "videos"
        break
    }

    router.push(route)
  } else if (status === "unauthenticated") {
    router.push("/login")
  }

  return null
}

export default Home
