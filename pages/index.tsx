import { useAuth } from "@contexts/auth.context"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

const Home = () => {
  const { user } = useAuth()
  if (!user) return null
  // const router = useRouter()

  return <h1>Inicio</h1>
}

export default Home
