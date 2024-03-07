import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  DataProyecto,
  ProyectoMin,
  QueriesProyecto,
  RubroMinistracionMin,
  TitularProyecto,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnAccion, BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import {
  ComprobanteSolicitud,
  NotaSolicitud,
  SolicitudPresupuesto,
  TipoGastoSolicitud,
} from "@models/solicitud-presupuesto.model"
import {
  epochAFecha,
  epochAInputDate,
  meses,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerEstatusSolicitud,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { Toast } from "./Toast"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import Link from "next/link"
import { useSesion } from "@hooks/useSesion"
import {
  Banner,
  EstadoInicialBannerProps,
  estadoInicialBanner,
  mensajesBanner,
} from "./Banner"
import {
  estatusSolicitud,
  rolesUsuario,
  rubrosPresupuestales,
  tiposColaborador,
  tiposGasto,
  tiposProveedor,
} from "@assets/utils/constantes"

type ActionTypes =
  | "LOADING_ON"
  | "ERROR_API"
  | "CARGAR_PROYECTOS"
  | "NO_PROYECTOS"
  | "CARGA_INICIAL"
  | "RECARGAR"
  | "HANDLE_CHANGE"
  | "AGREGAR_FACTURA"
  | "QUITAR_FACTURA"
  | "FACTURA_INVALIDA"
  | "CAMBIO_TIPO_GASTO"
  | "CAMBIO_PARTIDA_PRESUPUESTAL"
  | "CAMBIO_TITULAR"
  | "CAMBIO_ESTATUS"
  | "CAMBIO_PROYECTO"
  | "RECARGAR_NOTAS"
  | "CERRAR_TOAST"
  | "ACEPTAR_TERMINOS"
  | "MODO_EDITAR_ON"
  | "MODO_EDITAR_OFF"

interface ActionProps {
  type: ActionTypes
  payload?: any
}

interface EstadoProps {
  cargaInicial: SolicitudPresupuesto
  forma: SolicitudPresupuesto
  proyectosDB: ProyectoMin[]
  dataProyecto: DataProyecto
  aceptarTerminos: boolean
  toast: {
    show: boolean
    mensaje: string
  }
  isLoading: boolean
  banner: EstadoInicialBannerProps
  modoEditar: boolean
}

const estadoInicialFormaExterior: SolicitudPresupuesto = {
  id_proyecto: 0,
  i_tipo_gasto: 0,
  id_titular_cuenta: 0,
  titular_cuenta: "",
  clabe: "",
  id_banco: 0,
  banco: "",
  email: "",
  proveedor: "",
  descripcion_gasto: "",
  id_partida_presupuestal: 0,
  f_importe: 0,
  f_retenciones: 0,
  i_estatus: 1,
  comprobantes: [],
  notas: [],
}

const reducer = (state: EstadoProps, action: ActionProps): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
      }
    case "ERROR_API":
      return {
        ...state,
        banner: {
          show: true,
          mensaje: payload,
          tipo: "error",
        },
        isLoading: false,
      }
    case "CARGAR_PROYECTOS":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_proyecto: payload.proyectos[0].id,
        },
        proyectosDB: payload.proyectos,
        dataProyecto: payload.dataProyecto,
        isLoading: false,
      }
    case "NO_PROYECTOS":
      return {
        ...state,
        banner: {
          show: true,
          mensaje: mensajesBanner.sinProyectos,
          tipo: "warning",
        },
        isLoading: false,
      }
    case "CARGA_INICIAL":
      return {
        ...state,
        forma: payload.solicitudDB,
        cargaInicial: payload.solicitudDB,
        dataProyecto: payload.dataProyecto,
        isLoading: false,
      }
    case "RECARGAR":
      return {
        ...state,
        forma: payload,
        cargaInicial: payload,
        isLoading: false,
        modoEditar: false,
      }
    case "HANDLE_CHANGE":
      return {
        ...state,
        forma: {
          ...state.forma,
          [payload.name]: payload.value,
        },
      }
    case "AGREGAR_FACTURA":
      return {
        ...state,
        forma: {
          ...state.forma,
          comprobantes: [...state.forma.comprobantes, payload],
        },
      }
    case "QUITAR_FACTURA":
      const comprobantesFiltrados = state.forma.comprobantes.filter(
        (comp) => comp.folio_fiscal !== payload
      )

      return {
        ...state,
        forma: {
          ...state.forma,
          comprobantes: comprobantesFiltrados,
        },
      }
    case "FACTURA_INVALIDA":
      return {
        ...state,
        toast: {
          show: true,
          mensaje: payload,
        },
      }
    case "CAMBIO_PROYECTO":
      return {
        ...state,
        forma: {
          ...estadoInicialFormaExterior,
          id_proyecto: payload.idProyecto,
        },
        dataProyecto: payload.dataProyecto,
      }
    case "CAMBIO_TIPO_GASTO":
      const i_tipo_gasto = Number(payload.value) as TipoGastoSolicitud
      let descripcion_gasto = ""
      let id_partida_presupuestal = 0

      switch (i_tipo_gasto) {
        case tiposGasto.ASIMILADOS:
          descripcion_gasto = "Enero"
          id_partida_presupuestal = rubrosPresupuestales.ASIMILADOS
          break
        case tiposGasto.HONORARIOS:
          descripcion_gasto = "Enero"
          id_partida_presupuestal = rubrosPresupuestales.HONORARIOS
          break
        default:
          descripcion_gasto = ""
          id_partida_presupuestal = 0
      }

      return {
        ...state,
        forma: {
          ...estadoInicialFormaExterior,
          id_proyecto: state.forma.id_proyecto,
          i_tipo_gasto,
          id_partida_presupuestal,
          descripcion_gasto,
        },
      }
    case "CAMBIO_PARTIDA_PRESUPUESTAL":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_partida_presupuestal: Number(payload.value),
          id_titular_cuenta: 0,
          clabe: "",
          id_banco: 0,
          banco: "",
          proveedor: "",
          comprobantes: [],
        },
      }
    case "CAMBIO_TITULAR":
      const idTitular = Number(payload.value)
      const iTipoGasto = state.forma.i_tipo_gasto
      const tipoTitular =
        iTipoGasto == tiposGasto.PAGO_A_PROVEEDOR
          ? "proveedores"
          : "colaboradores"
      const match = state.dataProyecto[tipoTitular].find(
        (tit) => tit.id == idTitular
      )

      let proveedor = ""
      const { PAGO_A_PROVEEDOR, ASIMILADOS, HONORARIOS } = tiposGasto
      if ([PAGO_A_PROVEEDOR, ASIMILADOS, HONORARIOS].includes(iTipoGasto)) {
        proveedor = match.nombre
      }

      return {
        ...state,
        forma: {
          ...state.forma,
          id_titular_cuenta: match.id,
          titular_cuenta: match.nombre,
          clabe: match.clabe || match.account_number,
          id_banco: match.id_banco,
          banco: match.banco || match.bank,
          proveedor,
        },
      }
    case "CAMBIO_ESTATUS":
      return {
        ...state,
        forma: {
          ...state.forma,
          i_estatus: payload.i_estatus,
          estatus: payload.estatus,
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        forma: {
          ...state.forma,
          notas: payload,
        },
      }
    case "CERRAR_TOAST":
      return {
        ...state,
        toast: {
          ...state.toast,
          show: false,
        },
      }
    case "ACEPTAR_TERMINOS":
      return {
        ...state,
        aceptarTerminos: !state.aceptarTerminos,
      }
    case "MODO_EDITAR_ON":
      return {
        ...state,
        modoEditar: true,
      }
    case "MODO_EDITAR_OFF":
      return {
        ...state,
        forma: { ...state.cargaInicial },
        modoEditar: false,
      }
    default:
      return state
  }
}

const FormaSolicitudPresupuesto = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idSolicitud = Number(router.query.idS)
  const modalidad = idSolicitud ? "EDITAR" : "CREAR"

  const estadoInicialForma: SolicitudPresupuesto = {
    ...estadoInicialFormaExterior,
    id_proyecto: idProyecto || 0,
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    proyectosDB: [],
    dataProyecto: {
      colaboradores: [],
      proveedores: [],
      rubros_presupuestales: [],
    },
    aceptarTerminos: modalidad === "EDITAR",
    toast: {
      show: false,
      mensaje: "",
    },
    isLoading: true,
    banner: estadoInicialBanner,
    modoEditar: modalidad === "CREAR",
  }

  const { formas_pago, regimenes_fiscales, bancos } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const fileInput = useRef(null)
  const cbAceptaTerminos = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    // si es un reembolso el importe debe conincidir con las comprobaciones
    if (estado.forma.i_tipo_gasto == tiposGasto.REEMBOLSO) {
      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "f_importe",
          value: obtenerTotalComprobaciones().toFixed(2),
        },
      })
    }
  }, [estado.forma.comprobantes.length])

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const obtenerDataProyecto = (id: number) =>
    ApiCall.get(`/proyectos/${id}/data`)

  const cargarData = async () => {
    try {
      if (modalidad === "CREAR") {
        const reProyectos = await obtenerProyectosDB()
        if (reProyectos.error) throw reProyectos

        const proyectosDB = reProyectos.data as ProyectoMin[]
        if (!proyectosDB.length) {
          dispatch({
            type: "NO_PROYECTOS",
          })
        } else {
          //obtener data del primer proyecto y setearlo como default
          const reDataProyecto = await obtenerDataProyecto(proyectosDB[0].id)
          if (reDataProyecto.error) throw reDataProyecto
          const dataProyecto = reDataProyecto.data as DataProyecto

          dispatch({
            type: "CARGAR_PROYECTOS",
            payload: {
              proyectos: proyectosDB,
              dataProyecto,
            },
          })
        }
      } else {
        const solicitudDB = await obtener()
        const reDataProyecto = await obtenerDataProyecto(
          solicitudDB.id_proyecto
        )
        if (reDataProyecto.error) throw reDataProyecto
        const dataProyecto = reDataProyecto.data as DataProyecto
        dispatch({
          type: "CARGA_INICIAL",
          payload: {
            solicitudDB,
            dataProyecto,
          },
        })
      }
    } catch ({ data, mensaje }) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const handleChangeProyecto = async (ev: ChangeEvent) => {
    const idProyecto = Number(ev.target.value)
    const { error, data, mensaje } = await obtenerDataProyecto(idProyecto)
    if (error) {
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      const dataProyecto = data as DataProyecto

      dispatch({
        type: "CAMBIO_PROYECTO",
        payload: {
          idProyecto,
          dataProyecto,
        },
      })
    }
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    if (error.campo === name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const obtener = async (): Promise<SolicitudPresupuesto> => {
    const reSolicitud = await obtenerSolicitudes({
      id: idSolicitud,
    })
    if (reSolicitud.error) throw reSolicitud
    const solicitudDB = reSolicitud.data[0] as SolicitudPresupuesto
    return {
      ...solicitudDB,
      dt_pago: solicitudDB.dt_pago ? epochAInputDate(solicitudDB.dt_pago) : "",
    }
  }

  const registrar = () => {
    return ApiCall.post("/solicitudes-presupuesto", estado.forma)
  }

  const editar = () => {
    return ApiCall.put(`/solicitudes-presupuesto/${idSolicitud}`, estado.forma)
  }

  const cancelar = () => {
    modalidad === "EDITAR"
      ? dispatch({ type: "MODO_EDITAR_OFF" })
      : router.push("/solicitudes-presupuesto")
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

  const obtenerRegimenXId = (id: number) => {
    const regimenMatch = regimenes_fiscales.find((rf) => rf.id == id)

    return {
      clave: regimenMatch?.clave || "",
      nombre: regimenMatch?.nombre || "",
    }
  }

  const obtenerTotalComprobaciones = () => {
    const totalComprobaciones = estado.forma.comprobantes.reduce(
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

      //limpiar el input
      fileInput.current.value = ""

      const [comprobante] = xml.getElementsByTagName("cfdi:Comprobante")
      const [timbre] = xml.getElementsByTagName("tfd:TimbreFiscalDigital")
      const [emisor] = xml.getElementsByTagName("cfdi:Emisor")
      const [receptor] = xml.getElementsByTagName("cfdi:Receptor")
      const impuestos = xml.getElementsByTagName("cfdi:Impuestos")
      const [concepto] = xml.getElementsByTagName("cfdi:Concepto")

      const folio_fiscal = timbre?.getAttribute("UUID")
      const claveRegimenFiscalReceptor = receptor.getAttribute(
        "RegimenFiscalReceptor"
      )
      const usoCFDI = receptor.getAttribute("UsoCFDI")
      const f_total = comprobante?.getAttribute("Total")
      const f_claveProdServ = concepto?.getAttribute("ClaveProdServ")
      const clavesProdServCombustibles = ["15101514", "15101515", "15101505"]
      const metodo_pago = comprobante?.getAttribute("MetodoPago") as
        | "PUE"
        | "PPD"
      const clave_forma_pago = comprobante?.getAttribute("FormaPago")
      const formaPago = asignarIdFormaPAgo(clave_forma_pago)
      const claveRegimenFiscalEmisor = emisor?.getAttribute("RegimenFiscal")
      const rfcEmisor = emisor?.getAttribute("Rfc")
      const regimenFiscalEmisor = obtenerRegimenXClave(claveRegimenFiscalEmisor)
      const regimenFiscalReceptor = obtenerRegimenXClave(
        claveRegimenFiscalReceptor
      )

      // buscar si el folio que se quiere subir ya existe en base de datos
      const reFactura = await ApiCall.get(
        `/solicitudes-presupuesto/buscar-factura?folio=${folio_fiscal}`
      )
      if (reFactura.error) {
        console.log(reFactura.data)
        return
      } else {
        if (reFactura.data) {
          dispatch({
            type: "FACTURA_INVALIDA",
            payload: reFactura.mensaje,
          })
          return
        }
      }

      try {
        if (!f_total) throw "Total de factura no identificado"
        if (!clave_forma_pago) throw "Forma de pago no identificado"
        if (!claveRegimenFiscalEmisor || !regimenFiscalEmisor.id)
          throw "Regimen fiscal de emisor no identificado"
        if (!folio_fiscal) throw "Folio fiscal no encontrado"
        if (!metodo_pago) throw "Método de pago no identificado"
        if (claveRegimenFiscalReceptor !== "603" || !regimenFiscalReceptor.id)
          throw "Regimen fiscal de receptor inválido"
        if (usoCFDI !== "G03") throw "Uso CFDI inválido"
        if (clave_forma_pago === "01" && Number(f_total) >= 2000)
          throw "Pago en efectivo mayor o igual a 2000 no permitido"
        if (
          clavesProdServCombustibles.includes(f_claveProdServ) &&
          clave_forma_pago === "01"
        )
          throw "Combustibles con pago en efectivo no permitido"

        //revisar que folio fiscal no se repita
        const matchFolioFiscal = estado.forma.comprobantes.find(
          (comprobante) => comprobante.folio_fiscal == folio_fiscal
        )
        if (matchFolioFiscal) throw "factura repetida"
      } catch (error) {
        dispatch({
          type: "FACTURA_INVALIDA",
          payload: error,
        })
        return
      }

      let f_retenciones = ""
      let f_iva = ""
      let f_isr = ""

      //a veces impuestos es mas de un tag y hay que buscarlo
      for (const imp of impuestos) {
        const impuestos = imp.getAttribute("TotalImpuestosRetenidos")
        if (impuestos) {
          // dividir en IVA e ISR
          const retenciones = imp.getElementsByTagName("cfdi:Retencion")

          for (const ret of retenciones) {
            const tipoImpuesto = ret.getAttribute("Impuesto")
            const importe = ret.getAttribute("Importe")

            if (tipoImpuesto === "001") {
              f_isr = importe
            } else if (tipoImpuesto === "002") {
              f_iva = importe
            }
          }

          f_retenciones = impuestos
        }
      }

      // si hay rteenciones pero iva o isr no se calcularon correctamente
      // if (f_retenciones && (!f_iva || !f_isr)) {
      //   console.log({ f_retenciones, f_iva, f_isr })
      //   dispatch({
      //     type: "FACTURA_INVALIDA",
      //     payload: "Los impuestos no se han calculado correctamente",
      //   })
      //   return
      // }

      const dataComprobante: ComprobanteSolicitud = {
        folio_fiscal,
        rfc_emisor: rfcEmisor,
        id_regimen_fiscal_emisor: regimenFiscalEmisor.id,
        id_regimen_fiscal_receptor: regimenFiscalReceptor.id,
        i_metodo_pago: asignarIMetodoPago(metodo_pago),
        metodo_pago,
        id_forma_pago: formaPago.id,
        clave_forma_pago: clave_forma_pago,
        forma_pago: formaPago.nombre,
        f_total,
        f_retenciones: f_retenciones || "",
        f_iva,
        f_isr,
        uso_cfdi: usoCFDI,
      }

      console.log(dataComprobante)

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

  const aceptaTerminos = () => {
    let NoError = true

    if (modalidad === "CREAR" && !estado.aceptarTerminos) {
      NoError = false
      cbAceptaTerminos.current.focus()
    }

    return NoError
  }

  const validarForma = () => {
    const campos = {
      id_proyecto: estado.forma.id_proyecto,
      i_tipo_gasto: estado.forma.i_tipo_gasto,
      id_partida_presupuestal: estado.forma.id_partida_presupuestal,
      id_titular_cuenta: estado.forma.id_titular_cuenta,
      clabe_account: estado.forma.clabe,
      banco: estado.forma.banco,
      email: estado.forma.email,
      proveedor: estado.forma.proveedor,
      descripcion_gasto: estado.forma.descripcion_gasto,
      f_importe: estado.forma.f_importe,
      f_retenciones: estado.forma.f_retenciones,
      f_retenciones_extranjeros: estado.forma.f_retenciones,
    }

    if (estado.forma.i_tipo_gasto == tiposGasto.GASTOS_X_COMPROBAR) {
      delete campos.proveedor
    }

    if (
      [tiposGasto.ASIMILADOS, tiposGasto.HONORARIOS].includes(
        Number(estado.forma.i_tipo_gasto)
      )
    ) {
      delete campos.descripcion_gasto
    }

    if (
      user.id_rol == rolesUsuario.COPARTE ||
      estado.forma.i_tipo_gasto != tiposGasto.ASIMILADOS ||
      [
        estatusSolicitud.REVISION,
        estatusSolicitud.RECHAZADA,
        estatusSolicitud.DEVOLUCION,
      ].includes(Number(estado.forma.i_estatus))
    ) {
      delete campos.f_retenciones
    }

    if (
      user.id_rol == rolesUsuario.COPARTE ||
      estado.forma.id_partida_presupuestal !=
        rubrosPresupuestales.PAGOS_EXTRANJERO
    ) {
      delete campos.f_retenciones_extranjeros
    }

    return validarCampos(campos)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    if (!aceptaTerminos()) return
    console.log(estado.forma)

    dispatch({ type: "LOADING_ON" })

    try {
      const upSolicitud =
        modalidad === "EDITAR" ? await editar() : await registrar()
      if (upSolicitud.error) throw upSolicitud

      if (modalidad === "CREAR") {
        router.push(`/solicitudes-presupuesto`)
      } else {
        const solicitudDB = await obtener()
        dispatch({
          type: "RECARGAR",
          payload: solicitudDB,
        })
      }
    } catch ({ error, mensaje, data }) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const disableInputImporte =
    !estado.modoEditar ||
    estado.forma.i_tipo_gasto == tiposGasto.REEMBOLSO ||
    user.id_rol != rolesUsuario.COPARTE ||
    [estatusSolicitud.AUTORIZADA, estatusSolicitud.PROCESADA].includes(
      estado.forma.i_estatus
    )

  const esGastoAsimilados = estado.forma.i_tipo_gasto == tiposGasto.ASIMILADOS
  const noTipoGasto = !estado.forma.i_tipo_gasto
  const disableInputFile =
    !estado.modoEditar ||
    (esGastoAsimilados && user.id_rol == rolesUsuario.COPARTE) ||
    noTipoGasto

  const disableInputProveedor =
    !estado.modoEditar ||
    estado.forma.i_tipo_gasto != tiposGasto.REEMBOLSO ||
    user.id_rol != rolesUsuario.COPARTE ||
    estado.forma.i_estatus != estatusSolicitud.REVISION

  const disableSelectPartidaPresupuestal = [
    tiposGasto.ASIMILADOS,
    tiposGasto.HONORARIOS,
  ].includes(estado.forma.i_tipo_gasto)

  const disableInputXEstatus =
    !estado.modoEditar ||
    user.id_rol != rolesUsuario.COPARTE ||
    estado.forma.i_estatus != estatusSolicitud.REVISION

  const showBtnEditar =
    !estado.modoEditar &&
    idSolicitud &&
    (user.id == estado.forma.id_responsable ||
      [rolesUsuario.SUPER_USUARIO, rolesUsuario.ADMINISTRADOR].includes(
        user.id_rol
      ))

  const showRetenciones =
    user.id_rol != rolesUsuario.COPARTE &&
    (estado.forma.i_tipo_gasto == tiposGasto.ASIMILADOS ||
      estado.forma.id_partida_presupuestal ==
        rubrosPresupuestales.PAGOS_EXTRANJERO)

  const total_comprobantes = estado.forma.comprobantes.reduce(
    (acum, { f_total }) => acum + Number(f_total),
    0
  )

  const showComprobantesNecesarios =
    estado.forma.i_tipo_gasto != tiposGasto.ASIMILADOS &&
    estado.forma.id_partida_presupuestal !=
      rubrosPresupuestales.PAGOS_EXTRANJERO

  const showInputDtPago =
    user.id_rol == rolesUsuario.SUPER_USUARIO &&
    estado.forma.i_estatus == estatusSolicitud.PROCESADA

  if (estado.isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (estado.banner.show) {
    return (
      <Contenedor>
        <Banner tipo={estado.banner.tipo} mensaje={estado.banner.mensaje} />
      </Contenedor>
    )
  }

  const OptionsTipoGasto = () => {
    const showReembolso = !!estado.dataProyecto.colaboradores.length

    const showPagoProveedor = !!estado.dataProyecto.proveedores.length

    const showTipoGastoAsimilados =
      estado.dataProyecto.rubros_presupuestales.some(
        (rp) => rp.id_rubro == rubrosPresupuestales.ASIMILADOS
      ) &&
      estado.dataProyecto.colaboradores.some(
        ({ i_tipo }) => i_tipo == tiposColaborador.ASIMILADOS
      )

    const showTipoGastoHonorarios =
      estado.dataProyecto.rubros_presupuestales.some(
        (rp) => rp.id_rubro == rubrosPresupuestales.HONORARIOS
      ) &&
      estado.dataProyecto.colaboradores.some(
        ({ i_tipo }) => i_tipo == tiposColaborador.HONORARIOS
      )

    const showGastosXcomprobar = !!estado.dataProyecto.colaboradores.length

    return (
      <>
        <option value="0" disabled>
          Selecciona una opción
        </option>
        {showReembolso && <option value="1">Reembolso</option>}
        {showPagoProveedor && <option value="2">Pago a proveedor</option>}
        {showTipoGastoAsimilados && (
          <option value="3">Asimilados a salarios</option>
        )}
        {showTipoGastoHonorarios && (
          <option value="4">Honorarios profesionales (colaboradores)</option>
        )}
        {showGastosXcomprobar && (
          <option value="5">Gastos por comprobar</option>
        )}
      </>
    )
  }

  const OptionsPartidaPresupuestal = () => {
    let partidas: RubroMinistracionMin[] = []

    switch (Number(estado.forma.i_tipo_gasto)) {
      case tiposGasto.REEMBOLSO:
      case tiposGasto.GASTOS_X_COMPROBAR:
        partidas = estado.dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != rubrosPresupuestales.PAGOS_EXTRANJERO
        )
        break
      case tiposGasto.PAGO_A_PROVEEDOR:
        partidas = estado.dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != rubrosPresupuestales.ASIMILADOS
        )
        break
      case tiposGasto.ASIMILADOS:
        partidas = estado.dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == rubrosPresupuestales.ASIMILADOS
        )
        break
      case tiposGasto.HONORARIOS:
        partidas = estado.dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == rubrosPresupuestales.HONORARIOS
        )
        break
    }

    return (
      <>
        <option value="0" disabled>
          Selecciona una opción
        </option>
        {partidas.map(({ id_rubro, rubro }) => (
          <option key={id_rubro} value={id_rubro}>
            {rubro}
          </option>
        ))}
      </>
    )
  }

  const OptionsTitularCuenta = () => {
    let titualres: TitularProyecto[] = []

    switch (Number(estado.forma.i_tipo_gasto)) {
      case tiposGasto.REEMBOLSO:
      case tiposGasto.GASTOS_X_COMPROBAR:
        titualres = estado.dataProyecto.colaboradores
        break
      case tiposGasto.PAGO_A_PROVEEDOR:
        titualres = estado.dataProyecto.proveedores.filter(({ i_tipo }) =>
          estado.forma.id_partida_presupuestal ==
          rubrosPresupuestales.PAGOS_EXTRANJERO
            ? i_tipo == tiposProveedor.EXTRANJERO
            : i_tipo != tiposProveedor.EXTRANJERO
        )
        break
      case tiposGasto.ASIMILADOS:
        titualres = estado.dataProyecto.colaboradores.filter(
          ({ i_tipo }) => i_tipo == tiposColaborador.ASIMILADOS
        )
        break
      case tiposGasto.HONORARIOS:
        titualres = estado.dataProyecto.colaboradores.filter(
          ({ i_tipo }) => i_tipo == tiposColaborador.HONORARIOS
        )
        break
    }

    return (
      <>
        <option value="0" disabled>
          Selecciona una opción
        </option>
        {titualres.map(({ id, nombre, clabe }) => (
          <option key={`${id}_${clabe}`} value={id}>
            {nombre}
          </option>
        ))}
      </>
    )
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
            {showBtnEditar && (
              <BtnEditar onClick={() => dispatch({ type: "MODO_EDITAR_ON" })} />
            )}
          </div>
        </div>
        <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
          {modalidad === "EDITAR" && (
            <div className="col-12 mb-3">
              <h5>
                <span
                  className={`badge bg-${obtenerBadgeStatusSolicitud(
                    estado.cargaInicial.i_estatus
                  )}`}
                >
                  {obtenerEstatusSolicitud(estado.cargaInicial.i_estatus)}
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
                  onChange={handleChangeProyecto}
                  value={estado.forma.id_proyecto}
                  disabled={Boolean(idProyecto)}
                >
                  {estado.proyectosDB.length > 0 ? (
                    estado.proyectosDB.map(({ id, id_alt, nombre }) => (
                      <option key={id} value={id}>
                        {nombre} - {id_alt}
                      </option>
                    ))
                  ) : (
                    <option value="0">No hay proyectos</option>
                  )}
                </select>
                {error.campo == "id_proyecto" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <select
                  className="form-control"
                  name="i_tipo_gasto"
                  onChange={(e) => handleChange(e, "CAMBIO_TIPO_GASTO")}
                  value={estado.forma.i_tipo_gasto}
                >
                  <OptionsTipoGasto />
                </select>
                {error.campo == "i_tipo_gasto" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <select
                  className="form-control"
                  name="id_partida_presupuestal"
                  onChange={(e) =>
                    handleChange(e, "CAMBIO_PARTIDA_PRESUPUESTAL")
                  }
                  value={estado.forma.id_partida_presupuestal}
                  disabled={disableSelectPartidaPresupuestal}
                >
                  <OptionsPartidaPresupuestal />
                </select>
                {error.campo == "id_partida_presupuestal" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Proyecto</label>
                <input
                  className="form-control"
                  value={estado.forma.proyecto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <input
                  className="form-control"
                  value={estado.forma.tipo_gasto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <input
                  className="form-control"
                  value={estado.forma.rubro}
                  disabled
                />
              </div>
            </>
          )}
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Titular cuenta</label>
            <select
              className="form-control"
              name="id_titular_cuenta"
              onChange={(e) => handleChange(e, "CAMBIO_TITULAR")}
              value={estado.forma.id_titular_cuenta}
              disabled={disableInputXEstatus}
            >
              <OptionsTitularCuenta />
            </select>
            {error.campo == "id_titular_cuenta" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">CLABE / cuenta</label>
            <input
              className="form-control"
              type="text"
              name="clabe_account"
              value={estado.forma.clabe}
              disabled
            />
            {error.campo == "clabe_account" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Banco</label>
            <input
              className="form-control"
              value={estado.forma.banco}
              disabled
            />
            {error.campo == "banco" && <MensajeError mensaje={error.mensaje} />}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="email"
              value={estado.forma.email}
              disabled={disableInputXEstatus}
            />
            {error.campo == "email" && <MensajeError mensaje={error.mensaje} />}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proveedor</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="proveedor"
              value={estado.forma.proveedor}
              disabled={disableInputProveedor}
              placeholder="emisor de la factura"
            />
            {error.campo == "proveedor" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Descripción del gasto</label>
            {[3, 4].includes(Number(estado.forma.i_tipo_gasto)) ? (
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="descripcion_gasto"
                value={estado.forma.descripcion_gasto}
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
                value={estado.forma.descripcion_gasto}
                disabled={disableInputXEstatus}
              />
            )}
            {error.campo == "descripcion_gasto" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Importe</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="f_importe"
              value={estado.forma.f_importe}
              disabled={disableInputImporte}
            />
            {error.campo == "f_importe" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          {showRetenciones && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Retenciones</label>
              <input
                className="form-control"
                type="text"
                name="f_retenciones"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                value={estado.forma.f_retenciones}
                disabled={!estado.modoEditar || estado.forma.i_estatus != 1}
              />
              {error.campo == "f_retenciones" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          )}
          {showComprobantesNecesarios && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Monto a comprobar</label>
              <input
                className="form-control"
                type="text"
                value={(
                  Number(estado.forma.f_importe) - obtenerTotalComprobaciones()
                ).toFixed(2)}
                disabled
              />
            </div>
          )}
          {user.id_rol != 3 && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Estatus</label>
              <select
                className="form-control"
                name="i_estatus"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                value={estado.forma.i_estatus}
                disabled={!estado.modoEditar}
              >
                <option value="1">En revisión</option>
                <option value="2">Autorizada</option>
                <option value="3">Rechazada</option>
                {user.id_rol == rolesUsuario.SUPER_USUARIO && (
                  <option value="4">Procesada</option>
                )}
                <option value="5">Devolución</option>
              </select>
            </div>
          )}
          {showInputDtPago && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Fecha de pago</label>
              <input
                className="form-control"
                type="date"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="dt_pago"
                value={estado.forma.dt_pago}
                disabled={!estado.modoEditar}
              />
            </div>
          )}
          {modalidad === "CREAR" && (
            <div className="col-12 mb-3 d-flex justify-content-end">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={() => dispatch({ type: "ACEPTAR_TERMINOS" })}
                  ref={cbAceptaTerminos}
                  checked={estado.aceptarTerminos}
                />
                <label className="form-check-label">
                  Acepto los
                  <Link
                    href="/legal"
                    target="_blank"
                    className="color1 fw-bold"
                  >
                    {" "}
                    términos y condiciones
                  </Link>
                </label>
              </div>
            </div>
          )}
          {/* Seccion comprobantes */}
          {showComprobantesNecesarios && (
            <>
              <div className="col-12">
                <hr />
              </div>
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
                  <thead className="table-light">
                    <tr className="color1">
                      <th>Folio fiscal</th>
                      <th>RFC emisor</th>
                      <th>Régimen fiscal emisor</th>
                      <th>Régimen fiscal receptor</th>
                      <th>Método de pago</th>
                      <th>Forma de pago</th>
                      <th>Uso de CFDI</th>
                      <th>Retención ISR</th>
                      <th>Retención IVA</th>
                      <th>Impuestos retenidos</th>
                      <th>Total</th>
                      {estado.modoEditar && (
                        <th>
                          <i className="bi bi-trash"></i>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {estado.forma.comprobantes.map((comprobante) => {
                      const {
                        id,
                        folio_fiscal,
                        metodo_pago,
                        clave_forma_pago,
                        forma_pago,
                        uso_cfdi,
                        rfc_emisor,
                        id_regimen_fiscal_emisor,
                        id_regimen_fiscal_receptor,
                        f_iva,
                        f_isr,
                        f_retenciones,
                        f_total,
                      } = comprobante

                      const regimenFiscalEmisor = obtenerRegimenXId(
                        id_regimen_fiscal_emisor
                      )
                      const regimenFiscalReceptor = obtenerRegimenXId(
                        id_regimen_fiscal_receptor
                      )

                      return (
                        <tr key={folio_fiscal}>
                          <td>{folio_fiscal}</td>
                          <td>{rfc_emisor}</td>
                          <td>
                            {regimenFiscalEmisor.clave} -{" "}
                            {regimenFiscalEmisor.nombre}
                          </td>
                          <td>
                            {regimenFiscalReceptor.clave} -{" "}
                            {regimenFiscalReceptor.nombre}
                          </td>
                          <td>{metodo_pago}</td>
                          <td>
                            {clave_forma_pago} - {forma_pago}
                          </td>
                          <td>{uso_cfdi}</td>
                          <td>{montoALocaleString(Number(f_isr) || 0)}</td>
                          <td>{montoALocaleString(Number(f_iva) || 0)}</td>
                          <td>
                            {montoALocaleString(Number(f_retenciones) || 0)}
                          </td>
                          <td>{montoALocaleString(Number(f_total))}</td>
                          {estado.modoEditar && (
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
                    <tr>
                      <td colSpan={10}></td>
                      <td>{montoALocaleString(total_comprobantes)}</td>
                      {estado.modoEditar && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          {estado.modoEditar && (
            <div className="col-12 text-end">
              <BtnCancelar onclick={cancelar} margin={"r"} />
              <BtnRegistrar modalidad={modalidad} margin={false} />
            </div>
          )}
          {modalidad === "EDITAR" && (
            <Notas notas={estado.forma.notas} dispatch={dispatch} user={user} />
          )}
        </FormaContenedor>
      </RegistroContenedor>
      <Toast
        estado={estado.toast}
        cerrar={() => dispatch({ type: "CERRAR_TOAST" })}
      />
    </>
  )
}

const Notas = ({ notas, dispatch, user }) => {
  const router = useRouter()
  const idSolicitud = Number(router.query.idS)
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
            <tr className="color1">
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
                <td>{epochAFecha(dt_registro)}</td>
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

export { FormaSolicitudPresupuesto }
