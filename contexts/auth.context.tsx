import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ApiCall } from "@assets/utils/apiCalls"
import { Usuario, UsuarioLogin } from "@models/usuario.model"

interface AuthProvider {
  user: UsuarioLogin
  login: (dataUsuario: any) => Promise<void>
  logOut: () => void
  error: {
    hay: boolean
    mensaje: string
  }
  limpiarError: () => void
}

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const estadoInicialError = { hay: false, mensaje: "" }

  const [user, setUser] = useState<UsuarioLogin>(null)
  const [error, setError] = useState(estadoInicialError)
  const router = useRouter()

  useEffect(() => {
    login({
      // email: "omar.maldo.vi@gmail.com",
      // password: "123",
      email: 'jaimerope@gmail.com',
      password: '123'
      // email: 'iflores@dakshina.org.mx',
      // password: '123'
    })
  }, [])

  const login = async (dataUsuario) => {
    try {
      const { error, data, mensaje } = await ApiCall.post("/login", dataUsuario)

      if (error) {
        console.log(data)
        setError({ hay: true, mensaje })
      } else {
        const usuario = data[0] as UsuarioLogin
        const userTest: UsuarioLogin = {
          ...usuario,
          // id_rol: 3,
          // id: 7
        }
        setUser(userTest)
        router.push("/")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const logOut = () => {
    setUser(null)
    router.push("/login")
  }

  const limpiarError = () => setError(estadoInicialError)

  const auth = { user, login, logOut, error, limpiarError }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const auth = useContext(AuthContext) as AuthProvider
  return auth
}

export { AuthProvider, useAuth }
