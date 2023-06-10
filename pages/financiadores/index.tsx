import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Financiador } from "@models/financiador.model"

const Financiadores = () => {
  const router = useRouter()
  const [resultadosDB, setResultadosDB] = useState<Financiador[]>([])
  const [resultadosFiltrados, setResultadosFiltrados] = useState<Financiador[]>(
    []
  )
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [tipoSelect, setTipoSelect] = useState<number>(0)

  useEffect(() => {
    obtenerTodos()
  }, [])

  useEffect(() => {
    let tiposFiltrados = resultadosDB
    if (tipoSelect !== 0) {
      tiposFiltrados = resultadosDB.filter(
        ({ i_tipo }) => i_tipo === tipoSelect
      )
    }
    setResultadosFiltrados(tiposFiltrados)
  }, [tipoSelect])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerTodos = async () => {
    setIsLoading(true)

    let url = `/api/financiadores`
    const res = await ApiCall.get(url)
    const { error, data, mensaje } = res

    if (error) {
      console.log(error)
    } else {
      setResultadosDB(data as Financiador[])
      setResultadosFiltrados(data as Financiador[])
    }
    setIsLoading(false)
  }

  const eliminarFinanciador = async () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/api/financiadores/${idAEliminar}`
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

  const busquedaFiltrados = resultadosFiltrados.filter(({ nombre, folio_fiscal }) => {
    const query = aMinuscula(inputBusqueda)
    return aMinuscula(nombre).includes(query) || aMinuscula(folio_fiscal).includes(query)
  })

  const determinarNombreAEliminar = (): string => {
    const financiador = resultadosDB.find(
      (financiador) => financiador.id === idAEliminar
    )
    return financiador ? financiador.nombre : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-3">
        <div className="col-12 col-md-2 mb-2">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/financiadores/registro")}
          >
            Registrar +
          </button>
        </div>
        <div className="col-12 col-md-2 mb-2">
          <select
            className="form-control"
            value={tipoSelect}
            onChange={({ target }) => setTipoSelect(Number(target.value))}
          >
            <option value="0">Todos</option>
            <option value="1">Aliado</option>
            <option value="2">Idependiente</option>
          </select>
        </div>
        <div className="d-none d-md-block col-md-4 mb-2"></div>
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
                  <th>Folio fiscal</th>
                  <th>Tipo</th>
                  <th>Página web</th>
                  <th>Repepresentante legal</th>
                  <th>Fecha constitución</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {busquedaFiltrados.map((financiador) => {
                  const {
                    id,
                    nombre,
                    folio_fiscal,
                    tipo,
                    pagina_web,
                    representante_legal,
                    dt_constitucion_format,
                  } = financiador

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{nombre}</td>
                      <td>{folio_fiscal}</td>
                      <td>{tipo}</td>
                      <td>{pagina_web}</td>
                      <td>{representante_legal}</td>
                      <td>{dt_constitucion_format}</td>
                      <td>
                        <button
                          className="btn btn-dark me-1"
                          onClick={() => router.push(`/financiadores/${id}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-dark"
                          onClick={() => abrirModalEliminar(id)}
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
        aceptar={eliminarFinanciador}
        cancelar={cancelarEliminar}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al financiador {determinarNombreAEliminar()}
          ?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
