import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Proyecto } from "@models/proyecto.model"

const Financiadores = () => {
  const router = useRouter()
  const [resultadosDB, setResultadosDB] = useState<Proyecto[]>([])
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

    const { error, data, mensaje } = await ApiCall.get("/proyectos")

    if (error) {
      console.log(error)
    } else {
      setResultadosDB(data as Proyecto[])
    }
    setIsLoading(false)
  }

  const eliminarFinanciador = async () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/proyectos/${idAEliminar}`
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

  const busquedaFiltrados = resultadosDB.filter(({ id_alt }) => {
    const query = aMinuscula(inputBusqueda)
    return aMinuscula(id_alt).includes(query)
  })

  const determinarNombreAEliminar = (): string => {
    const proyecto = resultadosDB.find(
      (proyecto) => proyecto.id === idAEliminar
    )
    return proyecto ? proyecto.id_alt : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-3">
        <div className="col-12 col-md-2 mb-2">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/proyectos/registro")}
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
                  <th>Financiador</th>
                  <th>Tipo financiamiento</th>
                  <th>Monto total</th>
                  <th>Beneficiados</th>
                  <th>Responsable</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {busquedaFiltrados.map((proyecto) => {
                  const {
                    id,
                    id_alt,
                    id_coparte,
                    financiador,
                    tipo_financiamiento,
                    f_monto_total,
                    i_beneficiados,
                    responsable,
                  } = proyecto

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{id_alt}</td>
                      <td>{financiador.nombre}</td>
                      <td>{tipo_financiamiento}</td>
                      <td>{f_monto_total}</td>
                      <td>{i_beneficiados}</td>
                      <td>{responsable.nombre}</td>
                      <td>...</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() =>
                              router.push(
                                `/copartes/${id_coparte}/proyectos/${id}`
                              )
                            }
                            title="ver detalle"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          <button
                            className="btn btn-dark btn-sm ms-1"
                            onClick={() =>
                              router.push(
                                `/proyectos/${id}/solicitudes-presupuesto/registro`
                              )
                            }
                            title="registrar solicitud"
                          >
                            <i className="bi bi-file-earmark-text"></i>
                          </button>
                          <button
                            className="btn btn-dark btn-sm ms-1"
                            onClick={() => abrirModalEliminar(id)}
                            title="eliminar"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
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
          ¿Estás segur@ de eliminar al proyecto {determinarNombreAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
