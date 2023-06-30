import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  DataProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import {
  ComprobanteSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { useAuth } from "@contexts/auth.context"
import { obtenerProyectos, obtenerSolicitudes } from "@assets/utils/common"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "AGREGAR_FACTURA"
  | "QUITAR_FACTURA"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (
  state: SolicitudPresupuesto,
  action: ActionDispatch
): SolicitudPresupuesto => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "AGREGAR_FACTURA":
      return {
        ...state,
        comprobantes: [...state.comprobantes, payload],
      }
    case "QUITAR_FACTURA":
      const comprobantesFiltrados = state.comprobantes.filter(
        (comp) => comp.folio_fiscal !== payload
      )

      return {
        ...state,
        comprobantes: comprobantesFiltrados,
      }
    default:
      return state
  }
}

const estadoInicialDataProyecto: DataProyecto = {
  colaboradores: [],
  proveedores: [],
  rubros_presupuestales: [],
}

const FormaSolicitudPresupuesto = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idSolicitud = Number(router.query.idS)

  const estadoInicialForma: SolicitudPresupuesto = {
    id_proyecto: 0,
    i_tipo_gasto: 1,
    titular: "",
    clabe: "",
    id_banco: 1,
    rfc: "",
    email: "",
    proveedor: "",
    descripcion_gasto: "",
    id_partida_presupuestal: 0,
    f_importe: "0",
    comprobantes: [],
  }

  const { bancos } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [dataProyecto, setDataProyecto] = useState(estadoInicialDataProyecto)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idSolicitud)
  const modalidad = idSolicitud ? "EDITAR" : "CREAR"
  const fileInput = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarDataProyecto()
  }, [estadoForma.id_proyecto])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectosDB()]
      if (modalidad === "EDITAR") {
        promesas.push(obtenerSolicitudes(null, idSolicitud))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const proyectosDB = resCombinadas[0].data as ProyectoMin[]
      setProyectosDB(proyectosDB)

      if (modalidad === "EDITAR") {
        const solicitud = resCombinadas[1].data[0] as SolicitudPresupuesto

        dispatch({
          type: "CARGA_INICIAL",
          payload: solicitud,
        })
      } else {
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_proyecto",
            value: proyectosDB[0].id,
          },
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarDataProyecto = async () => {
    const idProyecto = estadoForma.id_proyecto
    if (!idProyecto) return

    const reDataProyecto = await obtenerProyectos({
      id: idProyecto,
      registro_solicitud: true,
      min: false,
    })

    if (reDataProyecto.error) {
      console.log(reDataProyecto.data)
    } else {
      const dataProyecto = reDataProyecto.data as DataProyecto
      setDataProyecto(dataProyecto)
    }
  }

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const registrar = async () => {
    return ApiCall.post("/solicitudes-presupuesto", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/solicitudes-presupuesto/${idSolicitud}`, estadoForma)
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.back()
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const agregarFactura = (ev) => {
    const [file] = ev.target.files

    const reader = new FileReader()

    reader.onload = () => {
      const parser = new DOMParser()
      const xml = parser.parseFromString(
        reader.result as string,
        "application/xml"
      )

      console.log(xml)

      const [comprobante] = xml.getElementsByTagName("cfdi:Comprobante")
      const [emisor] = comprobante.getElementsByTagName("cfdi:Emisor")

      // console.log(comprobante)
      // console.log(emisor)

      const folio_fiscal = comprobante.getAttribute("Folio")
      const metodo_pago = comprobante.getAttribute("MetodoPago")
      const f_subtotal = comprobante.getAttribute("SubTotal")
      const f_retenciones = comprobante.getAttribute("Descuento")
      const f_total = comprobante.getAttribute("Total")
      const regimen_fiscal = emisor.getAttribute("RegimenFiscal")

      const dataComprobante: ComprobanteSolicitud = {
        folio_fiscal,
        metodo_pago,
        forma_pago: "03",
        regimen_fiscal,
        f_subtotal,
        f_total,
        f_retenciones,
      }

      dispatch({
        type: "AGREGAR_FACTURA",
        payload: dataComprobante,
      })
    }

    reader.readAsText(file)
  }

  const quitarFactura = (folio: string) => {
    dispatch({
      type: "QUITAR_FACTURA",
      payload: folio,
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    console.log(estadoForma)

    return

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push(
          //@ts-ignore
          `/proyectos/${estadoForma.id_proyecto}/solicitudes-presupuesto/${data.idInsertado}`
        )
      } else {
        setModoEditar(false)
      }
    }
  }

  const montoComprobar = () => {
    const totalComprobaciones = estadoForma.comprobantes.reduce(
      (acum, actual) => acum + Number(actual.f_total),
      0
    )

    const totalAComprobar = Number(estadoForma.f_importe) - totalComprobaciones
    return totalAComprobar.toFixed(2)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div>
            {/* <BtnBack navLink="/solicitudes-presupuesto" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">
                Registrar solicitud de presupuesto
              </h2>
            )}
          </div>
          {!modoEditar &&
            idSolicitud &&
            user.id === estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        {modalidad === "EDITAR" && (
          <div className="col-12 text-end mb-3">
            <h5>
              <span className="badge bg-info">{estadoForma.estatus}</span>
            </h5>
          </div>
        )}
        {modalidad === "CREAR" ? (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proyecto</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_proyecto"
              value={estadoForma.id_proyecto}
              disabled={Boolean(idProyecto)}
            >
              {proyectosDB.map(({ id, id_alt }) => (
                <option key={id} value={id}>
                  {id_alt}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proyecto</label>
            <input
              className="form-control"
              type="text"
              value={estadoForma.proyecto}
              disabled
            />
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de gasto</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo_gasto"
            value={estadoForma.i_tipo_gasto}
            disabled={!modoEditar}
          >
            <option value="1">Reembolso</option>
            <option value="2">Programación</option>
            <option value="3">Asimilado a salarios</option>
            <option value="4">Honorarios profesionales</option>
            <option value="5">Gastos por comprobar</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Partida presupuestal</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_partida_presupuestal"
            value={estadoForma.id_partida_presupuestal}
            disabled={!modoEditar}
          >
            {dataProyecto.rubros_presupuestales.map(({ id_rubro, nombre }) => (
              <option key={id_rubro} value={id_rubro}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Titular</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="titular"
            value={estadoForma.titular}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">CLABE</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="clabe"
            value={estadoForma.clabe}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Banco</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_banco"
            value={estadoForma.id_banco}
            disabled={!modoEditar}
          >
            {bancos.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="email"
            value={estadoForma.email}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc"
            value={estadoForma.rfc}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Proveedor</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="proveedor"
            value={estadoForma.proveedor}
            disabled={!modoEditar}
            placeholder="emisor de la factura"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Descricpión del gasto</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="descripcion_gasto"
            value={estadoForma.descripcion_gasto}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Importe</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="f_importe"
            value={estadoForma.f_importe}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Monto a comprobar</label>
          <input
            className="form-control"
            type="text"
            name="f_monto_comprobar"
            value={montoComprobar()}
            disabled
          />
        </div>
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion comprobantes */}
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Comprobantes</h4>
        </div>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Agregar factura</label>
          <input
            className="form-control"
            type="file"
            onChange={agregarFactura}
            name="comprobante"
            accept=".xml"
            ref={fileInput}
            disabled={!Boolean(Number(estadoForma.f_importe)) || !modoEditar}
          />
        </div>
        <div className="col-12 mb-3 table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Folio fiscal</th>
                <th>Método de pago</th>
                <th>Forma de pago</th>
                <th>Régimen fiscal</th>
                <th>Subtotal</th>
                <th>Impuestos retenedios</th>
                <th>Total</th>
                <th>
                  <i className="bi bi-trash"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {estadoForma.comprobantes.map((comprobante) => {
                const {
                  id,
                  folio_fiscal,
                  metodo_pago,
                  forma_pago,
                  regimen_fiscal,
                  f_subtotal,
                  f_total,
                  f_retenciones,
                } = comprobante
                return (
                  <tr key={folio_fiscal}>
                    <td>{folio_fiscal}</td>
                    <td>{metodo_pago}</td>
                    <td>{forma_pago}</td>
                    <td>{regimen_fiscal}</td>
                    <td>{f_subtotal}</td>
                    <td>{f_retenciones}</td>
                    <td>{f_total}</td>
                    <td>
                      {!id && (
                        <button
                          type="button"
                          className="btn btn-dark btn-sm"
                          onClick={() => quitarFactura(folio_fiscal)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {modoEditar && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaSolicitudPresupuesto }
