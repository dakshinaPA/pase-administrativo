import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react"
import { useRouter } from "next/router"
import { ApiCall } from "@assets/utils/apiCalls"
import { MinistracionProyecto, Proyecto } from "@models/proyecto.model"
import { useAuth } from "./auth.context"
import { UsuarioLogin } from "@models/usuario.model"

interface ProyectoProvider {
  estadoForma: Proyecto
  dispatch: Dispatch<ActionDispatch>
  idProyecto: number
  idCoparte: number
  user: UsuarioLogin
  modalidad: "EDITAR" | "CREAR"
  showFormaMinistracion: boolean
  setShowFormaMinistracion: Dispatch<SetStateAction<boolean>>
  formaMinistracion: MinistracionProyecto
  estaInicialdFormaMinistracion: MinistracionProyecto
  setFormaMinistracion: Dispatch<SetStateAction<MinistracionProyecto>>
}

const ProyectoContext = createContext(null)

export type ActionTypes =
  | "SET_IDS_DEPENDENCIAS"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "QUITAR_MINISTRACION"
  | "AGREGAR_MINISTRACION"
  | "CAMBIAR_TIPO_FINANCIAMIENTO"
  | "RECARGAR_NOTAS"

interface ActionDispatch {
  type: ActionTypes
  payload: any
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
  const { user } = useAuth()
  if (!user) return null

  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)

  const estadoInicialForma: Proyecto = {
    id_coparte: 0,
    id_financiador: 0,
    id_responsable: 0,
    id_alt: "",
    nombre: "",
    f_monto_total: "0",
    i_tipo_financiamiento: 1,
    id_tema_social: 1,
    i_beneficiados: 0,
    ministraciones: [],
    colaboradores: [],
    proveedores: [],
    solicitudes_presupuesto: [],
    notas: [],
  }

  const estaInicialdFormaMinistracion: MinistracionProyecto = {
    i_numero: 1,
    f_monto: "0",
    i_grupo: "0",
    dt_recepcion: "",
    rubros_presupuestales: [],
  }

  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [showFormaMinistracion, setShowFormaMinistracion] = useState(false)
  const [formaMinistracion, setFormaMinistracion] = useState(
    estaInicialdFormaMinistracion
  )
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  // useEffect(() => {}, [])
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
    estaInicialdFormaMinistracion,
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
