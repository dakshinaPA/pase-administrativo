// import { useAuth } from "@contexts/auth.context"
import { signIn } from "next-auth/react"
import styles from "@components/styles/LoginForm.module.css"
import { useState } from "react"
import { ChangeEvent } from "@assets/models/formEvents.model"

const Login = () => {
  const estadoInicialUsuario = {
    email: "",
    password: "",
  }

  // const { login, error, limpiarError } = useAuth()
  const [estadoForma, setEstadoForma] = useState(estadoInicialUsuario)
  const [showPassword, setShowPassword] = useState(false)

  const onInputChange = (ev: ChangeEvent) => {
    // if (error.hay) limpiarError()
    const { name, value } = ev.target

    setEstadoForma((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const onSubmit = (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    // login(estadoForma)
    signIn("credentials", {
      // redirect: false,
      email: estadoForma.email,
      password: estadoForma.password,
      callbackUrl: '/'
    })
  }

  return (
    <form className={`mt-5 px-2 py-4 ${styles.loginForm}`} onSubmit={onSubmit}>
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
      {/* {error.hay && (
        <div className="col-12 mt-3">
          <div className="alert alert-warning text-center mb-0" role="alert">
            {error.mensaje}
          </div>
        </div>
      )} */}
    </form>
  )
}

export default Login
