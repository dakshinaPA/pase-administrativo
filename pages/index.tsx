import { useEffect } from "react"
import { useSesion } from "@hooks/useSesion"
import { useRouter } from "next/router"

const Home = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated") return null
  const router = useRouter()

  useEffect(() => {
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
  }, [])

  return null
}

export default Home
