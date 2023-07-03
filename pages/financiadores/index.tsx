import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Financiador } from "@models/financiador.model"
import { useAuth } from "@contexts/auth.context"
import { BtnAccion, BtnNeutro } from "@components/Botones"

const Financiadores = () => {
  const { user } = useAuth()
  if (!user || user.id_rol == 3) return null
  const router = useRouter()
  const [resultadosDB, setResultadosDB] = useState<Financiador[]>([])
  const [resultadosFiltrados, setResultadosFiltrados] = useState<Financiador[]>(
    []
  )
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  // const [tipoSelect, setTipoSelect] = useState<number>(0)

  useEffect(() => {
    obtenerTodos()
  }, [])

  // useEffect(() => {
  //   let tiposFiltrados = resultadosDB
  //   if (tipoSelect !== 0) {
  //     tiposFiltrados = resultadosDB.filter(
  //       ({ i_tipo }) => i_tipo === tipoSelect
  //     )
  //   }
  //   setResultadosFiltrados(tiposFiltrados)
  // }, [tipoSelect])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerTodos = async () => {
    setIsLoading(true)

    let url = `/financiadores`
    const res = await ApiCall.get(url)
    const { error, data, mensaje } = res

    if (error) {
      console.log(data)
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
      `/financiadores/${idAEliminar}`
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

  const busquedaFiltrados = resultadosFiltrados.filter(({ nombre, id_alt }) => {
    const query = aMinuscula(inputBusqueda)
    return (
      aMinuscula(nombre).includes(query) || aMinuscula(id_alt).includes(query)
    )
  })

  const determinarNombreAEliminar = (): string => {
    const financiador = resultadosDB.find(
      (financiador) => financiador.id === idAEliminar
    )
    return financiador ? financiador.nombre : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == 1 && (
          <div className="col-12 col-md-4 col-lg-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/financiadores/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {/* <div className="col-12 col-md-2 mb-2">
          <select
            className="form-control"
            value={tipoSelect}
            onChange={({ target }) => setTipoSelect(Number(target.value))}
          >
            <option value="0">Todos</option>
            <option value="1">Aliado</option>
            <option value="2">Idependiente</option>
          </select>
        </div> */}
        <div className="d-none d-md-block col mb-3"></div>
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
                  <th>#Dd</th>
                  <th>Id Alt</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>País</th>
                  <th>Enlace</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Página web</th>
                  <th>Proyectos activos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {busquedaFiltrados.map((financiador) => {
                  const {
                    id,
                    id_alt,
                    nombre,
                    tipo,
                    pagina_web,
                    enlace,
                    direccion,
                  } = financiador

                  const nombreEnlace = `${enlace.nombre} ${enlace.apellido_paterno} ${enlace.apellido_materno}`

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{id_alt}</td>
                      <td>{nombre}</td>
                      <td>{tipo}</td>
                      <td>{direccion.pais}</td>
                      <td>{nombreEnlace}</td>
                      <td>{enlace.email}</td>
                      <td>{enlace.telefono}</td>
                      <td>
                        <a href={`http://${pagina_web}`} target="_blank">
                          {pagina_web}
                        </a>
                      </td>
                      <td>...</td>
                      <td>
                        <div className="d-flex">
                          <BtnAccion
                            margin={false}
                            icono="bi-eye-fill"
                            onclick={() => router.push(`/financiadores/${id}`)}
                            title="ver detalle"
                          />
                          {user.id_rol == 1 && (
                            <BtnAccion
                              margin="l"
                              icono="bi-x-circle"
                              onclick={() => abrirModalEliminar(id)}
                              title="eliminar financiador"
                            />
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
          ¿Estás segur@ de eliminar al financiador {determinarNombreAEliminar()}
          ?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
