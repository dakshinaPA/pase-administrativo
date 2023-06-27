import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerCopartes,
  obtenerCopartesAdmin,
  obtenerUsuariosCoparte,
  obtenerUsuariosXRol,
} from "@assets/utils/common"
import { IdRolUsuario, Usuario } from "@models/usuario.model"
import { CoparteMin, CoparteUsuario } from "@models/coparte.model"
import { useAuth } from "@contexts/auth.context"

const Usuarios = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosDB, setUsuariosDB] = useState<Usuario[]>([])
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [rolUsuarioSelect, setRolUsuarioSelect] = useState<IdRolUsuario>(3)
  const [coparteSelect, setCoparteSelect] = useState<number>(0)

  useEffect(() => {
    obtenerCopartesDB()
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [coparteSelect, rolUsuarioSelect])

  const abrirModalEliminarUsuario = (id: number) => {
    setUsuarioAEliminar(id)
    setShowModalEliminar(true)
  }

  const cargarUsuarios = async () => {
    setIsLoading(true)

    try {
      let usuarios: Usuario[] = []

      if (rolUsuarioSelect == 3) {
        if (coparteSelect > 0) {
          const reUsuarios = await obtenerUsuariosCoparte(coparteSelect)
          if (reUsuarios.error) throw reUsuarios.data

          const usuariosCoparte = reUsuarios.data as CoparteUsuario[]
          //transformar data a formato usuario
          usuarios = usuariosCoparte.map((usuario) => {
            const {
              id_usuario,
              nombre,
              apellido_paterno,
              apellido_materno,
              email,
              telefono,
              cargo,
              b_enlace,
            } = usuario

            return {
              id: id_usuario,
              nombre,
              apellido_paterno,
              apellido_materno,
              email,
              telefono,
              password: "",
              id_rol: 3,
              coparte: {
                id_coparte: coparteSelect,
                cargo,
                b_enlace: Boolean(b_enlace),
              },
            }
          })
        }
      } else {
        const reUsuarios = await obtenerUsuariosXRol(rolUsuarioSelect, false)
        if (reUsuarios.error) throw reUsuarios.data
        usuarios = reUsuarios.data as Usuario[]
      }

      setUsuariosDB(usuarios)
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtenerCopartesDB = async () => {
    const res =
      user.id_rol == 2
        ? await obtenerCopartesAdmin(user.id)
        : await obtenerCopartes()

    const { error, data, mensaje } = res

    if (error) {
      console.log(data)
    } else {
      const copartesDB = data as CoparteMin[]
      setCopartesDB(copartesDB)
      setCoparteSelect(copartesDB[0]?.id || 0)
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
      await cargarUsuarios()
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
      <div className="row mb-2">
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/usuarios/registro")}
          >
            Registrar +
          </button>
        </div>
        {user.id_rol == 1 && (
          <div className="col-12 col-md-6 col-lg-2 mb-3">
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
        )}
        <div className="col-12 col-md-6 col-lg-2 mb-3">
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
        <div className="d-none d-lg-block col mb-3"></div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
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
                  <th>Email</th>
                  <th>Telefono</th>
                  {rolUsuarioSelect == 3 && (
                    <>
                      <th>Cargo</th>
                      <th>Enlace</th>
                    </>
                  )}
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
                    coparte,
                  } = usuario

                  return (
                    <tr key={`coparte_${id}`}>
                      <td>{id}</td>
                      <td>
                        {nombre} {apellido_paterno} {apellido_materno}
                      </td>
                      <td>{email}</td>
                      <td>{telefono}</td>
                      {rolUsuarioSelect == 3 && (
                        <>
                          <td>{coparte?.cargo}</td>
                          <td>
                            <i
                              className={`bi ${
                                coparte?.b_enlace ? "bi-check" : "bi-x"
                              }`}
                            ></i>
                          </td>
                        </>
                      )}
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm me-1"
                            onClick={() => router.push(`/usuarios/${id}`)}
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          {user.id_rol == 1 && (
                            <button
                              className="btn btn-dark btn-sm"
                              onClick={() => abrirModalEliminarUsuario(id)}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
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
