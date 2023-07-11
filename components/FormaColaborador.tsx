import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ColaboradorProyecto,
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
import { obtenerColaboradores, obtenerProyectos } from "@assets/utils/common"

type ActionTypes = "CARGA_INICIAL" | "HANDLE_CHANGE" | "HANDLE_CHANGE_DIRECCION"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (
  state: ColaboradorProyecto,
  action: ActionDispatch
): ColaboradorProyecto => {
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

const FormaColaborador = () => {
  const { user } = useAuth()
  if (!user || user.id_rol != 3) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idColaborador = Number(router.query.idC)

  const estadoInicialForma: ColaboradorProyecto = {
    id_proyecto: idProyecto || 0,
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    i_tipo: 1,
    clabe: "",
    id_banco: 1,
    telefono: "",
    email: "",
    rfc: "",
    curp: "",
    cp: "",
    nombre_servicio: "",
    descripcion_servicio: "",
    f_monto_total: "",
    dt_inicio_servicio: "",
    dt_fin_servicio: "",
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
  const [dtFinMax, setDtFinMax] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idColaborador)
  const modalidad = idColaborador ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    if (!estadoForma.dt_inicio_servicio) return

    const dtLimite = estadoForma.i_tipo == 1 ? dtInicioMasSeisMeses() : ""
    setDtFinMax(dtLimite)
  }, [estadoForma.dt_inicio_servicio, estadoForma.i_tipo])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectosDB()]
      if (modalidad === "EDITAR") {
        promesas.push(obtenerColaboradores(null, idColaborador))
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
        const colaborador = resCombinadas[1].data[0] as ColaboradorProyecto

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
    return ApiCall.post("/colaboradores", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/colaboradores/${idColaborador}`, estadoForma)
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

  const dtInicioMasSeisMeses = () => {
    const dtInicio = new Date(estadoForma.dt_inicio_servicio)
    const dtFinEpoch = new Date(estadoForma.dt_inicio_servicio).setMonth(
      dtInicio.getMonth() + 6
    )

    const dtFin = new Date(0)
    dtFin.setUTCMilliseconds(dtFinEpoch)
    const [month, day, year] = dtFin
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")

    const dtAFormatoInput = `${year}-${month}-${day}`

    return dtAFormatoInput
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
        router.push(
          //@ts-ignore
          `/proyectos/${estadoForma.id_proyecto}/colaboradores/${data.idInsertado}`
        )
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
          <div>
            {/* <BtnBack navLink="/colaboradores" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Colaborador</h2>
            )}
          </div>
          {!modoEditar &&
            idColaborador &&
            user.id === estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
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
          </div>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
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
              <label className="form-label">Apellido paterno</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="apellido_paterno"
                value={estadoForma.apellido_paterno}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido materno</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="apellido_materno"
                value={estadoForma.apellido_materno}
                disabled={!modoEditar}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="i_tipo"
                value={estadoForma.i_tipo}
                disabled={!modoEditar}
              >
                <option value="1">Asimilado</option>
                <option value="2">Honorarios</option>
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
              <label className="form-label">Monto total</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="f_monto_total"
                value={estadoForma.f_monto_total}
                disabled={!modoEditar}
                placeholder="presupuestado (incluyendo impuestos)"
              />
            </div>
          </div>
          <div className="row">
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
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CURP</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="curp"
                value={estadoForma.curp}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CP</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="cp"
                value={estadoForma.cp}
                disabled={!modoEditar}
                placeholder="de la constancia de situación fiscal"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-4 mb-3">
              <label className="form-label">Nombre servicio</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="nombre_servicio"
                value={estadoForma.nombre_servicio}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-lg-8 mb-3">
              <label className="form-label">Descricpión servicio</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="descripcion_servicio"
                value={estadoForma.descripcion_servicio}
                disabled={!modoEditar}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Inicio servicio</label>
              <input
                className="form-control"
                type="date"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="dt_inicio_servicio"
                value={estadoForma.dt_inicio_servicio}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Fin servicio</label>
              <input
                className="form-control"
                type="date"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="dt_fin_servicio"
                value={estadoForma.dt_fin_servicio}
                max={dtFinMax}
                disabled={!modoEditar}
              />
            </div>
          </div>
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

export { FormaColaborador }
