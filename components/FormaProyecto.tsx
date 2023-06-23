import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  MinistracionProyecto,
  Proyecto,
  RubroProyecto,
} from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import { CoparteUsuarioMin } from "@models/coparte.model"
import { useCatalogos } from "@contexts/catalogos.context"
import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"
import { inputDateAformato } from "@assets/utils/common"

const FormaProyecto = () => {
  const { user } = useAuth()
  if (!user) return null

  const { rubros_presupuestales } = useCatalogos()
  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)

  const estadoInicialForma: Proyecto = {
    id_coparte: idCoparte || user.copartes[0].id_coparte,
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
    colaboradores: [],
    proveedores: [],
  }

  const estadoInicialFormaRubros: RubroProyecto = {
    id_rubro: 0,
    f_monto: "",
  }

  const estaInicialdFormaMinistracion: MinistracionProyecto = {
    i_numero: 1,
    f_monto: "0",
    i_grupo: "0",
    dt_recepcion: "",
  }

  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  const [formaRubros, setFormaRubros] = useState(estadoInicialFormaRubros)
  const [formaMinistracion, setFormaMinistracion] = useState(
    estaInicialdFormaMinistracion
  )
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
    if (!idCoparte) {
      //limpiar responsable
      setEstadoForma({
        ...estadoForma,
        responsable: {
          id: 0,
        },
      })

      //evitar doble renderizado en el primer llamado
      cargarUsuariosCoparte(estadoForma.id_coparte)
    }
  }, [estadoForma.id_coparte])

  useEffect(() => {
    setFormaMinistracion({
      ...estaInicialdFormaMinistracion,
      i_numero: estadoForma.ministraciones.length + 1,
    })
  }, [estadoForma.ministraciones.length])

  useEffect(() => {
    switch (Number(estadoForma.i_tipo_financiamiento)) {
      case 1:
      case 2:
        setFormaMinistracion({
          ...formaMinistracion,
          i_numero: 1,
          f_monto: estadoForma.f_monto_total,
        })
        break
      case 3:
      case 4:
        setFormaMinistracion(estaInicialdFormaMinistracion)
        break
      default:
        setFormaMinistracion(estaInicialdFormaMinistracion)
    }

    //limpiar lista ministraciones si hay un cambio de tipo financiamiento
    if (modalidad === "CREAR") {
      setEstadoForma({
        ...estadoForma,
        ministraciones: [],
      })
    }
  }, [estadoForma.i_tipo_financiamiento])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerFinanciadores()]

      if (idCoparte) {
        promesas.push(obtenerUsuariosCoparte(idCoparte))
      }

      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      setFinanciadoresDB(resCombinadas[0].data as FinanciadorMin[])
      setUsuariosCoparteDB(resCombinadas[1].data as CoparteUsuarioMin[])
      if (modalidad === "EDITAR") {
        setEstadoForma(resCombinadas[2].data[0] as Proyecto)
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarUsuariosCoparte = async (id_coparte: number) => {
    const reUsCoDB = await obtenerUsuariosCoparte(id_coparte)

    if (reUsCoDB.error) {
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
        id: Number(value),
      },
    })
  }

  const handleChangeFinanciador = (ev: ChangeEvent) => {
    const { value } = ev.target

    setEstadoForma({
      ...estadoForma,
      financiador: {
        id: Number(value),
      },
    })
  }

  const handleChangeRubro = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaRubros({
      ...formaRubros,
      [name]: value,
    })
  }

  const agregarRubro = () => {
    const nombreRubro = rubros_presupuestales.find(
      (rp) => rp.id == formaRubros.id_rubro
    )

    setEstadoForma({
      ...estadoForma,
      rubros: [
        ...estadoForma.rubros,
        {
          id_rubro: formaRubros.id_rubro,
          f_monto: formaRubros.f_monto,
          nombre: nombreRubro.nombre,
        },
      ],
    })

    //limpiar forma
    setFormaRubros(estadoInicialFormaRubros)
  }

  const quitarRubro = (id_rubro: number) => {
    const nuevaLista = estadoForma.rubros.filter(
      (rubro) => rubro.id_rubro != id_rubro
    )

    setEstadoForma({
      ...estadoForma,
      rubros: nuevaLista,
    })
  }

  const handleChangeMinistracion = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaMinistracion({
      ...formaMinistracion,
      [name]: value,
    })
  }

  const agregarMinistracion = () => {
    setEstadoForma({
      ...estadoForma,
      ministraciones: [
        ...estadoForma.ministraciones,
        {
          ...formaMinistracion,
          f_monto:
            estadoForma.i_tipo_financiamiento <= 2
              ? estadoForma.f_monto_total
              : formaMinistracion.f_monto,
        },
      ],
    })
  }

  const quitarMinistracion = (i_numero: number) => {
    const nuevaLista = estadoForma.ministraciones.filter(
      (min) => min.i_numero != i_numero
    )

    setEstadoForma({
      ...estadoForma,
      ministraciones: nuevaLista,
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
        router.push(
          //@ts-ignore
          `/copartes/${estadoForma.id_coparte}/proyectos/${data.idInsertado}`
        )
      } else {
        setModoEditar(false)
      }
    }
  }

  const rubrosNoSeleccionados = () => {
    const rubros: RubrosPresupuestalesDB[] = []
    const idsRubrosForma = estadoForma.rubros.map(({ id_rubro }) =>
      Number(id_rubro)
    )

    for (const rp of rubros_presupuestales) {
      if (!idsRubrosForma.includes(rp.id)) {
        rubros.push(rp)
      }
    }

    return rubros
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
        {modalidad === "EDITAR" && (
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
        )}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Financiador</label>
          <select
            className="form-control"
            onChange={handleChangeFinanciador}
            value={estadoForma.financiador.id}
            disabled={Boolean(idProyecto)}
          >
            {financiadoresDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Coparte</label>
          <select
            className="form-control"
            onChange={handleChange}
            value={estadoForma.id_coparte}
            name="id_coparte"
            disabled={Boolean(idProyecto) || Boolean(idCoparte)}
          >
            {user.copartes.map(({ id_coparte, nombre }) => (
              <option key={id_coparte} value={id_coparte}>
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
            <option value="0" disabled>
              Selecciona usuario
            </option>
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
            disabled={Boolean(idProyecto)}
          >
            <option value="1">Estipendio</option>
            <option value="2">Única ministración</option>
            <option value="3">Varias Ministraciones</option>
            <option value="4">Multi anual</option>
          </select>
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
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion Rubros */}
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Rubros presupuestales</h4>
        </div>
        {modoEditar && (
          <div className="col-12 col-lg-4 mb-3">
            <div className="mb-3">
              <label className="form-label">Rubro</label>
              <select
                className="form-control"
                onChange={handleChangeRubro}
                name="id_rubro"
                value={formaRubros.id_rubro}
                // disabled={!modoEditar}
              >
                <option value="0" disabled>
                  Selecciona uno
                </option>
                {rubrosNoSeleccionados().map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Monto</label>
              <input
                className="form-control"
                type="text"
                placeholder="monto"
                onChange={handleChangeRubro}
                name="f_monto"
                value={formaRubros.f_monto}
                // disabled={!modoEditar}
              />
            </div>
            <div className="text-end">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={agregarRubro}
                disabled={!modoEditar}
              >
                Agregar +
              </button>
            </div>
          </div>
        )}
        <div className="col-12 col-md table-responsive mb-3">
          <label className="form-label">Rubros Seleccionados</label>
          <table className="table">
            <thead className="table-light">
              <tr>
                <th>Rubro</th>
                <th>Monto</th>
                {modoEditar && (
                  <th>
                    <i className="bi bi-trash"></i>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {estadoForma.rubros.map(({ id, id_rubro, nombre, f_monto }) => (
                <tr key={id_rubro}>
                  <td>{nombre}</td>
                  <td>{f_monto}</td>
                  {modoEditar && (
                    <td>
                      {!id && (
                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={() => quitarRubro(id_rubro)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion Ministraciones */}
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Ministraciones</h4>
        </div>
        {modoEditar && (
          <div className="col-12 col-lg-4 mb-3">
            <div className="mb-3">
              <label className="form-label">Número</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeMinistracion}
                name="i_numero"
                value={formaMinistracion.i_numero}
                // disabled={estadoForma.i_tipo_financiamiento <= 2}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Monto</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeMinistracion}
                name="f_monto"
                value={
                  estadoForma.i_tipo_financiamiento <= 2
                    ? estadoForma.f_monto_total
                    : formaMinistracion.f_monto
                }
                disabled={estadoForma.i_tipo_financiamiento <= 2}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Grupo</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeMinistracion}
                name="i_grupo"
                value={formaMinistracion.i_grupo}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha de rececpión</label>
              <input
                className="form-control"
                type="date"
                onChange={handleChangeMinistracion}
                name="dt_recepcion"
                value={formaMinistracion.dt_recepcion}
              />
            </div>
            <div className="text-end">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={agregarMinistracion}
                disabled={
                  estadoForma.i_tipo_financiamiento <= 2 &&
                  estadoForma.ministraciones.length > 0
                }
              >
                Agregar +
              </button>
            </div>
          </div>
        )}
        <div className="col-12 col-md table-responsive mb-3">
          <label className="form-label">
            Ministraciones{" "}
            {modalidad === "CREAR" ? "a registrar" : "registradas"}
          </label>
          <table className="table">
            <thead className="table-light">
              <tr>
                <th>Número</th>
                <th>Monto</th>
                <th>Grupo</th>
                <th>Fecha de recepción</th>
                {modoEditar && (
                  <th>
                    <i className="bi bi-trash"></i>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {estadoForma.ministraciones.map(
                ({ id, i_numero, f_monto, i_grupo, dt_recepcion }) => (
                  <tr key={i_numero}>
                    <td>{i_numero}</td>
                    <td>{f_monto}</td>
                    <td>{i_grupo}</td>
                    <td>{inputDateAformato(dt_recepcion)}</td>
                    {modoEditar && (
                      <td>
                        {!id && (
                          <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() => quitarMinistracion(i_numero)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
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
      {modalidad === "EDITAR" && (
        <>
          {/* Seccion Colaboradores */}
          <div className="row mb-5">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h2 className="color1 mb-0">Colaboradores</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  router.push(`/proyectos/${idProyecto}/colaboradores/registro`)
                }
              >
                Registrar +
              </button>
            </div>
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Servicio</th>
                    <th>Teléfono</th>
                    <th>RFC</th>
                    <th>CLABE</th>
                    <th>Banco</th>
                    <th>Monto total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoForma.colaboradores.map(
                    ({
                      id,
                      nombre,
                      apellido_paterno,
                      tipo,
                      nombre_servicio,
                      telefono,
                      rfc,
                      clabe,
                      banco,
                      f_monto_total,
                    }) => (
                      <tr key={id}>
                        <td>
                          {nombre} {apellido_paterno}
                        </td>
                        <td>{tipo}</td>
                        <td>{nombre_servicio}</td>
                        <td>{telefono}</td>
                        <td>{rfc}</td>
                        <td>{clabe}</td>
                        <td>{banco}</td>
                        <td>{f_monto_total}</td>
                        <td>
                          <button
                            className="btn btn-dark"
                            onClick={() =>
                              router.push(
                                `/proyectos/${idProyecto}/colaboradores/${id}`
                              )
                            }
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h2 className="color1 mb-0">Proveedores</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  router.push(`/proyectos/${idProyecto}/proveedores/registro`)
                }
              >
                Registrar +
              </button>
            </div>
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Servicio</th>
                    <th>Teléfono</th>
                    <th>RFC</th>
                    <th>CLABE</th>
                    <th>Banco</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoForma.proveedores.map(
                    ({
                      id,
                      nombre,
                      tipo,
                      descripcion_servicio,
                      telefono,
                      rfc,
                      clabe,
                      banco,
                    }) => (
                      <tr key={id}>
                        <td>{nombre}</td>
                        <td>{tipo}</td>
                        <td>{descripcion_servicio}</td>
                        <td>{telefono}</td>
                        <td>{rfc}</td>
                        <td>{clabe}</td>
                        <td>{banco}</td>
                        <td>
                          <button
                            className="btn btn-dark"
                            onClick={() =>
                              router.push(
                                `/proyectos/${idProyecto}/proveedores/${id}`
                              )
                            }
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </RegistroContenedor>
  )
}

export { FormaProyecto }
