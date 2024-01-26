import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react"
import { NextRouter, useRouter } from "next/router"
import {
  MinistracionProyecto,
  Proyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { Usuario, UsuarioLogin } from "@models/usuario.model"
import { useSesion } from "@hooks/useSesion"

interface ProyectoProvider {
  estadoForma: Proyecto
  dispatch: Dispatch<ActionDispatch>
  idProyecto: number
  idCoparte: number
  user: UsuarioLogin
  modalidad: "EDITAR" | "CREAR"
  showFormaMinistracion: boolean
  setShowFormaMinistracion: Dispatch<SetStateAction<boolean>>
  formaMinistracion: FormaMinistracion
  estaInicialFormaMinistracion: MinistracionProyecto
  setFormaMinistracion: Dispatch<SetStateAction<MinistracionProyecto>>
  quitarMinistracion: (i_numero: number) => void
  editarMinistracion: (id_ministracion: number) => void
  modoEditar: boolean
  setModoEditar: Dispatch<SetStateAction<boolean>>
  router: NextRouter
}

const ProyectoContext = createContext(null)

export type ActionTypes =
  | "SET_IDS_DEPENDENCIAS"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "QUITAR_MINISTRACION"
  | "AGREGAR_MINISTRACION"
  | "ACTUALIZAR_MINISTRACIONES"
  | "CAMBIAR_TIPO_FINANCIAMIENTO"
  | "RECARGAR_NOTAS"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

interface FormaMinistracion {
  id?: number
  i_numero: number
  i_grupo: string
  dt_recepcion: string
  id_rubro: number
  rubros_presupuestales: RubroMinistracion[]
}

const reducer = (state: Proyecto, action: ActionDispatch): Proyecto => {
  const { type, payload } = action

  switch (type) {
    case "SET_IDS_DEPENDENCIAS":
      return {
        ...state,
        id_financiador: payload.id_financiador,
        id_coparte: payload.id_coparte,
      }
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "QUITAR_MINISTRACION":
      return {
        ...state,
        ministraciones: payload,
      }
    case "AGREGAR_MINISTRACION":
      return {
        ...state,
        ministraciones: [...state.ministraciones, payload],
      }
    case "ACTUALIZAR_MINISTRACIONES":
      return {
        ...state,
        ministraciones: payload,
      }
    case "CAMBIAR_TIPO_FINANCIAMIENTO":
      return {
        ...state,
        ministraciones: [],
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

const ProyectoProvider = ({ children }) => {
  const router = useRouter()
  const { data: sesion, status } = useSesion()
  if (status !== "authenticated") return null
  const user = sesion.user as Usuario
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)

  const estadoInicialForma: Proyecto = {
    id_coparte: 0,
    id_financiador: 0,
    id_responsable: 0,
    id_alt: "",
    nombre: "",
    i_tipo_financiamiento: 1,
    id_tema_social: 1,
    sector_beneficiado: "",
    id_estado: 1,
    municipio: "",
    descripcion: "",
    dt_inicio: "",
    dt_fin: "",
    i_beneficiados: 0,
    saldo: {
      f_monto_total: 0,
      f_transferido: 0,
      f_solicitado: 0,
      f_comprobado: 0,
      f_por_comprobar: 0,
      f_isr: 0,
      f_retenciones: 0,
      f_pa: 0,
      f_ejecutado: 0,
      f_remanente: 0,
      p_avance: 0,
    },
    ministraciones: [],
    colaboradores: [],
    proveedores: [],
    solicitudes_presupuesto: [],
    notas: [],
  }

  const estaInicialFormaMinistracion: FormaMinistracion = {
    i_numero: 1,
    i_grupo: "0",
    dt_recepcion: "",
    id_rubro: 0,
    rubros_presupuestales: [],
  }

  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [showFormaMinistracion, setShowFormaMinistracion] = useState(false)
  const [formaMinistracion, setFormaMinistracion] = useState(
    estaInicialFormaMinistracion
  )
  const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  useEffect(() => {
    if (modalidad === "CREAR") {
      handleTipoCambioFinanciamineto()
    }
  }, [estadoForma.i_tipo_financiamiento])

  const handleTipoCambioFinanciamineto = () => {
    dispatch({
      type: "CAMBIAR_TIPO_FINANCIAMIENTO",
      payload: null,
    })

    if (estadoForma.i_tipo_financiamiento <= 2) {
      setFormaMinistracion((prevState) => ({
        ...prevState,
        i_numero: 1,
      }))
    }
  }

  const quitarMinistracion = (i_numero: number) => {
    const nuevaLista = estadoForma.ministraciones.filter(
      (min) => min.i_numero != i_numero
    )

    dispatch({
      type: "QUITAR_MINISTRACION",
      payload: nuevaLista,
    })
  }

  const editarMinistracion = (id_ministracion: number) => {
    const matchMinistracion = estadoForma.ministraciones.find(
      (min) => min.id == id_ministracion
    )
    if (!matchMinistracion) {
      console.log(matchMinistracion)
      return
    }

    const dataForma = {
      ...matchMinistracion,
      id_rubro: 0,
    }

    setFormaMinistracion(dataForma)
    setShowFormaMinistracion(true)
  }

  const proyecto: ProyectoProvider = {
    estadoForma,
    dispatch,
    idProyecto,
    idCoparte,
    user,
    modalidad,
    showFormaMinistracion,
    setShowFormaMinistracion,
    formaMinistracion,
    setFormaMinistracion,
    estaInicialFormaMinistracion,
    quitarMinistracion,
    editarMinistracion,
    modoEditar,
    setModoEditar,
    router
  }

  return (
    <ProyectoContext.Provider value={proyecto}>
      {children}
    </ProyectoContext.Provider>
  )
}

const useProyecto = () => {
  const proyecto = useContext(ProyectoContext) as ProyectoProvider
  return proyecto
}

export { ProyectoProvider, useProyecto }
