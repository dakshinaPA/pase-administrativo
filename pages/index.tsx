import { useAuth } from "@contexts/auth.context"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

const Home = () => {
  const { user } = useAuth()
  if (!user) return null
  // const router = useRouter()

  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <img
        src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/logo_circulo.jpg"
        alt="logo dakshina"
      />
    </div>
  )
}

export default Home
