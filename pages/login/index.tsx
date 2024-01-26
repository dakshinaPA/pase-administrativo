import { signIn, useSession } from "next-auth/react"
import styles from "@components/styles/LoginForm.module.css"
import { useState } from "react"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { useRouter } from "next/router"

const Login = () => {
  const router = useRouter()
  const { status } = useSession()
  if (status === "authenticated") {
    router.push("/")
    return null
  }

  const estadoInicialUsuario = {
    email: "",
    password: "",
  }

  const [estadoForma, setEstadoForma] = useState(estadoInicialUsuario)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  const onInputChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const onSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    const res = await signIn("credentials", {
      redirect: false,
      email: estadoForma.email,
      password: estadoForma.password,
      // callbackUrl: '/'
    })

    if (res.error || res.status != 200) {
      setError(true)
    }
  }

  return (
    <form className={`mt-5 px-2 py-4 ${styles.loginForm}`} onSubmit={onSubmit}>
      <div className="mb-3">
        <img
          src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/LOGO-DAKSHINA-verde.png"
          alt="logo dakshina"
          className="w-100"
        />
      </div>
      <div className="mb-3">
        <label className="form-label color1 fw-bold">Usuario</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ingresa tu correo electrónico"
          name="email"
          value={estadoForma.email}
          onChange={onInputChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label color1 fw-bold">Contraseña</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            name="password"
            value={estadoForma.password}
            onChange={onInputChange}
          />
          <span
            className="input-group-text"
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer" }}
          >
            <i
              className={`bi ${
                !showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
              }`}
            ></i>
          </span>
        </div>
      </div>
      <div className="text-center">
        <button type="submit" className="btn btn-outline-secondary w-100">
          Ingresar
          <i className="bi bi-box-arrow-in-left ms-2"></i>
        </button>
      </div>
      {error && (
        <div className="col-12 mt-3">
          <div className="alert alert-warning text-center mb-0" role="alert">
            Usuario o contraseña inválidos
          </div>
        </div>
      )}
    </form>
  )
}

export default Login
