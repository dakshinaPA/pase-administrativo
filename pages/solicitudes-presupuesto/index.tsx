import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  epochAFecha,
  inputDateAEpoch,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { crearExcel } from "@assets/utils/crearExcel"
import { useAuth } from "@contexts/auth.context"
import {
  EstatusSolicitud,
  PayloadCambioEstatus,
  QueriesSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"
import { TooltipInfo } from "@components/Tooltip"
import { Filtros } from "@components/FiltrosSolicitudes"
import { Toast } from "@components/Toast"
import styles from "@components/styles/Filtros.module.css"

interface SolicitudPresupuestoVista extends SolicitudPresupuesto {
  checked: boolean
}

const estadoInicialFiltros: QueriesSolicitud = {
  id_coparte: 0,
  id_proyecto: 0,
  i_estatus: 1,
  titular: "",
  dt_inicio: "",
  dt_fin: "",
}

const SolicitudesPresupuesto = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()

  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<
    SolicitudPresupuestoVista[]
  >([])
  const [solicitudAeliminar, setSolicitudAEliminar] = useState<number>(0)

  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [showFiltros, setShowFiltros] = useState<boolean>(false)
  const [nuevoEstatus, setNuevoEstatus] = useState(0)
  const [cbStatusSolicitudes, setCbStatusSolicitudes] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filtros, setFiltros] = useState(estadoInicialFiltros)

  const aExcel = useRef(null)

  useEffect(() => {
    // cargarData()
    cargarSolicitudes()
  }, [])

  useEffect(() => {
    setSolicitudesFiltradas((prevState) => {
      return prevState.map((sol) => ({
        ...sol,
        checked: cbStatusSolicitudes,
      }))
    })
  }, [cbStatusSolicitudes])

  const cargarSolicitudes = async () => {
    try {
      const queries: QueriesSolicitud = {}
      // const queries: QueriesSolicitud = { limit: 1 }

      if (user.id_rol == 2) {
        queries.id_admin = user.id
      } else if (user.id_rol == 3) {
        queries.id_responsable = user.id
      }

      if (Number(filtros.id_coparte)) queries.id_coparte = filtros.id_coparte
      if (Number(filtros.id_proyecto)) {
        queries.id_proyecto = filtros.id_proyecto
        delete queries.id_coparte
      }
      if (Number(filtros.i_estatus)) queries.i_estatus = filtros.i_estatus
      if (filtros.titular) queries.titular = filtros.titular
      if (filtros.dt_inicio)
        queries.dt_inicio = String(inputDateAEpoch(filtros.dt_inicio))
      if (filtros.dt_fin)
        queries.dt_fin = String(inputDateAEpoch(filtros.dt_fin))

      // console.log(queries)
      // return

      setIsLoading(true)
      const reSolicitudes = await obtenerSolicitudes(queries)
      if (reSolicitudes.error) throw reSolicitudes.data

      const solicitudesDB = reSolicitudes.data as SolicitudPresupuesto[]
      const solicitudesVista: SolicitudPresupuestoVista[] = solicitudesDB.map(
        (sol) => ({ ...sol, checked: false })
      )
      // setSolicitudesDB(solicitudesVista)
      setSolicitudesFiltradas(solicitudesVista)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const cambiarEstatusSolicitudes = async (i_estatus: EstatusSolicitud) => {
    const idsSelecionados = solicitudesFiltradas
      .filter((sol) => !!sol.checked)
      .map((sol) => sol.id)

    // no enviar peticion si no hay ids seleccionados
    if (!idsSelecionados.length) return

    setIsLoading(true)
    setCbStatusSolicitudes(false)

    const payload: PayloadCambioEstatus = {
      i_estatus,
      ids_solicitudes: idsSelecionados,
    }
    const upEstatus = await ApiCall.put(
      "/solicitudes-presupuesto/cambio-estatus",
      payload
    )
    if (upEstatus.error) {
      console.log(upEstatus.data)
    } else {
      cargarSolicitudes()
    }
    setIsLoading(false)
  }

  const limpiarFiltros = () => {
    setFiltros(estadoInicialFiltros)
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

  const descargarExcel = () => {
    const encabezado = [
      "Id proyecto",
      "Coparte",
      "Proveedor",
      "ClABE/Cuenta",
      "Titular",
      "Email",
      "Tipo de gasto",
      "Descricpión del gasto",
      "Partida presupuestal",
      "Importe solicitado",
      "Comprobado",
      "Por comprobar",
      "Retenciones",
      "Total",
      "Estatus",
    ]

    const solicituesAArray = solicitudesFiltradas.map((solicitud) => {
      return [
        solicitud.proyecto.split(" ")[0],
        solicitud.coparte,
        solicitud.proveedor,
        solicitud.clabe,
        solicitud.titular_cuenta,
        solicitud.email,
        solicitud.tipo_gasto,
        solicitud.descripcion_gasto,
        solicitud.rubro,
        solicitud.f_importe,
        solicitud.saldo.f_total_comprobaciones,
        solicitud.saldo.f_monto_comprobar,
        solicitud.saldo.f_total_impuestos_retenidos,
        solicitud.saldo.f_total,
        solicitud.estatus,
      ]
    })

    const dataSheet = [encabezado, ...solicituesAArray]

    crearExcel({
      nombreHoja: "Libro 1",
      nombreArchivo: "solicitudes.xlsx",
      data: dataSheet,
    })
  }

  const seleccionarSolicitudCambioStatus = (
    checked: boolean,
    id_solicitud: number
  ) => {
    const nuevaListaSolicitudes = solicitudesFiltradas.map((sol) => {
      if (sol.id == id_solicitud) {
        return {
          ...sol,
          checked,
        }
      }
      return sol
    })

    setSolicitudesFiltradas(nuevaListaSolicitudes)
  }

  const showSelectEstatus = solicitudesFiltradas.some((sol) => !!sol.checked)
  const showCbStatus = user.id_rol != 3

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
            filtros={filtros}
            setFiltros={setFiltros}
            show={showFiltros}
            setShow={setShowFiltros}
            cargarSolicitudes={cargarSolicitudes}
            limpiarFiltros={limpiarFiltros}
          />
        </div>
        <div className="col d-none d-xl-block"></div>
        {showSelectEstatus && (
          <div className="col-12 col-sm-6 col-lg-3 mb-3">
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
              <option value="1">Revisión</option>
              <option value="2">Autorizada</option>
              <option value="3">Rechazada</option>
              <option value="4">Procesada</option>
              <option value="5">Devolución</option>
            </select>
          </div>
        )}
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
      </div>
      <>
        <div className="row">
          <div className="col-12 table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th>#id</th>
                  <th>Proyecto</th>
                  {user.id_rol != 3 && <th>Coparte</th>}
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
                  {showCbStatus && (
                    <th>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        // onChange={({ target }) =>
                        //   seleccionarTodasSolicitudes(target.checked)
                        // }
                        onChange={() =>
                          setCbStatusSolicitudes(!cbStatusSolicitudes)
                        }
                        checked={cbStatusSolicitudes}
                      />
                    </th>
                  )}
                  <th>Acciones</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <tr>
                    <td colSpan={14}>
                      <Loader />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => {
                    const {
                      id,
                      id_proyecto,
                      proyecto,
                      coparte,
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
                      checked,
                    } = solicitud

                    const colorBadge = obtenerBadgeStatusSolicitud(i_estatus)

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{proyecto.split(" ")[0]}</td>
                        {user.id_rol != 3 && <td>{coparte}</td>}
                        <td>{tipo_gasto}</td>
                        <td>{rubro}</td>
                        <td>{titular_cuenta}</td>
                        <td>{proveedor}</td>
                        <td>{descripcion_gasto}</td>
                        <td>${montoALocaleString(f_importe)}</td>
                        <td>
                          ${montoALocaleString(saldo.f_total_comprobaciones)}
                        </td>
                        <td>${montoALocaleString(saldo.f_monto_comprobar)}</td>
                        <td>
                          $
                          {montoALocaleString(
                            saldo.f_total_impuestos_retenidos
                          )}
                        </td>
                        <td>${montoALocaleString(saldo.f_total)}</td>
                        <td>
                          <span className={`badge bg-${colorBadge}`}>
                            {estatus}
                          </span>
                        </td>
                        <td>{epochAFecha(dt_registro)}</td>
                        {showCbStatus && (
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onChange={({ target }) =>
                                seleccionarSolicitudCambioStatus(
                                  target.checked,
                                  id
                                )
                              }
                              checked={checked}
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
              )}
            </table>
          </div>
        </div>
      </>

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
