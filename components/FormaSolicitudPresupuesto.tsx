import { useEffect, useState, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { ColaboradorProyecto, ProyectoMin } from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnEditar } from "./Botones"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"

interface ActionReducer {
  type: string
  value: [string, string | number]
}

const reducer = (state: SolicitudPresupuesto, action: ActionReducer) => {
  const { type, value } = action

  switch (type) {
    case "BASE":
      return {
        ...state,
        [value[0]]: value[1],
      }
    case "CUENTA":
      return {
        ...state,
        cuenta: {
          ...state.cuenta,
          [value[0]]: value[1],
        },
      }
    default:
      return state
  }
}

const FormaSolicitudPresupuesto = () => {
  const router = useRouter()
  const idProyecto = Number(router.query.id)

  const estadoInicialForma: SolicitudPresupuesto = {
    id_proyecto: idProyecto,
    i_tipo_gasto: 1,
    cuenta: {
      titular: "",
      clabe: "",
      id_banco: 1,
      rfc: "",
      email: "",
    },
    proveedor: "",
    descripcion_gasto: "",
    id_partida_presupuestal: 1,
    f_importe: "",
    f_monto_comprobar: "",
    comprobantes: [
      // {
      //     folio_fiscal: "F34982",
      //     f_total: "132.34",
      //     f_retenciones: "12.34",
      //     i_regimen_fiscal: 1,
      //     i_forma_pago: 1
      // }
    ],
  }

  const { bancos } = useCatalogos()
  const idColaborador = Number(router.query.idC)
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idColaborador)
  const modalidad = idColaborador ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectos()]
      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      setProyectosDB(resCombinadas[0].data as ProyectoMin[])

      if (modalidad === "EDITAR") {
        // setEstadoForma(resCombinadas[1].data[0] as SolicitudPresupuesto)
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtenerProyectos = async () => {
    const url = `/proyectos/${idProyecto}?min=true`
    return await ApiCall.get(url)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/solicitudes-presupuesto/${idColaborador}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/solicitudes-presupuesto", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(
      `/solicitudes-presupuesto/${idColaborador}`,
      estadoForma
    )
    return res
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.back()
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
          `/proyectos/${idProyecto}/solicitudes-presupuesto/${data.idInsertado}`
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
            {/* <BtnBack navLink="/solicitudes-presupuesto" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">
                Registrar solicitud de presupuesto
              </h2>
            )}
          </div>
          {!modoEditar && idColaborador && (
            <BtnEditar onClick={() => setModoEditar(true)} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Proyecto</label>
          <select
            className="form-control"
            // onChange={handleChange}
            name="id_proyecto"
            value={estadoForma.id_proyecto}
            disabled
          >
            {proyectosDB.map(({ id, id_alt }) => (
              <option key={id} value={id}>
                {id_alt}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de gasto</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "BASE")}
            name="i_tipo_gasto"
            value={estadoForma.i_tipo_gasto}
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
            onChange={(e) => handleChange(e, "BASE")}
            name="id_partida_presupuestal"
            value={estadoForma.id_partida_presupuestal}
          ></select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Titular</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "CUENTA")}
            name="titular"
            value={estadoForma.cuenta.titular}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">CLABE</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "CUENTA")}
            name="clabe"
            value={estadoForma.cuenta.clabe}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Banco</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "CUENTA")}
            name="id_banco"
            value={estadoForma.cuenta.id_banco}
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
            onChange={(e) => handleChange(e, "CUENTA")}
            name="email"
            value={estadoForma.cuenta.email}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "CUENTA")}
            name="rfc"
            value={estadoForma.cuenta.rfc}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Proveedor</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
            name="proveedor"
            value={estadoForma.proveedor}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Descricpión del gasto</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "BASE")}
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
            onChange={(e) => handleChange(e, "BASE")}
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
            onChange={(e) => handleChange(e, "BASE")}
            name="f_monto_comprobar"
            value={estadoForma.f_monto_comprobar}
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
              {idProyecto ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaSolicitudPresupuesto }
