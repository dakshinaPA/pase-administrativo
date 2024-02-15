import { useSesion } from "@hooks/useSesion"
import { useRouter } from "next/router"

const Home = () => {
  const { user, status } = useSesion()
  const router = useRouter()

  if (status === "authenticated") {
    let route = ""

    switch (user.id_rol) {
      case 1:
        route = "proyectos"
        break
      case 2:
        route = "copartes"
        break
      case 3:
        route = "videos"
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
