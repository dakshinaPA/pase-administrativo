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
    <div className="container">
      <div className="row">
        {user.rol.secciones.map((seccion) => (
          <AccionCard key={seccion.id} {...seccion} />
        ))}
      </div>
    </div>
  )
}

export default Home
