import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { aMinuscula } from "@assets/utils/common"
import { Coparte } from "@api/models/copartes.model"
import { modalEliminarModel } from "@assets/models/modalEliminar.model"

const Copartes = () => {
  const estadoInicialModalEliminar = { show: false, id: 0, txt_id: "" }
  const router = useRouter()
  const [copartesDB, setcopartesDB] = useState<Coparte[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [modalEliminar, setModalEliminar] = useState<modalEliminarModel>(
    estadoInicialModalEliminar
  )

  useEffect(() => {
    obtenercopartes()
  }, [])

  const abrirModalEliminarCoparte = (id: number, txt_id: string) => {
    setModalEliminar({ show: true, id, txt_id })
  }

  const resetModalEliminar = () => {
    setModalEliminar(estadoInicialModalEliminar)
  }

  const obtenercopartes = async () => {
    setIsLoading(true)
    const res = await ApiCall.get("/api/copartes")
    const { error, data, mensaje } = res
    if (!error) {
      setcopartesDB(data as Coparte[])
    }
    setIsLoading(false)
  }

  const eliminarCoparte = async () => {
    setModalEliminar(estadoInicialModalEliminar)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/api/copartes/${modalEliminar.id}`
    )

    if (!error) {
      await obtenercopartes()
    }

    setIsLoading(false)
  }

  const copartesFiltradas = copartesDB.filter(({ nombre, vc_id }) => {
    const query = inputBusqueda.toLocaleLowerCase()
    return (
      aMinuscula(nombre).includes(query) || aMinuscula(vc_id).includes(query)
    )
  })

  return (
    <>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12 col-md-7">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/copartes/registro")}
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
                    <th>Id</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {copartesFiltradas.map((coparte) => {
                    const { id, nombre, vc_id, tipo } = coparte

                    return (
                      <tr key={`coparte_${id}`}>
                        <td>{id}</td>
                        <td>{nombre}</td>
                        <td>{vc_id}</td>
                        <td>{tipo}</td>
                        <td className="d-flex">
                          <button
                            className="btn btn-dark me-1"
                            onClick={() => router.push(`/copartes/${id}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-dark"
                            onClick={() => abrirModalEliminarCoparte(id, vc_id)}
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
        <ModalEliminar cancelar={resetModalEliminar} aceptar={eliminarCoparte}>
          <p className="mb-0">
            ¿Estás segur@ de eliminar la coparte {modalEliminar.txt_id}?
          </p>
        </ModalEliminar>
      )}
    </>
  )
}

export default Copartes
