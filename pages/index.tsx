import { useAuth } from "@contexts/auth.context"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

const Home = () => {
  const { user } = useAuth()
  const router = useRouter()

  if (user.id_rol == 1) {
    router.push("/copartes")
  } else if (user.id_rol == 2) {
    router.push("/solicitudes-presupuesto")
  } else {
    router.push("/proyectos")
  }

  return null
}

export default Home
