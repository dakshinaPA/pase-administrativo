import { useAuth } from "../contexts/auth.context"
import { useForm } from '@hooks/useForm'

const Login = () => {

    const estadoInicialUsuario = {
        email: '',
        password: ''
    }

    const { login, error, limpiarError } = useAuth()
    const { estadoForma, handleInputChange } = useForm(estadoInicialUsuario)

    const onInputChange = ( ev ) => {

        if( error.hay ) limpiarError()
        setUsuario( ev )
    }

    const onSubmit = (ev) => {

        ev.preventDefault()
        login(usuario)
    }

    return(
        <div className="container">
            <div className="row">
                <div className="col-12 col-lg-4"></div>
                <div className="col-12 col-lg-4">
                    <form
                        className="p-3 colorForma"
                        onSubmit={onSubmit}
                    >
                        <div className="mb-3">
                            <label className="form-label">Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ingresa tu correo electrónico"
                                name="email"
                                value={usuario.email}
                                onChange={onInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={usuario.password}
                                onChange={onInputChange}
                            />
                        </div>
                        <div className="text-center mb-3">
                            <button
                                type="submit"
                                className="btn btn-secondary"
                            >
                                Ingresar
                            </button>
                        </div>
                        {error.hay && 
                        <div className="col-12 mb-3">
                            <div className="alert alert-warning text-center" role="alert">
                                {error.mensaje}
                            </div>
                        </div>
                        }
                    </form>
                </div>
                <div className="col-12 col-lg-4"></div>
            </div>
        </div>
    )
}

export default Login