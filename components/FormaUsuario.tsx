import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Usuario } from "@api/models/usuario.model"
import { Loader } from "@components/Loader"
import { ApiCall } from "@assets/utils/apiCalls"

const FormaUsuario = () => {
  const estadoInicialForma = {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    email2: "",
    password: "",
    i_rol: 1,
  }

  const [estadoForma, setEstadoForma] = useState<Usuario>(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idUsuario = router.query.id

  useEffect(() => {
    if (idUsuario) {
      cargarDataUsuario()
    }
  }, [])

  const cargarDataUsuario = async () => {
    setIsLoading(true)

    const { error, data } = await obtenerUsuario()

    if (error) {
      console.log(error)
    } else {
      const dataUsuario = data[0] as Usuario
      setEstadoForma(dataUsuario)
    }

    setIsLoading(false)
  }

  const obtenerUsuario = async () => {
    const res = await ApiCall.get(`/api/usuarios/${idUsuario}`)
    return res
  }

  const registrarUsuario = async () => {
    const res = await ApiCall.post("/api/usuarios", estadoForma)
    return res
  }

  const editarUsuario = async () => {
    const res = await ApiCall.put(`/api/usuarios/${idUsuario}`, estadoForma)
    return res
  }

  const cancelar = () => {
    router.push("/usuarios")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const res = idUsuario ? await editarUsuario() : await registrarUsuario()
    setIsLoading(false)

    if (res.error) {
      console.log(res)
    } else {
      router.push("/usuarios")
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="container">
      <form className="row py-3 border" onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="nombre"
            value={estadoForma.nombre}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido paterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="apellido_paterno"
            value={estadoForma.apellido_paterno}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido materno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="apellido_materno"
            value={estadoForma.apellido_materno}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="email"
            value={estadoForma.email}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="email2"
            value={estadoForma.email2}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="password"
            value={estadoForma.password}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Rol</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="i_rol"
            value={estadoForma.i_rol}
          >
            <option value="1">Super usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div>
        <div className="col-12 text-end">
          <button
            className="btn btn-secondary me-2"
            type="button"
            onClick={cancelar}
          >
            Cancelar
          </button>
          <button className="btn btn-secondary" type="submit">
            {idUsuario ? "Editar" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export { FormaUsuario }
