import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Proyecto } from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import { CoparteUsuarioMin } from "@models/coparte.model"

const FormaProyecto = () => {
  const { user } = useAuth()
  if (!user) return null

  const estadoInicialForma: Proyecto = {
    id_coparte: user.copartes[0].id_coparte,
    id_alt: "",
    f_monto_total: "0",
    i_tipo_financiamiento: 1,
    i_beneficiados: 0,
    responsable: {
      id: 0,
    },
    financiador: {
      id: 1,
    },
    rubros: [],
    ministraciones: [],
  }

  const router = useRouter()
  const idProyecto = router.query.id
  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  const [financiadoresDB, setFinanciadoresDB] = useState<FinanciadorMin[]>([])
  const [usuariosCoparteDB, setUsuariosCoparteDB] = useState<
    CoparteUsuarioMin[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    //limpiar responsable
    setEstadoForma({
      ...estadoForma,
      responsable: {
        id: 0
      }
    })

    cargarUsuariosCoparte(estadoForma.id_coparte)

  }, [estadoForma.id_coparte])

  const cargarData = async () => {
    setIsLoading(true)

    const financiadoresDB = obtenerFinanciadores()
    const usuariosCoparte = obtenerUsuariosCoparte(estadoForma.id_coparte)

    const resCombinadas = await Promise.all([financiadoresDB, usuariosCoparte])

    let error = false

    for (const rc of resCombinadas) {
      if (rc.error) {
        console.log(rc.data)
        error = true
      }
    }

    if (!error) {
      setFinanciadoresDB(resCombinadas[0].data as FinanciadorMin[])
      setUsuariosCoparteDB(resCombinadas[1].data as CoparteUsuarioMin[])
    }

    // const { error, data } = await obtener()

    // if (error) {
    //   console.log(error)
    // } else {
    //   const dataProyecto = data[0] as Proyecto
    //   setEstadoForma(dataProyecto)
    // }

    setIsLoading(false)
  }

  const cargarUsuariosCoparte = async (id_coparte: number) => {

    const reUsCoDB = await obtenerUsuariosCoparte(id_coparte)

    if(reUsCoDB.error){
      console.log(reUsCoDB.data)
    } else {
      setUsuariosCoparteDB(reUsCoDB.data as CoparteUsuarioMin[])
    }
  }

  const obtenerFinanciadores = async () => {
    return await ApiCall.get(`/financiadores?min=true`)
  }

  const obtenerUsuariosCoparte = async (id_coparte: number) => {
    return await ApiCall.get(`/copartes/${id_coparte}/usuarios?min=true`)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/proyectos/${idProyecto}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/proyectos", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/proyectos/${idProyecto}`, estadoForma)
    return res
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/proyectos")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleChangeResponsable = (ev: ChangeEvent) => {
    const { value } = ev.target

    setEstadoForma({
      ...estadoForma,
      responsable: {
        id: Number(value)
      }
    })
  }

  const handleChangeFinanciador = (ev: ChangeEvent) => {
    const { value } = ev.target

    setEstadoForma({
      ...estadoForma,
      financiador: {
        id: Number(value)
      }
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push("/proyectos")
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
            <BtnBack navLink="/proyectos" />
            {!idProyecto && <h2 className="color1 mb-0">Registrar proyecto</h2>}
          </div>
          {!modoEditar && idProyecto && (
            <button
              className="btn btn-secondary"
              onClick={() => setModoEditar(true)}
            >
              Editar
            </button>
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Coparte</label>
          <select
            className="form-control"
            onChange={handleChange}
            value={estadoForma.id_coparte}
            name="id_coparte"
            disabled={!modoEditar}
          >
            {user.copartes.map(({ id_coparte, nombre }) => (
              <option key={id_coparte} value={id_coparte}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Financiador</label>
          <select
            className="form-control"
            onChange={handleChangeFinanciador}
            value={estadoForma.financiador.id}
            disabled={!modoEditar}
          >
            {financiadoresDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Responsable</label>
          <select
            className="form-control"
            onChange={handleChangeResponsable}
            value={estadoForma.responsable.id}
            disabled={!modoEditar}
          >
            <option value="0" disabled>Selecciona usuario</option>
            {usuariosCoparteDB.map(
              ({ id, id_usuario, nombre, apellido_paterno }) => (
                <option key={id} value={id_usuario}>
                  {nombre} {apellido_paterno}
                </option>
              )
            )}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de financiamiento</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="i_tipo_financiamiento"
            value={estadoForma.i_tipo_financiamiento}
            disabled={!modoEditar}
          >
            <option value="1">Estipendio</option>
            <option value="2">Única ministración</option>
            <option value="3">Varias Ministraciones</option>
            <option value="4">Multi anual</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Id alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Monto total</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="f_monto_total"
            value={estadoForma.f_monto_total}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Beneficiados</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="i_beneficiados"
            value={estadoForma.i_beneficiados}
            disabled={!modoEditar}
          />
        </div>
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaProyecto }
