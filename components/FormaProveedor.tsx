import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { useAuth } from "@contexts/auth.context"
import { obtenerProveedores, obtenerProyectos } from "@assets/utils/common"

type ActionTypes = "CARGA_INICIAL" | "HANDLE_CHANGE" | "HANDLE_CHANGE_DIRECCION"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (
  state: ProveedorProyecto,
  action: ActionDispatch
): ProveedorProyecto => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "HANDLE_CHANGE_DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [payload.name]: payload.value,
        },
      }
    default:
      return state
  }
}

const FormaProveedor = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idProveedor = Number(router.query.idP)

  const estadoInicialForma: ProveedorProyecto = {
    id_proyecto: idProyecto || 0,
    nombre: "",
    i_tipo: 1,
    clabe: "",
    id_banco: 0,
    telefono: "",
    email: "",
    rfc: "",
    descripcion_servicio: "",
    direccion: {
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      municipio: "",
      cp: "",
      id_estado: 1,
    },
  }

  const { estados, bancos } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProveedor)
  const modalidad = idProveedor ? "EDITAR" : "CREAR"
  const formRef = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    //el banco depende de los primero 3 digios de la clabe
    if (estadoForma.clabe.length < 3 && estadoForma.id_banco > 0) {
      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "id_banco",
          value: 0,
        },
      })
    } else if (estadoForma.clabe.length == 3 && estadoForma.id_banco == 0) {
      const matchBanco = bancos.find(
        (banco) => banco.clave === estadoForma.clabe
      )
      if (matchBanco) {
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_banco",
            value: matchBanco.id,
          },
        })
      }
    }
  }, [estadoForma.clabe])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectosDB()]
      if (modalidad === "EDITAR") {
        promesas.push(obtenerProveedores(null, idProveedor))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const proyectosDB = resCombinadas[0].data as ProyectoMin[]
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

      if (modalidad === "EDITAR") {
        const colaborador = resCombinadas[1].data[0] as ProveedorProyecto

        dispatch({
          type: "CARGA_INICIAL",
          payload: colaborador,
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const registrar = async () => {
    return ApiCall.post("/proveedores", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/proveedores/${idProveedor}`, estadoForma)
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

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/proyectos/${idProyecto}/proveedores/${data.idInsertado}`)
      } else {
        setModoEditar(false)
      }
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            {/* <BtnBack navLink="/proveedores" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Proveedor</h2>
            )}
          </div>
          {!modoEditar &&
            idProveedor &&
            user.id === estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Proyecto</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_proyecto"
            value={estadoForma.id_proyecto}
            disabled={!!idProyecto}
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
        <div className="col-12 col-lg-8 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="nombre"
            value={estadoForma.nombre}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo"
            value={estadoForma.i_tipo}
            disabled={Boolean(idProveedor)}
          >
            <option value="1">Persona física</option>
            <option value="2">Persona moral</option>
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
            // disabled={!modoEditar}
            disabled
          >
            <option value="0" disabled></option>
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
          <label className="form-label">Teléfono</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="telefono"
            value={estadoForma.telefono}
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
        <div className="col-12 mb-3">
          <label className="form-label">
            Descricpión de la compra o servicio
          </label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="descripcion_servicio"
            value={estadoForma.descripcion_servicio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12">
          <hr />
        </div>
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Dirección</h4>
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Calle</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="calle"
            value={estadoForma.direccion.calle}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número ext</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="numero_ext"
            value={estadoForma.direccion.numero_ext}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número int</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="numero_int"
            value={estadoForma.direccion.numero_int}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Colonia</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="colonia"
            value={estadoForma.direccion.colonia}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Municipio</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="municipio"
            value={estadoForma.direccion.municipio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">CP</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="cp"
            value={estadoForma.direccion.cp}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="id_estado"
            value={estadoForma.direccion.id_estado}
            disabled={!modoEditar}
          >
            {estados.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
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

export { FormaProveedor }
