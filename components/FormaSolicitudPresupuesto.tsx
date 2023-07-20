import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ColaboradorProyecto,
  DataProyecto,
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnAccion, BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import {
  ComprobanteSolicitud,
  NotaSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { useAuth } from "@contexts/auth.context"
import {
  meses,
  obtenerBadgeStatusSolicitud,
  obtenerEstatusSolicitud,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { Toast } from "./Toast"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "AGREGAR_FACTURA"
  | "QUITAR_FACTURA"
  | "CAMBIO_TIPO_GASTO"
  | "CAMBIO_TITULAR"
  | "CAMBIO_ESTATUS"
  | "CAMBIO_PROYECTO"
  | "NUEVO_REGISTRO"
  | "RECARGAR_NOTAS"

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
    case "NUEVO_REGISTRO":
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
    case "CAMBIO_PROYECTO":
      return {
        ...state,
        i_tipo_gasto: 0,
        id_partida_presupuestal: 0,
        titular_cuenta: "",
        descripcion_gasto: "",
      }
    case "CAMBIO_TIPO_GASTO":
      return {
        ...state,
        id_partida_presupuestal: payload.id_partida_presupuestal,
        titular_cuenta: "",
        descripcion_gasto: payload.descripcion_gasto,
      }
    case "CAMBIO_TITULAR":
      return {
        ...state,
        clabe: payload.clabe,
        id_banco: payload.id_banco,
        proveedor: payload.proveedor,
      }
    case "CAMBIO_ESTATUS":
      return {
        ...state,
        i_estatus: payload.i_estatus,
        estatus: payload.estatus,
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: payload,
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

interface DataTipoGasto {
  partidas_presupuestales: RubroMinistracion[]
  titulares: (ColaboradorProyecto | ProveedorProyecto)[]
}

const estadoInicialDataTipoGasto: DataTipoGasto = {
  partidas_presupuestales: [],
  titulares: [],
}

const estaInicialToast = {
  show: false,
  mensaje: "",
}

const Notas = ({ notas, dispatch }) => {
  const router = useRouter()
  const idSolicitud = Number(router.query.idS)
  const { user } = useAuth()
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const inputNota = useRef(null)

  const agregarNota = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(
      `/solicitudes-presupuesto/${idSolicitud}/notas`,
      {
        id_usuario: user.id,
        mensaje: mensajeNota,
      }
    )
    if (cr.error) {
      console.log(cr.data)
    } else {
      //limpiar el input
      setMensajeNota("")

      const re = await ApiCall.get(
        `/solicitudes-presupuesto/${idSolicitud}/notas`
      )
      if (re.error) {
        console.log(re.data)
      } else {
        const notasDB = re.data as NotaSolicitud[]
        dispatch({
          type: "RECARGAR_NOTAS",
          payload: notasDB,
        })
      }
    }
  }

  return (
    <div className="row my-3">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Notas</h3>
      </div>
      <div className="col-12 table-responsive mb-3">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Usuario</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {notas.map(({ id, usuario, mensaje, dt_registro }) => (
              <tr key={id}>
                <td>{usuario}</td>
                <td>{mensaje}</td>
                <td>{dt_registro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-12 col-md-9 mb-3">
        <input
          type="text"
          className="form-control"
          value={mensajeNota}
          onChange={({ target }) => setMensajeNota(target.value)}
          placeholder="mensaje de la nota"
          ref={inputNota}
        />
      </div>
      <div className="col-12 col-md-3 mb-3 text-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={agregarNota}
        >
          Agregar nota +
        </button>
      </div>
    </div>
  )
}

const FormaSolicitudPresupuesto = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idSolicitud = Number(router.query.idS)

  const estadoInicialForma: SolicitudPresupuesto = {
    id_proyecto: idProyecto || 0,
    proyecto: "",
    i_tipo_gasto: 0,
    tipo_gasto: "",
    titular_cuenta: "",
    clabe: "",
    id_banco: 1,
    email: "",
    proveedor: "",
    descripcion_gasto: "",
    id_partida_presupuestal: 0,
    rubro: "",
    f_importe: 0,
    i_estatus: 1,
    comprobantes: [],
    notas: [],
  }

  const { bancos, formas_pago, regimenes_fiscales } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [dataProyecto, setDataProyecto] = useState(estadoInicialDataProyecto)
  const [dataTipoGasto, setDataTipoGasto] = useState(estadoInicialDataTipoGasto)
  const [aceptarTerminos, setAceptarTerminos] = useState(Boolean(idSolicitud))
  const [toastState, setToastState] = useState(estaInicialToast)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idSolicitud)
  const modalidad = idSolicitud ? "EDITAR" : "CREAR"
  const estatusCarga = useRef(null)

  const fileInput = useRef(null)
  const cbAceptaTerminos = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarDataProyecto()

    if (modalidad === "CREAR") {
      dispatch({
        type: "CAMBIO_PROYECTO",
        payload: null,
      })
    }
  }, [estadoForma.id_proyecto])

  useEffect(() => {
    if (!estadoForma.i_tipo_gasto) return

    let partidas_presupuestales = []
    let titulares = []
    // let id_partida_presupuestal = 0
    const payload = {
      id_partida_presupuestal: 0,
      descripcion_gasto: "",
    }

    switch (Number(estadoForma.i_tipo_gasto)) {
      case 1:
      case 5:
        //muestra todos colaboradores
        titulares = dataProyecto.colaboradores.map((colaborador) => ({
          ...colaborador,
          nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
        }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != 2 //![1, 2].includes(rp.id_rubro)
        )
        break
      case 2:
        //muestra todos los proveedores
        titulares = dataProyecto.proveedores
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != 2
        )
        break
      case 3:
        //muestra solo colaboradores registrados como asimilados
        titulares = dataProyecto.colaboradores
          .filter((col) => col.i_tipo == 1)
          .map((colaborador) => ({
            ...colaborador,
            nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
          }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == 2
        )
        payload.id_partida_presupuestal = 2
        payload.descripcion_gasto = "Enero"
        break
      case 4:
        //muestra solo colaboradores registrados como asimilados
        titulares = dataProyecto.colaboradores
          .filter((col) => col.i_tipo == 2)
          .map((colaborador) => ({
            ...colaborador,
            nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
          }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == 3
        )
        payload.id_partida_presupuestal = 3
        payload.descripcion_gasto = "Enero"
        break
      default:
    }

    setDataTipoGasto({
      partidas_presupuestales,
      titulares,
    })

    if (modalidad === "CREAR") {
      dispatch({
        type: "CAMBIO_TIPO_GASTO",
        payload,
      })
    }
  }, [estadoForma.i_tipo_gasto])

  useEffect(() => {
    if (!estadoForma.titular_cuenta) {
      dispatch({
        type: "CAMBIO_TITULAR",
        payload: {
          clabe: "",
          id_banco: 1,
          proveedor: "",
        },
      })
      return
    }

    const matchTitular = dataTipoGasto.titulares.find(
      (titular_cuenta) => titular_cuenta.nombre == estadoForma.titular_cuenta
    )

    if (!matchTitular) {
      console.log(matchTitular)
      return
    }

    const payload = {
      clabe: matchTitular.clabe,
      id_banco: matchTitular.id_banco,
      proveedor: "",
    }

    switch (Number(estadoForma.i_tipo_gasto)) {
      case 2:
      case 3:
      case 4:
        payload.proveedor = matchTitular.nombre
        break
    }

    dispatch({
      type: "CAMBIO_TITULAR",
      payload,
    })
  }, [estadoForma.titular_cuenta])

  useEffect(() => {
    // si es un reembolso el importe debe conincidir con las comprobaciones
    if (estadoForma.i_tipo_gasto == 1) {
      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "f_importe",
          value: obtenerTotalComprobaciones().toFixed(2),
        },
      })
    }
  }, [estadoForma.comprobantes.length])

  useEffect(() => {
    //validar que se ejecute solo 1 vez antes de cargar la info de solicitud
    if (modalidad === "EDITAR" && !!dataProyecto.rubros_presupuestales.length) {
      obtener()
    }
  }, [dataProyecto])

  const cargarData = async () => {
    if (modalidad === "CREAR") {
      setIsLoading(true)

      try {
        const reProyectos = await obtenerProyectosDB()
        if (reProyectos.error) throw reProyectos.data

        const proyectosDB = reProyectos.data as ProyectoMin[]
        setProyectosDB(proyectosDB)

        if (!idProyecto) {
          dispatch({
            type: "HANDLE_CHANGE",
            payload: {
              name: "id_proyecto",
              value: proyectosDB[0]?.id || 0,
            },
          })
        }
      } catch (error) {
        console.log(error)
      }

      setIsLoading(false)
    }
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

  const obtener = async () => {
    const re = await obtenerSolicitudes(null, idSolicitud)
    if (re.error) {
      console.log(re.data)
    } else {
      const solicitud = re.data[0] as SolicitudPresupuesto
      dispatch({
        type: "CARGA_INICIAL",
        payload: solicitud,
      })

      // setEstatus(solicitud.i_estatus)
      // para que se mantenga el badge
      estatusCarga.current = solicitud.i_estatus
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
    // cuando rol coparte hace una modificacion y su estatus es rechazada o devolucion,
    // el status debe cambiar a revision nuevamente
    let payload = estadoForma

    if (user.id_rol == 3 && [3, 5].includes(estadoForma.i_estatus)) {
      payload = {
        ...payload,
        i_estatus: 1,
      }
    }
    return ApiCall.put(`/solicitudes-presupuesto/${idSolicitud}`, payload)
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

  const asignarIMetodoPago = (metodo_pago: "PUE" | "PPD") => {
    return metodo_pago == "PUE" ? 1 : 2
  }

  const asignarIdFormaPAgo = (clave: string) => {
    const metodoMatch = formas_pago.find((mp) => mp.clave == clave)

    return {
      id: metodoMatch?.id || 0,
      nombre: metodoMatch?.nombre || "",
    }
  }

  const obtenerRegimenXClave = (clave: string) => {
    const regimenMatch = regimenes_fiscales.find((rf) => rf.clave == clave)

    return {
      id: regimenMatch?.id || 0,
      nombre: regimenMatch?.nombre || "",
    }
  }

  const obtenerTotalComprobaciones = () => {
    const totalComprobaciones = estadoForma.comprobantes.reduce(
      (acum, actual) => acum + Number(actual.f_total),
      0
    )

    return totalComprobaciones
  }

  const agregarFactura = (ev) => {
    const [file] = ev.target.files

    const reader = new FileReader()

    reader.onload = async () => {
      const parser = new DOMParser()
      const xml = parser.parseFromString(
        reader.result as string,
        "application/xml"
      )

      // console.log(xml)

      const [comprobante] = xml.getElementsByTagName("cfdi:Comprobante")
      const [timbre] = xml.getElementsByTagName("tfd:TimbreFiscalDigital")
      const [emisor] = xml.getElementsByTagName("cfdi:Emisor")
      const impuestos = xml.getElementsByTagName("cfdi:Impuestos")

      //limpiar el input
      fileInput.current.value = ""

      const folio_fiscal = timbre?.getAttribute("UUID") || ""
      // buscar si el folio que se quiere subir ya existe en base de datos
      const reFactura = await ApiCall.get(
        `/solicitudes-presupuesto/buscar-factura?folio=${folio_fiscal}`
      )
      if (reFactura.error) {
        console.log(reFactura.data)
        return
      } else {
        if (reFactura.data) {
          setToastState({
            show: true,
            mensaje: reFactura.mensaje,
          })
          return
        }
      }

      let f_retenciones = ""

      //a veces impuestos es mas de un tag y hay que buscarlo
      for (const imp of impuestos) {
        const retenciones = imp.getAttribute("TotalImpuestosRetenidos")
        if (retenciones) {
          f_retenciones = retenciones
        }
      }

      const metodo_pago =
        (comprobante?.getAttribute("MetodoPago") as "PUE" | "PPD") || ""
      const clave_forma_pago = comprobante?.getAttribute("FormaPago") || ""
      const f_total = comprobante?.getAttribute("Total") || ""
      const clave_regimen_fiscal = emisor?.getAttribute("RegimenFiscal") || ""

      const formaPago = asignarIdFormaPAgo(clave_forma_pago)
      const regimenFiscal = obtenerRegimenXClave(clave_regimen_fiscal)

      if (!folio_fiscal || !metodo_pago || !f_total || !clave_regimen_fiscal) {
        console.log("no se identificaron los datos de la factura")
        return
      }

      //revisar que folio fiscal no se repita
      const matchFolioFiscal = estadoForma.comprobantes.find(
        (comprobante) => comprobante.folio_fiscal == folio_fiscal
      )
      if (matchFolioFiscal) {
        console.log("folio repetido")
        return
      }

      const dataComprobante: ComprobanteSolicitud = {
        folio_fiscal,
        id_regimen_fiscal: regimenFiscal.id,
        regimen_fiscal: regimenFiscal.nombre,
        clave_regimen_fiscal,
        i_metodo_pago: asignarIMetodoPago(metodo_pago),
        metodo_pago,
        id_forma_pago: formaPago.id,
        clave_forma_pago: clave_forma_pago || "",
        forma_pago: formaPago.nombre,
        f_total,
        f_retenciones: f_retenciones || "",
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

  const pasaValidaciones = () => {
    let NoError = true

    if (modalidad === "CREAR" && !aceptarTerminos) {
      NoError = false
      cbAceptaTerminos.current.focus()
    }

    return NoError
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    if (!pasaValidaciones()) return

    // console.log(estadoForma)
    setIsLoading(true)

    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push(`/solicitudes-presupuesto`)
      } else {
        // estatusCarga.current = estadoForma.i_estatus
        await obtener()
        setModoEditar(false)
      }
    }

    setIsLoading(false)
  }

  // const inputFileReembolso =
  //   [1, 4].includes(Number(estadoForma.i_tipo_gasto)) &&
  //   estadoForma.comprobantes.length > 0

  const disableInputImporte =
    !modoEditar ||
    estadoForma.i_tipo_gasto == 1 ||
    user.id_rol != 3 ||
    [2, 4].includes(estadoForma.i_estatus)

  const esGastoAsimilados = estadoForma.i_tipo_gasto == 3
  const noTipoGasto = !estadoForma.i_tipo_gasto
  const disableInputFile =
    !modoEditar || (esGastoAsimilados && user.id_rol == 3) || noTipoGasto

  const disableInputProveedor =
    !modoEditar ||
    estadoForma.i_tipo_gasto != 1 ||
    user.id_rol != 3 ||
    estadoForma.i_estatus != 1

  const disableSelectPartidaPresupuestal = [3, 4].includes(
    Number(estadoForma.i_tipo_gasto)
  )

  const disableInputXEstatus =
    !modoEditar || user.id_rol != 3 || estadoForma.i_estatus != 1

  const showTipoGastoAsimilados =
    dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 2) &&
    !!dataProyecto.colaboradores.filter((col) => col.i_tipo == 1).length

  const showTipoGastoHonorarios =
    dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 3) &&
    !!dataProyecto.colaboradores.filter((col) => col.i_tipo == 2).length

  const showBtnEditar =
    !modoEditar &&
    idSolicitud &&
    (user.id === estadoForma.id_responsable || [1, 2].includes(user.id_rol))

  if (isLoading) {
    return <Loader />
  }

  return (
    <>
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
            {showBtnEditar && <BtnEditar onClick={() => setModoEditar(true)} />}
          </div>
        </div>
        <FormaContenedor onSubmit={handleSubmit}>
          {modalidad === "EDITAR" && estatusCarga.current && (
            <div className="col-12 mb-3">
              <h5>
                <span
                  className={`badge bg-${obtenerBadgeStatusSolicitud(
                    estatusCarga.current
                  )}`}
                >
                  {obtenerEstatusSolicitud(estatusCarga.current)}
                </span>
              </h5>
            </div>
          )}
          {modalidad === "CREAR" ? (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Proyecto</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="id_proyecto"
                  value={estadoForma.id_proyecto}
                  disabled={Boolean(idProyecto)}
                >
                  {proyectosDB.length > 0 ? (
                    proyectosDB.map(({ id, id_alt, nombre }) => (
                      <option key={id} value={id}>
                        {nombre} - {id_alt}
                      </option>
                    ))
                  ) : (
                    <option value="0">No hay proyectos</option>
                  )}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="i_tipo_gasto"
                  value={estadoForma.i_tipo_gasto}
                >
                  <option value="0" disabled>
                    Selecciona una opción
                  </option>
                  {dataProyecto.colaboradores.length > 0 && (
                    <option value="1">Reembolso</option>
                  )}
                  {dataProyecto.proveedores.length > 0 && (
                    <option value="2">Pago a proveedor</option>
                  )}
                  {showTipoGastoAsimilados && (
                    <option value="3">Asimilados a salarios</option>
                  )}
                  {showTipoGastoHonorarios && (
                    <option value="4">
                      Honorarios profesionales (colaboradores)
                    </option>
                  )}
                  {dataProyecto.colaboradores.length > 0 && (
                    <option value="5">Gastos por comprobar</option>
                  )}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="id_partida_presupuestal"
                  value={estadoForma.id_partida_presupuestal}
                  disabled={disableSelectPartidaPresupuestal}
                >
                  <option value="0" disabled>
                    Selecciona una opción
                  </option>
                  {dataTipoGasto.partidas_presupuestales.map(
                    ({ id_rubro, nombre }) => (
                      <option key={id_rubro} value={id_rubro}>
                        {nombre}
                      </option>
                    )
                  )}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Proyecto</label>
                <input
                  className="form-control"
                  value={estadoForma.proyecto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <input
                  className="form-control"
                  value={estadoForma.tipo_gasto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <input
                  className="form-control"
                  value={estadoForma.rubro}
                  disabled
                />
              </div>
            </>
          )}
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Titular cuenta</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="titular_cuenta"
              value={estadoForma.titular_cuenta}
              disabled={disableInputXEstatus}
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {dataTipoGasto.titulares.map((titular_cuenta) => (
                <option key={titular_cuenta.id} value={titular_cuenta.nombre}>
                  {titular_cuenta.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">CLABE</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="clabe"
              value={estadoForma.clabe}
              disabled
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Banco</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_banco"
              value={estadoForma.id_banco}
              disabled
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
              disabled={disableInputXEstatus}
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
              disabled={disableInputProveedor}
              placeholder="emisor de la factura"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Descricpión del gasto</label>
            {[3, 4].includes(Number(estadoForma.i_tipo_gasto)) ? (
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="descripcion_gasto"
                value={estadoForma.descripcion_gasto}
                disabled={disableInputXEstatus}
              >
                {meses.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="descripcion_gasto"
                value={estadoForma.descripcion_gasto}
                disabled={disableInputXEstatus}
              />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Importe</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="f_importe"
              value={estadoForma.f_importe}
              disabled={disableInputImporte}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Monto a comprobar</label>
            <input
              className="form-control"
              type="text"
              value={(
                Number(estadoForma.f_importe) - obtenerTotalComprobaciones()
              ).toFixed(2)}
              disabled
            />
          </div>
          {user.id_rol != 3 && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Estatus</label>
              <select
                className="form-control"
                name="i_estatus"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                value={estadoForma.i_estatus}
                disabled={!modoEditar}
              >
                <option value="1">En revisión</option>
                <option value="2">Autorizada</option>
                <option value="3">Rechazada</option>
                <option value="4">Procesada</option>
                <option value="5">Devolución</option>
              </select>
            </div>
          )}
          {modalidad === "CREAR" && (
            <div className="col-12 mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={() => setAceptarTerminos(!aceptarTerminos)}
                  ref={cbAceptaTerminos}
                  checked={aceptarTerminos}
                />
                <label className="form-check-label">
                  Acepto los términos y condiciones
                </label>
              </div>
            </div>
          )}
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
              disabled={disableInputFile}
            />
          </div>
          <div className="col-12 mb-3 table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Folio fiscal</th>
                  <th>Régimen fiscal</th>
                  <th>Método de pago</th>
                  <th>Forma de pago</th>
                  <th>Impuestos retenedios</th>
                  <th>Total</th>
                  {modoEditar && (
                    <th>
                      <i className="bi bi-trash"></i>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {estadoForma.comprobantes.map((comprobante) => {
                  const {
                    id,
                    clave_regimen_fiscal,
                    regimen_fiscal,
                    folio_fiscal,
                    metodo_pago,
                    clave_forma_pago,
                    forma_pago,
                    f_retenciones,
                    f_total,
                  } = comprobante
                  return (
                    <tr key={folio_fiscal}>
                      <td>{folio_fiscal}</td>
                      <td>
                        {clave_regimen_fiscal} - {regimen_fiscal}
                      </td>
                      <td>{metodo_pago}</td>
                      <td>
                        {clave_forma_pago} - {forma_pago}
                      </td>
                      <td>{f_retenciones}</td>
                      <td>{f_total}</td>
                      {modoEditar && (
                        <td>
                          <BtnAccion
                            margin={false}
                            icono="bi-x-circle"
                            onclick={() => quitarFactura(folio_fiscal)}
                            title="eliminar factura"
                          />
                        </td>
                      )}
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
          {modalidad === "EDITAR" && (
            <Notas notas={estadoForma.notas} dispatch={dispatch} />
          )}
        </FormaContenedor>
      </RegistroContenedor>
      <Toast
        estado={toastState}
        cerrar={() =>
          setToastState((prevState) => ({ ...prevState, show: false }))
        }
      />
    </>
  )
}

export { FormaSolicitudPresupuesto }
