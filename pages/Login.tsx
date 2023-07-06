import { useAuth } from "../contexts/auth.context"
import { useForm } from "@hooks/useForm"
import styles from "@components/styles/LoginForm.module.css"

const Login = () => {
  const estadoInicialUsuario = {
    email: "",
    password: "",
  }

  const { login, error, limpiarError } = useAuth()
  const { estadoForma, handleInputChange } = useForm(estadoInicialUsuario)

  const onInputChange = (ev: React.FormEvent<HTMLInputElement>) => {
    if (error.hay) limpiarError()
    handleInputChange(ev)
  }

  const onSubmit = (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    login(estadoForma)
  }

  return (
    <form
      className={`mt-5 px-2 py-4 border ${styles.loginForm}`}
      onSubmit={onSubmit}
    >
      <div className="mb-3">
        <label className="form-label">Usuario</label>
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
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          className="form-control"
          name="password"
          value={estadoForma.password}
          onChange={onInputChange}
        />
      </div>
      <div className="text-center">
        <button type="submit" className="btn btn-outline-secondary">
          Ingresar
          <i className="bi bi-box-arrow-in-left ms-2"></i>
        </button>
      </div>
      {error.hay && (
        <div className="col-12 mt-3">
          <div className="alert alert-warning text-center mb-0" role="alert">
            {error.mensaje}
          </div>
        </div>
      )}
    </form>
  )
}

export default Login
