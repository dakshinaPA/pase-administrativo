import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { aMinuscula } from "@assets/utils/common"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"

const SolicitudesPresupuesto = () => {
  const router = useRouter()
  const [solicitudesDB, setSolicitudesDB] = useState<SolicitudPresupuesto[]>([])
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")

  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  const abrirModalEliminarSolicitud = (id: number) => {
    setSolicitudAEliminar(id)
    setShowModalEliminar(true)
  }

  const obtenerSolicitudes = async () => {
    setIsLoading(true)

    const res = await ApiCall.get("/api/presupuestos")
    const { error, data, mensaje } = res

    if (error) {
      console.log(error)
    } else {
      setSolicitudesDB(data as SolicitudPresupuesto[])
    }
    setIsLoading(false)
  }

  const eliminarSolicitud = async () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/api/presupuestos/${solicitudAEliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      await obtenerSolicitudes()
    }

    setIsLoading(false)
  }

  const cancelarEliminarSolicitud = () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
  }

  const solicitudesFiltradas = solicitudesDB.filter(
    ({ clabe, titular, rfc }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(clabe).includes(query) ||
        aMinuscula(titular).includes(query) ||
        aMinuscula(rfc).includes(query)
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
              onClick={() => router.push("/presupuestos/registro")}
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
                    <th>Clabe</th>
                    <th>Banco</th>
                    <th>Titular</th>
                    <th>Rfc</th>
                    <th>Email</th>
                    <th>Partida</th>
                    <th>Descripción</th>
                    <th>Importe</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => {
                    const {
                      id,
                      clabe,
                      banco,
                      titular,
                      rfc,
                      email,
                      partida,
                      descripcion,
                      importe,
                    } = solicitud

                    return (
                      <tr key={`coparte_${id}`}>
                        <td>{id}</td>
                        <td>{clabe}</td>
                        <td>{banco}</td>
                        <td>{titular}</td>
                        <td>{rfc}</td>
                        <td>{email}</td>
                        <td>{partida}</td>
                        <td>{descripcion}</td>
                        <td>{importe}</td>
                        <td className="d-flex">
                          <button
                            className="btn btn-dark me-1"
                            onClick={() => router.push(`/presupuestos/${id}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-dark"
                            onClick={() => abrirModalEliminarSolicitud(id)}
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
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarSolicitud}
        cancelar={cancelarEliminarSolicitud}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al la solicitud de presupuesto{" "}
          {solicitudAEliminar}?
        </p>
      </ModalEliminar>
    </>
  )
}

export default SolicitudesPresupuesto
