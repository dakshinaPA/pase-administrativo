import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ROLES } from "@assets/utils/seccionesusuario"
import { ApiCall } from "@assets/utils/apiCalls"

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const estadoInicialError = { hay: false, mensaje: "" }

  const [user, setUser] = useState(null)
  const [error, setError] = useState(estadoInicialError)
  const router = useRouter()

  useEffect(() => {
    login({
      // email: 'omar.maldo.vi@gmail.com',
      // password: '123'
      email: "iflores@dakshina.org.mx",
      password: "123",
      // email: 'gabome@gmail.com',
      // password: '123'
    })
  }, [])

  const login = async (dataUsuario) => {
    try {
      const { error, data, mensaje } = await ApiCall.post(
        "/api/login",
        dataUsuario
      )

      if (error) {
        console.log(data)
        setError({ hay: true, mensaje })
      } else {
        const usuario = data[0]
        const usuarioSecciones = agregarSeccionesUsuario(usuario)
        setUser(usuarioSecciones)
        router.push("/")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const logOut = () => {
    setUser(null)
    router.push("/Login")
  }

  const limpiarError = () => setError(estadoInicialError)

  const agregarSeccionesUsuario = ({ i_rol, ...usuario }) => {
    return {
      ...usuario,
      rol: ROLES.find((rol) => rol.id == i_rol),
    }
  }

  const auth = { user, login, logOut, error, limpiarError }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const auth = useContext(AuthContext)
  return auth
}

export { AuthProvider, useAuth }
