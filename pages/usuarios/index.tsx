import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import { aMinuscula } from "@assets/utils/common"
import { Usuario } from "@models/usuario.model"
import { CoparteMin } from "@models/coparte.model"

const Usuarios = () => {
  const router = useRouter()
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosDB, setUsuariosDB] = useState<Usuario[]>([])
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [rolUsuarioSelect, setRolUsuarioSelect] = useState<number>(3)
  const [coparteSelect, setCoparteSelect] = useState<number>(1)

  useEffect(() => {
    obtenerCopartes()
  }, [])

  useEffect(() => {
    obtenerUsuarios()
  }, [rolUsuarioSelect, coparteSelect])

  const abrirModalEliminarUsuario = (id: number) => {
    setUsuarioAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerUsuarios = async () => {
    setIsLoading(true)

    let url = `/usuarios`
    if (rolUsuarioSelect == 3) {
      url += `?id_coparte=${coparteSelect}`
    } else {
      url += `?id_rol=${rolUsuarioSelect}`
    }

    const res = await ApiCall.get(url)
    const { error, data, mensaje } = res

    if (error) {
      console.log(error)
    } else {
      setUsuariosDB(data as Usuario[])
    }
    setIsLoading(false)
  }

  const obtenerCopartes = async () => {
    const res = await ApiCall.get(`/copartes?min=true`)
    const { error, data, mensaje } = res
    if (!error) {
      setCopartesDB(data as CoparteMin[])
    }
  }

  const eliminarUsuario = async () => {
    setUsuarioAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/usuarios/${usuarioAEliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      await obtenerUsuarios()
    }

    setIsLoading(false)
  }

  const cancelarEliminarUsuario = () => {
    setUsuarioAEliminar(0)
    setShowModalEliminar(false)
  }

  const handleCambioRol = ({ target }) => {
    setRolUsuarioSelect(target.value)
  }

  const handleCambioCoparte = ({ target }) => {
    setCoparteSelect(target.value)
  }

  const usuariosFiltrados = usuariosDB.filter(
    ({ nombre, apellido_paterno, apellido_materno, email }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(apellido_paterno).includes(query) ||
        aMinuscula(apellido_materno).includes(query) ||
        aMinuscula(email).includes(query)
      )
    }
  )

  const determinarNombreUsuarioAEliminar = (): string => {
    const usuario = usuariosDB.find(
      (usuario) => usuario.id === usuarioAEliminar
    )
    return usuario ? `${usuario.nombre} ${usuario.apellido_paterno}` : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-3">
        <div className="col-12 col-md-2 mb-2">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/usuarios/registro")}
          >
            Registrar +
          </button>
        </div>
        <div className="col-12 col-md-2 mb-2">
          <select
            className="form-control"
            onChange={handleCambioRol}
            value={rolUsuarioSelect}
          >
            <option value="1">Super Usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div>
        <div className="col-12 col-md-2 mb-2">
          {rolUsuarioSelect == 3 && (
            <select
              className="form-control"
              value={coparteSelect}
              onChange={handleCambioCoparte}
            >
              {copartesDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="d-none d-md-block col-md-2 mb-2"></div>
        <div className="col-12 col-md-4 mb-2">
          <div className="input-group">
            <input
              type="text"
              name="busqueda"
              className="form-control"
              placeholder="Buscar registro"
              value={inputBusqueda}
              onChange={({ target: { value } }) => setInputBusqueda(value)}
            />
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="row">
          <div className="col-12 table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#id</th>
                  <th>Nombre</th>
                  <th>Apellido paterno</th>
                  <th>Apellido materno</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  {rolUsuarioSelect == 3 && <th>Enlace</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => {
                  const {
                    id,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    email,
                    telefono,
                    rol,
                  } = usuario

                  const icono = rol.b_enlace ? "bi-check-lg" : "bi-x-lg"

                  return (
                    <tr key={`coparte_${id}`}>
                      <td>{id}</td>
                      <td>{nombre}</td>
                      <td>{apellido_paterno}</td>
                      <td>{apellido_materno}</td>
                      <td>{email}</td>
                      <td>{telefono}</td>
                      {rolUsuarioSelect == 3 && (
                        <td>
                          <i className={`bi ${icono}`}></i>
                        </td>
                      )}
                      <td className="d-flex">
                        <button
                          className="btn btn-dark me-1"
                          onClick={() => router.push(`/usuarios/${id}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-dark"
                          onClick={() => abrirModalEliminarUsuario(id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarUsuario}
        cancelar={cancelarEliminarUsuario}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al usuario{" "}
          {determinarNombreUsuarioAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Usuarios
