import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { aMinuscula, obtenerCopartes } from "@assets/utils/common"
import { Coparte, QueriesCoparte } from "@models/coparte.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import { Banner, estadoInicialBanner } from "@components/Banner"

const Copartes = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const [resultadosDB, setResultadosDB] = useState<Coparte[]>([])
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
    const queryCopartes: QueriesCoparte =
      user.id_rol == 2 ? { id_admin: user.id, min: false } : { min: false }

    const { error, data, mensaje } = await obtenerCopartes(queryCopartes)

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
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

  const busquedaFiltrados = resultadosDB.filter(
    ({ nombre, id_alt, nombre_corto }) => {
      const query = aMinuscula(inputBusqueda)
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(id_alt).includes(query) ||
        aMinuscula(nombre_corto).includes(query)
      )
    }
  )

  const determinarNombreAEliminar = (): string => {
    const coparte = resultadosDB.find((coparte) => coparte.id === idAEliminar)
    return coparte ? coparte.nombre : ""
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
      <div className="row">
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2 mb-3">
          <BtnNeutro
            texto="Registrar +"
            onclick={() => router.push("/copartes/registro")}
            margin={false}
            width={true}
          />
        </div>
        <div className="d-none d-lg-block col mb-3"></div>
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
            <thead className="table-light">
              <tr className="color1">
                <th>#id</th>
                <th>Alt id</th>
                <th>Nombre</th>
                <th>Nombre corto</th>
                <th>Estatus legal</th>
                <th>RFC</th>
                <th>Representante legal</th>
                <th>Administrador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {busquedaFiltrados.map((coparte) => {
                const {
                  id,
                  id_alt,
                  nombre,
                  nombre_corto,
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
                    <td>{nombre_corto}</td>
                    <td>{estatus_legal}</td>
                    <td>{i_estatus_legal === 1 ? rfc : "NA"}</td>
                    <td>
                      {i_estatus_legal === 1 ? representante_legal : "NA"}
                    </td>
                    <td>{administrador}</td>
                    <td>
                      <div className="d-flex">
                        <LinkAccion
                          margin={false}
                          icono="bi-eye-fill"
                          ruta={`/copartes/${id}`}
                          title="ver detalle"
                        />
                        <LinkAccion
                          margin="l"
                          icono="bi bi-person-plus"
                          ruta={`/copartes/${id}/usuarios/registro`}
                          title="registrar usuario"
                        />
                        <LinkAccion
                          margin="l"
                          icono="bi bi-file-earmark-text"
                          ruta={`/copartes/${id}/proyectos/registro`}
                          title="registrar proyecto"
                        />
                        {user.id_rol == 1 && (
                          <BtnAccion
                            margin="l"
                            icono="bi bi-x-circle"
                            onclick={() => abrirModalEliminar(id)}
                            title="eliminar coparte"
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
          ¿Estás segur@ de eliminar a la coparte {determinarNombreAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Copartes
