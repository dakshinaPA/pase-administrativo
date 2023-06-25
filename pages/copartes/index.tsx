import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Coparte } from "@models/coparte.model"
import { useAuth } from "@contexts/auth.context"

const Financiadores = () => {
  const { user } = useAuth()
  if(!user) return null
  const router = useRouter()
  const [resultadosDB, setResultadosDB] = useState<Coparte[]>([])
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")

  useEffect(() => {
    obtenerTodos()
  }, [])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerTodos = async () => {
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.get("/copartes")

    if (error) {
      console.log(data)
    } else {
      setResultadosDB(data as Coparte[])
    }
    setIsLoading(false)
  }

  const eliminarFinanciador = async () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/copartes/${idAEliminar}`
    )

    if (error) {
      console.log(data)
    } else {
      await obtenerTodos()
    }

    setIsLoading(false)
  }

  const cancelarEliminar = () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
  }

  const busquedaFiltrados = resultadosDB.filter(({ nombre }) => {
    const query = aMinuscula(inputBusqueda)
    return aMinuscula(nombre).includes(query)
  })

  const determinarNombreAEliminar = (): string => {
    const coparte = resultadosDB.find((coparte) => coparte.id === idAEliminar)
    return coparte ? coparte.nombre : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-3">
        <div className="col-12 col-md-2 mb-2">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/copartes/registro")}
          >
            Registrar +
          </button>
        </div>
        <div className="d-none d-md-block col-md-6 mb-2"></div>
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
                  <th>Alt id</th>
                  <th>Nombre</th>
                  <th>Estatus legal</th>
                  <th>RFC</th>
                  <th>Representante legal</th>
                  <th>Administrador</th>
                  <th>Proyectos activos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {busquedaFiltrados.map((coparte) => {
                  const {
                    id,
                    id_alt,
                    nombre,
                    i_estatus_legal,
                    estatus_legal,
                    rfc,
                    representante_legal,
                    administrador,
                  } = coparte

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{id_alt}</td>
                      <td>{nombre}</td>
                      <td>{estatus_legal}</td>
                      <td>{i_estatus_legal === 1 ? rfc : "NA"}</td>
                      <td>
                        {i_estatus_legal === 1 ? representante_legal : "NA"}
                      </td>
                      <td>{administrador.nombre}</td>
                      <td>...</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => router.push(`/copartes/${id}`)}
                            title="ver detalle"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          {administrador.id == user.id && (
                            <>
                              <button
                                className="btn btn-dark btn-sm ms-1"
                                onClick={() =>
                                  router.push(
                                    `/copartes/${id}/usuarios/registro`
                                  )
                                }
                                title="registrar usuario"
                              >
                                <i className="bi bi-person-plus"></i>
                              </button>
                              <button
                                className="btn btn-dark btn-sm ms-1"
                                onClick={() =>
                                  router.push(
                                    `/copartes/${id}/proyectos/registro`
                                  )
                                }
                                title="registrar proyecto"
                              >
                                <i className="bi bi-file-earmark-text"></i>
                              </button>
                            </>
                          )}
                          {user.id_rol == 1 && (
                            <button
                              className="btn btn-dark btn-sm ms-1"
                              onClick={() => abrirModalEliminar(id)}
                              title="eliminar usuario"
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
        aceptar={eliminarFinanciador}
        cancelar={cancelarEliminar}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar a la coparte {determinarNombreAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
