import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Financiador } from "@models/financiador.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import { Banner, estadoInicialBanner, mensajesBanner } from "@components/Banner"

const Financiadores = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const [resultadosDB, setResultadosDB] = useState<Financiador[]>([])
  const [resultadosFiltrados, setResultadosFiltrados] = useState<Financiador[]>(
    []
  )
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)

  useEffect(() => {
    obtenerTodos()
  }, [])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerTodos = async () => {
    let url = `/financiadores`
    const res = await ApiCall.get(url)
    const { error, data, mensaje } = res

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
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
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
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

  if (isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (showBanner.show) {
    return (
      <Contenedor>
        <Banner tipo={showBanner.tipo} mensaje={showBanner.mensaje} />
      </Contenedor>
    )
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == 1 && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/financiadores/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {user.id_rol == 2 ? (
          <div className="col d-none d-sm-block mb-3"></div>
        ) : (
          <div className="col d-none d-lg-block mb-3"></div>
        )}
        <div className="col-12 col-sm-6 col-xl-4 mb-3">
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
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#Id</th>
                <th>Id Alt</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>País</th>
                <th>Enlace</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Página web</th>
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
                    <td className="textOverflowTd">
                      <a href={`http://${pagina_web}`} target="_blank">
                        {pagina_web}
                      </a>
                    </td>
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
