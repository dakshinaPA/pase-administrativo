import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  epochAFecha,
  inputDateAEpoch,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerCopartes,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { crearExcel } from "@assets/utils/crearExcel"
import { useAuth } from "@contexts/auth.context"
import { Proyecto, ProyectoMin } from "@models/proyecto.model"
import {
  EstatusSolicitud,
  PayloadCambioEstatus,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import styles from "@components/styles/Filtros.module.css"
import { TooltipInfo } from "@components/Tooltip"

interface FiltrosSolicitud {
  i_estatus: 0 | EstatusSolicitud
  titular: string
  dt_inicio: string
  dt_fin: string
}

const Filtros = ({ show, setShow, aplicarFiltros }) => {
  const estadoInicialForma: FiltrosSolicitud = {
    i_estatus: 0,
    titular: "",
    dt_inicio: "",
    dt_fin: "",
  }

  const [estaforma, setEstadoForma] = useState(estadoInicialForma)

  useEffect(() => {
    setEstadoForma(estadoInicialForma)
  }, [show])

  const handleChange = (ev) => {
    const { name, value } = ev.target

    setEstadoForma((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const buscarSolicitudes = () => {
    const dataTranformada = {
      i_estatus: Number(estaforma.i_estatus),
      titular: estaforma.titular,
      dt_inicio: estaforma.dt_inicio ? inputDateAEpoch(estaforma.dt_inicio) : 0,
      dt_fin: estaforma.dt_fin ? inputDateAEpoch(estaforma.dt_fin) : 0,
    }

    aplicarFiltros(dataTranformada)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className={styles.filtro}>
      <div className="border px-2 py-3">
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Estatus</label>
          <select
            className="form-control"
            name="i_estatus"
            onChange={handleChange}
            value={estaforma.i_estatus}
          >
            <option value="0">Todos</option>
            <option value="1">Revisión</option>
            <option value="2">Autorizada</option>
            <option value="3">Rechazada</option>
            <option value="4">Procesada</option>
            <option value="3">Devolución</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">
            Titular cuenta
          </label>
          <input
            className="form-control"
            type="text"
            name="titular"
            onChange={handleChange}
            value={estaforma.titular}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha inicio</label>
          <input
            className="form-control"
            type="date"
            name="dt_inicio"
            onChange={handleChange}
            value={estaforma.dt_inicio}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha fin</label>
          <input
            className="form-control"
            type="date"
            name="dt_fin"
            onChange={handleChange}
            value={estaforma.dt_fin}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={buscarSolicitudes}
        >
          Buscar
          <i className="bi bi-search ms-2"></i>
        </button>
      </div>
    </div>
  )
}

const SolicitudesPresupuesto = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [infoProyectoDB, setInfoProyectoDB] = useState<Proyecto>(null)
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<
    SolicitudPresupuesto[]
  >([])
  const [solicitudAeliminar, setSolicitudAEliminar] = useState<number>(0)
  const [selectCoparte, setSelectCoparte] = useState(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [showFiltros, setShowFiltros] = useState<boolean>(false)
  const [idsCambioStatus, setIdsCambioStatus] = useState<
    Record<number, boolean>
  >({})
  const [nuevoEstatus, setNuevoEstatus] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const aExcel = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    if (selectCoparte) {
      cargarProyectosDB()
    }
  }, [selectCoparte])

  useEffect(() => {
    // cargarSolicitudes()
    cargarInfoProyecto()
  }, [selectProyecto])

  const cargarData = async () => {
    if (user.id_rol != 3) {
      cargarCopartesDB()
    } else {
      cargarProyectosDB()
    }
  }

  const cargarCopartesDB = async () => {
    setIsLoading(true)

    const query: QueriesCoparte = user.id_rol == 2 ? { id_admin: user.id } : {}

    const reCopartesDB = await obtenerCopartes(query)
    if (reCopartesDB.error) {
      console.log(reCopartesDB.data)
    } else {
      const copartesDB = reCopartesDB.data as CoparteMin[]
      setCopartesDB(copartesDB)
      if (copartesDB.length == 1) {
        setSelectCoparte(copartesDB[0].id || 0)
      }
    }

    setIsLoading(false)
  }

  const cargarProyectosDB = async () => {
    setIsLoading(true)

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
      if (proyectosDB.length == 1) {
        setSelectProyecto(proyectosDB[0].id || 0)
      }
    }

    setIsLoading(false)
  }

  // const cargarSolicitudes = async () => {
  //   if (!selectProyecto) return

  //   setIsLoading(true)

  //   const reSolicitudes = await obtenerSolicitudes(selectProyecto)
  //   if (reSolicitudes.error) {
  //     console.log(reSolicitudes.data)
  //   } else {
  //     const solicitudesDB = reSolicitudes.data as SolicitudPresupuesto[]
  //     setSolicitudesDB(solicitudesDB)

  //     //set del objeto de las solicitudes para cambios de estatus
  //     const objIdsSolicitudes = {}
  //     for (const solicitud of solicitudesDB) {
  //       objIdsSolicitudes[solicitud.id] = false
  //     }
  //     setIdsCambioStatus(objIdsSolicitudes)
  //   }

  //   setIsLoading(false)
  // }

  const cargarInfoProyecto = async () => {
    if (!selectProyecto) return

    setIsLoading(true)

    const reProyecto = await obtenerProyectos({
      id: selectProyecto,
      min: false,
    })
    if (reProyecto.error) {
      console.log(reProyecto.data)
    } else {
      const infoProyecto = reProyecto.data[0] as Proyecto
      const solicitudesDB = infoProyecto.solicitudes_presupuesto
      setInfoProyectoDB(infoProyecto)
      setSolicitudesFiltradas(solicitudesDB)

      //set del objeto de las solicitudes para cambios de estatus
      const objIdsSolicitudes = {}
      for (const solicitud of solicitudesDB) {
        objIdsSolicitudes[solicitud.id] = false
      }
      setIdsCambioStatus(objIdsSolicitudes)
    }

    setIsLoading(false)
  }

  const cambiarEstatusSolicitudes = async (i_estatus: EstatusSolicitud) => {
    const idsAarray = Object.entries(idsCambioStatus)
    //filtrar los ids que fueron seleccionaos
    const IdsSeleccionadosFiltrados = idsAarray
      .filter((id) => !!id[1])
      .map((id) => Number(id[0]))

    setIsLoading(true)

    const payload: PayloadCambioEstatus = {
      i_estatus,
      ids_solicitudes: IdsSeleccionadosFiltrados,
    }

    const upEstatus = await ApiCall.put(
      "/solicitudes-presupuesto/cambio-estatus",
      payload
    )

    if (upEstatus.error) {
      console.log(upEstatus.data)
    } else {
      // cargarSolicitudes()
    }

    setIsLoading(false)
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
      // await cargarSolicitudes()
    }

    setIsLoading(false)
  }

  const cancelarEliminarSolicitud = () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
  }

  const descargarExcel = () => {
    const encabezado = [
      "Tipo de gasto",
      "Rubro",
      "Titular de la cuenta",
      "CLABE",
      "Banco",
      "Descricpión del gasto",
      "Proveedor",
      "Fecha de registro",
      "Estatus",
      "Importe",
      "Monto a comprobar",
    ]

    const solicituesAArray = solicitudesFiltradas.map((solicitud) => {
      return [
        solicitud.tipo_gasto,
        solicitud.rubro,
        solicitud.titular_cuenta,
        solicitud.clabe,
        solicitud.banco,
        solicitud.descripcion_gasto,
        solicitud.proveedor,
        epochAFecha(solicitud.dt_registro),
        solicitud.estatus,
        solicitud.f_importe,
        solicitud.saldo.f_monto_comprobar,
      ]
    })

    const dataSheet = [encabezado, ...solicituesAArray]

    crearExcel({
      nombreHoja: "Libro 1",
      nombreArchivo: "solicitudes.xlsx",
      data: dataSheet,
    })
  }

  const seleccionarSolicitud = (checked: boolean, id_solicitud: number) => {
    setIdsCambioStatus((prevState) => ({
      ...prevState,
      [id_solicitud]: checked,
    }))
  }

  const seleccionarTodasSolicitudes = (checked: boolean) => {
    setIdsCambioStatus((prevState) => {
      const nuevoObjeto = {}

      for (const key in prevState) {
        nuevoObjeto[key] = checked
      }

      return nuevoObjeto
    })
  }

  const aplicarFiltros = (filtros: FiltrosSolicitud) => {
    const { i_estatus, titular, dt_inicio, dt_fin } = filtros

    const solicitudesFiltro = infoProyectoDB.solicitudes_presupuesto.filter(
      (solicitud) => {
        const condicionEstatus =
          i_estatus > 0 ? solicitud.i_estatus === i_estatus : true
        const condicionTitular = titular
          ? aMinuscula(solicitud.titular_cuenta).includes(aMinuscula(titular))
          : true
        const condicionDtInicio = dt_inicio
          ? solicitud.dt_registro >= dt_inicio
          : true
        const condicionDtFin = dt_fin ? solicitud.dt_registro <= dt_fin : true

        return (
          condicionEstatus &&
          condicionTitular &&
          condicionDtInicio &&
          condicionDtFin
        )
      }
    )

    setSolicitudesFiltradas(solicitudesFiltro)
    // if (i_estatus > 0) {

    //   const solicitudesFiltro = infoProyectoDB.solicitudes_presupuesto.filter(
    //     (solicitud) => solicitud.i_estatus == i_estatus
    //   )
    //   setSolicitudesFiltradas(solicitudesFiltro)
    // } else {
    //   setSolicitudesFiltradas(infoProyectoDB.solicitudes_presupuesto)
    // }
  }

  const showSelectCambioStatus = Object.entries(idsCambioStatus).some(
    (id) => !!id[1]
  )

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == 3 && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/solicitudes-presupuesto/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {user.id_rol != 3 && (
          <div className="col-12 col-sm-6 col-lg-3 mb-3">
            <select
              className="form-control"
              onChange={({ target: { value } }) =>
                setSelectCoparte(Number(value))
              }
              value={selectCoparte}
            >
              <option value="0" disabled>
                Selecciona coparte
              </option>
              {copartesDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <select
            className="form-control"
            onChange={({ target: { value } }) =>
              setSelectProyecto(Number(value))
            }
            value={selectProyecto}
          >
            <option value="0" disabled>
              Selecciona proyecto
            </option>
            {proyectosDB.map(({ id, id_alt, nombre }) => (
              <option key={id} value={id}>
                {nombre} - {id_alt}
              </option>
            ))}
          </select>
        </div>
        <div
          className={`col-12 col-sm-6 col-lg-3 mb-3 ${styles.filtros_contenedor}`}
        >
          <button
            type="button"
            className={`btn btn-outline-secondary w-100`}
            onClick={() => setShowFiltros(!showFiltros)}
          >
            Filtros
            <i className="bi bi-funnel ms-1"></i>
          </button>
          <Filtros
            show={showFiltros}
            setShow={setShowFiltros}
            aplicarFiltros={aplicarFiltros}
          />
        </div>
        <div className="col d-none d-xl-block"></div>
        <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
          <button
            className="btn btn-outline-secondary w-100"
            type="button"
            onClick={descargarExcel}
          >
            Exportar
            <i className="bi bi-file-earmark-excel ms-1"></i>
          </button>
          <a ref={aExcel} className="d-none" href="" download="solicitudes.xls">
            Exportar
          </a>
        </div>
        {showSelectCambioStatus && (
          <div className="col-12 mb-3">
            <div className="row">
              <div className="col"></div>
              <div className="col-12 col-sm-6 col-xl-4">
                <select
                  className="form-control"
                  onChange={({ target }) =>
                    cambiarEstatusSolicitudes(
                      Number(target.value) as EstatusSolicitud
                    )
                  }
                  value={nuevoEstatus}
                >
                  <option value="0" disabled>
                    Selecciona estatus
                  </option>
                  <option value="2">Autorizada</option>
                  <option value="3">Rechazada</option>
                  <option value="4">Procesada</option>
                  <option value="5">Devolución</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      {isLoading && <Loader />}
      {infoProyectoDB && (
        <>
          <div className="row mb-3">
            <div className="col-12 mb-2">
              <h4 className="color1 mb-0">Saldo del proyecto</h4>
            </div>
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Monto total</th>
                    <th>Transferido</th>
                    <th>Solicitado</th>
                    <th>Comprobado</th>
                    <th>Por comprobar</th>
                    <th>ISR (35%)</th>
                    <th>Retenciones</th>
                    <th>
                      PA
                      {/* <span className="me-1">PA</span>
                      <TooltipInfo texto="Gestión financiera de Dakshina" /> */}
                    </th>
                    <th>Total ejecutado</th>
                    <th>Remanente</th>
                    <th>Avance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{montoALocaleString(infoProyectoDB.f_monto_total)}</td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_transferido)}
                    </td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_solicitado)}
                    </td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_comprobado)}
                    </td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_por_comprobar)}
                    </td>
                    <td>{montoALocaleString(infoProyectoDB.saldo.f_isr)}</td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_retenciones)}
                    </td>
                    <td>{montoALocaleString(infoProyectoDB.saldo.f_pa)}</td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_ejecutado)}
                    </td>
                    <td>
                      {montoALocaleString(infoProyectoDB.saldo.f_remanente)}
                    </td>
                    <td>{infoProyectoDB.saldo.p_avance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="row">
            <div className="col-12 mb-2">
              <h4 className="color1 mb-0">Solicitudes</h4>
            </div>
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>#id</th>
                    <th>Tipo de gasto</th>
                    <th>Partida presupuestal</th>
                    <th>Titular</th>
                    <th>Proveedor</th>
                    <th>Descripción</th>
                    <th>Importe solicitado</th>
                    <th>Comprobado</th>
                    <th>Por comprobar</th>
                    <th>Retenciones</th>
                    <th>Total</th>
                    <th>Estatus</th>
                    <th>Fecha registro</th>
                    {user.id_rol == 1 && (
                      <th>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={({ target }) =>
                            seleccionarTodasSolicitudes(target.checked)
                          }
                          checked={showSelectCambioStatus}
                        />
                      </th>
                    )}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => {
                    const {
                      id,
                      id_proyecto,
                      tipo_gasto,
                      titular_cuenta,
                      proveedor,
                      descripcion_gasto,
                      rubro,
                      f_importe,
                      saldo,
                      i_estatus,
                      estatus,
                      dt_registro,
                    } = solicitud

                    const colorBadge = obtenerBadgeStatusSolicitud(i_estatus)

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{tipo_gasto}</td>
                        <td>{rubro}</td>
                        <td>{titular_cuenta}</td>
                        <td>{proveedor}</td>
                        <td>{descripcion_gasto}</td>
                        <td>{montoALocaleString(f_importe)}</td>
                        <td>
                          {montoALocaleString(saldo.f_total_comprobaciones)}
                        </td>
                        <td>{montoALocaleString(saldo.f_monto_comprobar)}</td>
                        <td>
                          {montoALocaleString(
                            saldo.f_total_impuestos_retenidos
                          )}
                        </td>
                        <td>{montoALocaleString(saldo.f_total)}</td>
                        <td>
                          <span className={`badge bg-${colorBadge}`}>
                            {estatus}
                          </span>
                        </td>
                        <td>{epochAFecha(dt_registro)}</td>
                        {user.id_rol == 1 && (
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onChange={({ target }) =>
                                seleccionarSolicitud(target.checked, id)
                              }
                              checked={idsCambioStatus[id]}
                            />
                          </td>
                        )}
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
                            {user.id_rol == 1 && (
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
        </>
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
