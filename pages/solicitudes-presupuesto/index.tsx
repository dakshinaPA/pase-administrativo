import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerBadgeStatusSolicitud,
  obtenerCopartes,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"
import { ProyectoMin } from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"

const SolicitudesPresupuesto = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [solicitudesDB, setSolicitudesDB] = useState<SolicitudPresupuesto[]>([])
  const [solicitudAeliminar, setSolicitudAEliminar] = useState<number>(0)
  const [selectCoparte, setSelectCoparte] = useState(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // const [inputBusqueda, setInputBusqueda] = useState<string>("")

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    if (selectCoparte) {
      cargarProyectosDB()
    }
  }, [selectCoparte])

  useEffect(() => {
    cargarSolicitudes()
  }, [selectProyecto])

  const cargarData = async () => {
    if (user.id_rol != 3) {
      cargarCopartesDB()
    } else {
      cargarProyectosDB()
    }
  }

  const cargarCopartesDB = async () => {
    const query: QueriesCoparte = user.id_rol == 2 ? { id_admin: user.id } : {}

    const reCopartesDB = await obtenerCopartes(query)
    if (reCopartesDB.error) {
      console.log(reCopartesDB.data)
    } else {
      const copartesDB = reCopartesDB.data as CoparteMin[]
      setCopartesDB(copartesDB)
      setSelectCoparte(copartesDB[0]?.id || 0)
    }
  }

  const cargarProyectosDB = async () => {
    const query =
      user.id_rol == 3
        ? { id_responsable: user.id }
        : { id_coparte: selectCoparte }

    const reProyectosDB = await obtenerProyectos(query)
    if (reProyectosDB.error) {
      console.log(reProyectosDB.data)
    } else {
      const proyectosDB = reProyectosDB.data as ProyectoMin[]
      setProyectosDB(proyectosDB)
      setSelectProyecto(proyectosDB[0]?.id || 0)
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
        {user.id_rol == 3 && (
          <div className="col-12 col-md-6 col-lg-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/solicitudes-presupuesto/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {user.id_rol != 3 && (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <select
              className="form-control"
              onChange={({ target: { value } }) =>
                setSelectCoparte(Number(value))
              }
              value={selectCoparte}
            >
              {copartesDB.length > 0 ? (
                copartesDB.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))
              ) : (
                <option value="0" disabled>
                  No hay copartes
                </option>
              )}
            </select>
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <select
            className="form-control"
            onChange={({ target: { value } }) =>
              setSelectProyecto(Number(value))
            }
            value={selectProyecto}
          >
            {proyectosDB.length > 0 ? (
              proyectosDB.map(({ id, id_alt, nombre }) => (
                <option key={id} value={id}>
                  {nombre} - {id_alt}
                </option>
              ))
            ) : (
              <option value="0" disabled>
                No hay proyectos
              </option>
            )}
          </select>
        </div>
        <div className="d-none d-lg-block col mb-3"></div>
        {/* <div className="col-12 col-lg-4 mb-3">
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
        </div> */}
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
                  <th>Partida presupuestal</th>
                  <th>Titular</th>
                  <th>CLABE</th>
                  <th>Banco</th>
                  <th>Proveedor</th>
                  <th>Descripción</th>
                  <th>Importe</th>
                  <th>Por comprobar</th>
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
                    titular_cuenta,
                    banco,
                    proveedor,
                    descripcion_gasto,
                    rubro,
                    f_importe,
                    f_monto_comprobar,
                    i_estatus,
                    estatus,
                  } = solicitud

                  const colorBadge = obtenerBadgeStatusSolicitud(i_estatus)

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{tipo_gasto}</td>
                      <td>{rubro}</td>
                      <td>{titular_cuenta}</td>
                      <td>{clabe}</td>
                      <td>{banco}</td>
                      <td>{proveedor}</td>
                      <td>{descripcion_gasto}</td>
                      <td>{f_importe}</td>
                      <td>{f_monto_comprobar}</td>
                      <td>
                        <span className={`badge bg-${colorBadge}`}>
                          {estatus}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <BtnAccion
                            margin={false}
                            icono="bi-eye-fill"
                            onclick={() =>
                              router.push(
                                `/proyectos/${id_proyecto}/solicitudes-presupuesto/${id}`
                              )
                            }
                            title="ver detalle"
                          />
                          {user.id_rol != 3 && (
                            <BtnAccion
                              margin="l"
                              icono="bi-x-circle"
                              onclick={() => abrirModalEliminarSolicitud(id)}
                              title="eliminar solicitud"
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
