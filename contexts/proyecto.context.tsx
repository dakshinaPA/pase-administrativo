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
import { UsuarioLogin, UsuarioMin } from "@models/usuario.model"
import { useSesion } from "@hooks/useSesion"
import {
  EstadoInicialBannerProps,
  estadoInicialBanner,
} from "@components/Banner"
import { FinanciadorMin } from "@models/financiador.model"
import { CoparteMin } from "@models/coparte.model"

interface FormaMinistracionProps extends MinistracionProyecto {
  id_rubro: number
}

interface EstadoProps {
  cargaInicial: Proyecto
  forma: Proyecto
  financiadoresDB: FinanciadorMin[]
  copartesDB: CoparteMin[]
  usuariosCoparteDB: UsuarioMin[]
  showFormaMinistracion: boolean
  formaMinistracion: FormaMinistracionProps
  modoEditar: boolean
  isLoading: boolean
  banner: EstadoInicialBannerProps
}

interface ProyectoProvider {
  estado: EstadoProps
  idProyecto: number
  idCoparte: number
  user: UsuarioLogin
  modalidad: "EDITAR" | "CREAR"
  quitarMinistracion: (i_numero: number) => void
  editarMinistracion: (id_ministracion: number) => void
  router: NextRouter
}

type ActionTypes =
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
  payload?: any
}

const ProyectoContext = createContext(null)

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
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
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

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

  const estaInicialFormaMinistracion: FormaMinistracionProps = {
    i_numero: 1,
    i_grupo: "0",
    dt_recepcion: "",
    id_rubro: 0,
    rubros_presupuestales: [],
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    financiadoresDB: [],
    copartesDB: [],
    usuariosCoparteDB: [],
    formaMinistracion: estaInicialFormaMinistracion,
    showFormaMinistracion: false,
    isLoading: true,
    banner: estadoInicialBanner,
    modoEditar: modalidad === "CREAR",
  }

  // const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  // const [showFormaMinistracion, setShowFormaMinistracion] = useState(false)
  // const [formaMinistracion, setFormaMinistracion] = useState(
  //   estaInicialFormaMinistracion
  // )
  // const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    try {
      //obtener financiadores en registro o edicion
      const reFinanciadores = await obtenerFinanciadores()
      if (reFinanciadores.error) throw reFinanciadores
      const financiadoresDB = reFinanciadores.data as FinanciadorMin[]
      setFinanciadoresDB(financiadoresDB)

      if (modalidad == "CREAR") {
        const queryCopartes: QueriesCoparte = {}
        if (idCoparte) {
          queryCopartes.id = idCoparte
        } else if (user.id_rol == 2) {
          queryCopartes.id_admin = user.id
        }

        const reCopartes = await obtenerCopartes(queryCopartes)
        if (reCopartes.error) throw reCopartes

        const copartesDB = reCopartes.data as CoparteMin[]
        setCopartesDB(copartesDB)
        dispatch({
          type: "SET_IDS_DEPENDENCIAS",
          payload: {
            id_coparte: copartesDB[0]?.id ?? 0,
            id_financiador: financiadoresDB[0]?.id ?? 0,
          },
        })
      } else {
        const reProyecto = await obtenerProyectos({
          id: idProyecto,
          min: false,
        })

        if (reProyecto.error) throw reProyecto
        const proyectoDB = reProyecto.data as Proyecto

        dispatch({
          type: "CARGA_INICIAL",
          payload: proyectoDB,
        })
      }
    } catch ({ data, mensaje }) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   if (modalidad === "CREAR") {
  //     handleTipoCambioFinanciamineto()
  //   }
  // }, [estadoForma.i_tipo_financiamiento])

  // const handleTipoCambioFinanciamineto = () => {
  //   dispatch({
  //     type: "CAMBIAR_TIPO_FINANCIAMIENTO",
  //     payload: null,
  //   })

  //   if (estadoForma.i_tipo_financiamiento <= 2) {
  //     setFormaMinistracion((prevState) => ({
  //       ...prevState,
  //       i_numero: 1,
  //     }))
  //   }
  // }

  const quitarMinistracion = (i_numero: number) => {
    // const nuevaLista = estado.forma.ministraciones.filter(
    //   (min) => min.i_numero != i_numero
    // )

    dispatch({
      type: "QUITAR_MINISTRACION",
      // payload: nuevaLista,
    })
  }

  const editarMinistracion = (id_ministracion: number) => {
    // const matchMinistracion = estadoForma.ministraciones.find(
    //   (min) => min.id == id_ministracion
    // )
    // if (!matchMinistracion) {
    //   console.log(matchMinistracion)
    //   return
    // }

    // const dataForma = {
    //   ...matchMinistracion,
    //   id_rubro: 0,
    // }

    // setFormaMinistracion(dataForma)
    // setShowFormaMinistracion(true)
  }

  // const proyecto: ProyectoProvider = {
  //   estado,
  //   // estadoForma,
  //   // dispatch,
  //   idProyecto,
  //   idCoparte,
  //   user,
  //   modalidad,
  //   // showFormaMinistracion,
  //   // setShowFormaMinistracion,
  //   // formaMinistracion,
  //   // setFormaMinistracion,
  //   // estaInicialFormaMinistracion,
  //   quitarMinistracion,
  //   editarMinistracion,
  //   // modoEditar,
  //   // setModoEditar,
  //   // router,
  // }
  const proyecto: ProyectoProvider = {
    estado,
    idProyecto,
    idCoparte,
    user,
    modalidad,
    quitarMinistracion,
    editarMinistracion,
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
