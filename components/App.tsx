import { useAuth } from "@contexts/auth.context"
import { MainContenedor } from "./MainContenedor"
import { MainHeader } from "./MainHeader"
import { useEffect } from "react"
import { useRouter } from "next/router"

const App = ({ children }) => {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {

    if(!user) router.push("/login")
  }, [])

  return (
    <>
      <MainHeader />
      {user ? <MainContenedor>{children}</MainContenedor> : children}
    </>
  )
}

export { App }
