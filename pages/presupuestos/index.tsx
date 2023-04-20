import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { aMinuscula } from "@assets/utils/common"
import { Usuario } from "@api/models/usuarios.model"
import { modalEliminarModel } from "@assets/models/modalEliminar.model"

const Usuarios = () => {
  const estadoInicialModalEliminar = { show: false, id: 0, txt_id: "" }
  const router = useRouter()
  const [usuariosDB, setUsuariosDB] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [modalEliminar, setModalEliminar] = useState<modalEliminarModel>(
    estadoInicialModalEliminar
  )

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const abrirModalEliminarUsuario = (id: number, txt_id: string) => {
    setModalEliminar({ show: true, id, txt_id })
  }

  const resetModalEliminar = () => {
    setModalEliminar(estadoInicialModalEliminar)
  }

  const obtenerUsuarios = async () => {
    setIsLoading(true)
    const res = await ApiCall.get("/api/usuarios")
    const { error, data, mensaje } = res

    if (error) {
      console.log(error)
    } else {
      setUsuariosDB(data as Usuario[])
    }
    setIsLoading(false)
  }

  const eliminarUsuario = async () => {
    setModalEliminar(estadoInicialModalEliminar)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/api/usuarios/${modalEliminar.id}`
    )

    if (error) {
      console.log(error)
    } else {
      await obtenerUsuarios()
    }

    setIsLoading(false)
  }

  const usuariosFiltrados = usuariosDB.filter(
    ({ nombre, apellido_paterno, email }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(apellido_paterno).includes(query) ||
        aMinuscula(email).includes(query)
      )
    }
  )

  return (
    <>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12 col-md-7">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/usuarios/registro")}
            >
              Registrar +
            </button>
          </div>
          <div className="col-12 col-md-5">
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
            <div className="col-12 tablaNoWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#id</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((coparte) => {
                    const {
                      id,
                      nombre,
                      apellido_paterno,
                      apellido_materno,
                      email,
                      rol,
                    } = coparte
                    const nombreCompleto = `${nombre} ${apellido_paterno}`

                    return (
                      <tr key={`coparte_${id}`}>
                        <td>{id}</td>
                        <td>{nombreCompleto}</td>
                        <td>{email}</td>
                        <td>{rol}</td>
                        <td className="d-flex">
                          <button
                            className="btn btn-dark me-1"
                            onClick={() => router.push(`/usuarios/${id}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-dark"
                            onClick={() =>
                              abrirModalEliminarUsuario(id, nombreCompleto)
                            }
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
      </div>
      {modalEliminar.show && (
        <ModalEliminar cancelar={resetModalEliminar} aceptar={eliminarUsuario}>
          <p className="mb-0">
            ¿Estás segur@ de eliminar al usuario {modalEliminar.txt_id}?
          </p>
        </ModalEliminar>
      )}
    </>
  )
}

export default Usuarios
