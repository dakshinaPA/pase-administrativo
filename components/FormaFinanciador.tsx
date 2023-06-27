import { useEffect, useRef, useState, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnEditar } from "./Botones"

const reducer = (state: Financiador, action) => {
  const { type, value } = action

  switch (type) {
    case "CARGA_INICIAL":
      return value
    case "BASE":
      return {
        ...state,
        [value[0]]: value[1],
      }
    case "DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [value[0]]: value[1],
        },
      }
    case "ENLACE":
      return {
        ...state,
        enlace: {
          ...state.enlace,
          [value[0]]: value[1],
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: value,
      }
    case "CAMBIO_PAIS":
      let llave = "id_estado"
      let valor: string | number = 1

      if (value == 1) {
        llave = "estado"
        valor = ""
      }

      return {
        ...state,
        direccion: {
          ...state.direccion,
          [llave]: valor,
        },
      }
    default:
      return state
  }
}

const estadoInicialForma: Financiador = {
  id_alt: "",
  nombre: "",
  rfc: "",
  i_tipo: 1,
  actividad: "",
  representante_legal: "",
  rfc_representante_legal: "",
  pagina_web: "",
  dt_constitucion: "",
  enlace: {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
  },
  direccion: {
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    municipio: "",
    cp: "",
    id_estado: 1,
    estado: "",
    id_pais: 1,
  },
  notas: [],
}

const FormaFinanciador = () => {
  const { user } = useAuth()
  if(!user) return null
  const { estados, paises } = useCatalogos()
  const router = useRouter()
  const idFinanciador = router.query.id
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const [modoEditar, setModoEditar] = useState<boolean>(!idFinanciador)
  const modalidad = idFinanciador ? "EDITAR" : "CREAR"
  const inputNota = useRef(null)

  useEffect(() => {
    if (modalidad === "EDITAR") {
      cargarData()
    }
  }, [])

  useEffect(() => {
    dispatch({
      type: "CAMBIO_PAIS",
      value: estadoForma.direccion.id_pais,
    })
  }, [estadoForma.direccion.id_pais])

  const cargarData = async () => {
    setIsLoading(true)

    const { error, data } = await obtener()

    if (error) {
      console.log(error)
    } else {
      const dataFinanciador = data[0] as Financiador
      dispatch({
        type: "CARGA_INICIAL",
        value: dataFinanciador,
      })
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/financiadores/${idFinanciador}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/financiadores", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(
      `/financiadores/${idFinanciador}`,
      estadoForma
    )
    return res
  }

  const cancelar = () => {
    idFinanciador ? setModoEditar(false) : router.push("/financiadores")
  }

  const handleChange = (ev: ChangeEvent, type: string) => {
    const { name, value } = ev.target

    dispatch({
      type,
      value: [name, value],
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const res = modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (res.error) {
      console.log(res.data)
      console.log(res.mensaje)
    } else {
      if (modalidad === "EDITAR") {
        setModoEditar(false)
      } else {
        //@ts-ignore
        router.push(`/financiadores/${res.data.idInsertado}`)
      }
    }
  }

  const agregarNota = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/financiadores/${idFinanciador}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })
    if (cr.error) {
      console.log(cr.data)
    } else {
      //limpiar el input
      setMensajeNota("")

      const re = await ApiCall.get(`/financiadores/${idFinanciador}/notas`)
      if (re.error) {
        console.log(re.data)
      } else {
        const notasDB = re.data as NotaFinanciador[]
        dispatch({
          type: "RECARGAR_NOTAS",
          value: notasDB,
        })
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
            <BtnBack navLink="/financiadores" />
            {!idFinanciador && (
              <h2 className="color1 mb-0">Registrar financiador</h2>
            )}
          </div>
          {!modoEditar && idFinanciador && user.id_rol == 1 && (
            <BtnEditar onClick={() => setModoEditar(true)} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">ID alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled={Boolean(idFinanciador)}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="nombre"
            value={estadoForma.nombre}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="rfc"
            value={estadoForma.rfc}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "BASE")}
            name="i_tipo"
            value={estadoForma.i_tipo}
            disabled={!modoEditar}
          >
            <option value="1">Aliado</option>
            <option value="2">Independiente</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Objeto social</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="actividad"
            value={estadoForma.actividad}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Representante legal</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="representante_legal"
            value={estadoForma.representante_legal}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC Representante</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="rfc_representante_legal"
            value={estadoForma.rfc_representante_legal}
            placeholder="del representante legal"
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Página web</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="pagina_web"
            value={estadoForma.pagina_web}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Fecha de constitución</label>
          <input
            className="form-control"
            type="date"
            onChange={(e) => handleChange(e, "BASE")}
            name="dt_constitucion"
            value={estadoForma.dt_constitucion}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
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
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="cp"
            value={estadoForma.direccion.cp}
            disabled={!modoEditar}
          />
        </div>
        {estadoForma.direccion.id_pais == 1 ? (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "DIRECCION")}
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
        ) : (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "DIRECCION")}
              name="estado"
              value={estadoForma.direccion.estado}
              disabled={!modoEditar}
            />
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">País</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="id_pais"
            value={estadoForma.direccion.id_pais}
            disabled={!modoEditar}
          >
            {paises.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <hr />
        </div>
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Enlace</h4>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "ENLACE")}
            name="nombre"
            value={estadoForma.enlace.nombre}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido paterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "ENLACE")}
            name="apellido_paterno"
            value={estadoForma.enlace.apellido_paterno}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido materno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "ENLACE")}
            name="apellido_materno"
            value={estadoForma.enlace.apellido_materno}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "ENLACE")}
            name="email"
            value={estadoForma.enlace.email}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Teléfono</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "ENLACE")}
            name="telefono"
            value={estadoForma.enlace.telefono}
            disabled={!modoEditar}
          />
        </div>
        {modoEditar && (
          <div className="col-12 text-end">
            <button
              className="btn btn-secondary me-2"
              type="button"
              onClick={cancelar}
            >
              Cancelar
            </button>
            <button className="btn btn-secondary" type="submit">
              {idFinanciador ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <div className="row my-3">
          <div className="col-12 mb-3">
            <h2 className="color1 mb-0">Notas</h2>
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
                {estadoForma.notas.map(
                  ({ id, usuario, mensaje, dt_registro }) => (
                    <tr key={id}>
                      <td>{usuario}</td>
                      <td>{mensaje}</td>
                      <td>{dt_registro}</td>
                    </tr>
                  )
                )}
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
            ></input>
            {/* <textarea className="form-control"></textarea> */}
          </div>
          <div className="col-12 col-md-3 mb-3 text-end">
            <button className="btn btn-secondary" onClick={agregarNota}>
              Agregar nota +
            </button>
          </div>
        </div>
      )}
    </RegistroContenedor>
  )
}

export { FormaFinanciador }
