import React, { useEffect } from "react"
import { AccionCard } from "../components/AccionCard"
import { useAuth } from "../contexts/auth.context"
import { useRouter } from "next/router"

const Home = () => {
  const { user } = useAuth()
  const router = useRouter()

  // useEffect(() => {
  //     if(!user) router.push('/Login')
  // })

  if (!user) return null

  return (
    <div>
      <h1>contenido</h1>
    </div>
  )
}

export default Home
