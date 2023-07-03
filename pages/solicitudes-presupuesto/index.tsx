import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"
import { ProyectoMin } from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"
import { BtnNeutro } from "@components/Botones"

const SolicitudesPresupuesto = () => {
  const { user } = useAuth()
  if (!user || user.id_rol != 3) return null
  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [solicitudesDB, setSolicitudesDB] = useState<SolicitudPresupuesto[]>([])
  const [solicitudAeliminar, setSolicitudAEliminar] = useState<number>(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")

  useEffect(() => {
    cargarProyectosUsuario()
  }, [])

  useEffect(() => {
    cargarSolicitudes()
  }, [selectProyecto])

  const cargarProyectosUsuario = async () => {
    const reProyectos = await obtenerProyectos({ id_responsable: user.id })
    if (reProyectos.error) {
      console.log(reProyectos.data)
    } else {
      const proyectos = reProyectos.data as ProyectoMin[]
      setProyectosDB(proyectos)
      if (proyectos.length) {
        setSelectProyecto(proyectos[0].id)
      }
    }
  }

  const cargarSolicitudes = async () => {
    if (!selectProyecto) return

    const reSolicitudes = await obtenerSolicitudes(selectProyecto)
    if (reSolicitudes.error) {
      console.log(reSolicitudes.data)
    } else {
      const solicitudesDB = reSolicitudes.data as SolicitudPresupuesto[]
      setSolicitudesDB(solicitudesDB)
    }
  }

  const abrirModalEliminarSolicitud = (id: number) => {
    setSolicitudAEliminar(id)
    setShowModalEliminar(true)
  }

  const eliminarSolicitud = async () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/solicitudes-presupuesto/${solicitudAeliminar}`
    )

    if (error) {
      console.log(data)
    } else {
      await cargarSolicitudes()
    }

    setIsLoading(false)
  }

  const cancelarEliminarSolicitud = () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
  }

  // const solicitudesFiltradass = solicitudesDB.filter(({  }) => {
  //   const query = inputBusqueda.toLocaleLowerCase()
  //   return (
  //     aMinuscula(nombre).includes(query) || aMinuscula(email).includes(query)
  //   )
  // })

  return (
    <TablaContenedor>
      <div className="row mb-2">
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <BtnNeutro
            texto="Registrar +"
            onclick={() => router.push("/solicitudes-presupuesto/registro")}
            margin={false}
            width={true}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <select
            className="form-control"
            onChange={({ target: { value } }) =>
              setSelectProyecto(Number(value))
            }
            value={selectProyecto}
          >
            {proyectosDB.map(({ id, id_alt, nombre }) => (
              <option key={id} value={id}>
                {nombre} - {id_alt}
              </option>
            ))}
          </select>
        </div>
        <div className="d-none d-lg-block col mb-3"></div>
        <div className="col-12 col-lg-4 mb-3">
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
                  <th>Tipo de gasto</th>
                  <th>CLABE</th>
                  <th>Banco</th>
                  <th>Proveedor</th>
                  <th>Descripción</th>
                  <th>Partida presupuestal</th>
                  <th>Importe</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesDB.map((solicitud) => {
                  const {
                    id,
                    id_proyecto,
                    tipo_gasto,
                    clabe,
                    banco,
                    proveedor,
                    descripcion_gasto,
                    rubro,
                    f_importe,
                    estatus,
                  } = solicitud

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{tipo_gasto}</td>
                      <td>{clabe}</td>
                      <td>{banco}</td>
                      <td>{proveedor}</td>
                      <td>{descripcion_gasto}</td>
                      <td>{rubro}</td>
                      <td>{f_importe}</td>
                      <td>{estatus}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm me-1"
                            onClick={() =>
                              router.push(
                                `/proyectos/${id_proyecto}/solicitudes-presupuesto/${id}`
                              )
                            }
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>

                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => abrirModalEliminarSolicitud(id)}
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
        aceptar={eliminarSolicitud}
        cancelar={cancelarEliminarSolicitud}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar la solicitud {solicitudAeliminar}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default SolicitudesPresupuesto
