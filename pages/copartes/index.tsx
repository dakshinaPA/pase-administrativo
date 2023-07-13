import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import { aMinuscula, obtenerCopartes } from "@assets/utils/common"
import { Coparte, QueriesCoparte } from "@models/coparte.model"
import { useAuth } from "@contexts/auth.context"
import { BtnAccion, BtnNeutro } from "@components/Botones"

const Financiadores = () => {
  const { user } = useAuth()
  if (!user || user.id_rol == 3) return null
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

    const queryCopartes: QueriesCoparte =
      user.id_rol == 2 ? { id_admin: user.id, min: false } : { min: false }

    const { error, data, mensaje } = await obtenerCopartes(queryCopartes)

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
                  <th>Nombre corto</th>
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
                      <td>{administrador.nombre}</td>
                      <td>...</td>
                      <td>
                        <div className="d-flex">
                          <BtnAccion
                            margin={false}
                            icono="bi bi-eye-fill"
                            onclick={() => router.push(`/copartes/${id}`)}
                            title="ver detalle"
                          />
                          <BtnAccion
                            margin="l"
                            icono="bi bi-person-plus"
                            onclick={() =>
                              router.push(`/copartes/${id}/usuarios/registro`)
                            }
                            title="registrar usuario"
                          />
                          {user.id_rol == 2 && (
                            <BtnAccion
                              margin="l"
                              icono="bi bi-file-earmark-text"
                              onclick={() =>
                                router.push(
                                  `/copartes/${id}/proyectos/registro`
                                )
                              }
                              title="registrar proyecto"
                            />
                          )}
                          {user.id_rol == 1 && (
                            <BtnAccion
                              margin="l"
                              icono="bi bi-x-circle"
                              onclick={() => abrirModalEliminar(id)}
                              title="eliminar usuario"
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
          ¿Estás segur@ de eliminar a la coparte {determinarNombreAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
