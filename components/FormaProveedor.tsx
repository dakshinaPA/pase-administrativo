import { useEffect, useReducer, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  TablaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { obtenerProveedores, obtenerProyectos } from "@assets/utils/common"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { useSesion } from "@hooks/useSesion"
import { Banner, estadoInicialBanner, mensajesBanner } from "./Banner"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "HANDLE_CHANGE_DIRECCION"
  | "NO_EXTRANJERO"
  | "EXTRANJERO"

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
    case "EXTRANJERO":
      return {
        ...state,
        clabe: "",
        id_banco: 0,
        banco: "",
        rfc: "",
        direccion: {
          ...state.direccion,
          id_estado: 0,
        },
      }
    case "NO_EXTRANJERO":
      return {
        ...state,
        bank: "",
        bank_branch_address: "",
        account_number: "",
        bic_code: "",
        intermediary_bank: "",
        routing_number: "",
        direccion: {
          ...state.direccion,
          estado: "",
          pais: "",
        },
      }
    default:
      return state
  }
}

const FormaProveedor = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

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
    bank: "",
    bank_branch_address: "",
    account_number: "",
    bic_code: "",
    intermediary_bank: "",
    routing_number: "",
    descripcion_servicio: "",
    direccion: {
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      municipio: "",
      cp: "",
      id_estado: 0,
      estado: "",
      pais: "",
    },
  }

  const { estados, bancos } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const { error, validarCampos, formRef } = useErrores()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProveedor)
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)
  const modalidad = idProveedor ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    //el banco depende de los primero 3 digios de la clabe
    const matchBanco = bancos.find(
      (banco) => banco.clave === estadoForma.clabe.substring(0, 3)
    )

    dispatch({
      type: "HANDLE_CHANGE",
      payload: {
        name: "id_banco",
        value: matchBanco?.id || 0,
      },
    })
  }, [estadoForma.clabe])

  useEffect(() => {
    const type = estadoForma.i_tipo == 3 ? "EXTRANJERO" : "NO_EXTRANJERO"

    dispatch({
      type,
      payload: {},
    })
  }, [estadoForma.i_tipo])

  const cargarData = async () => {
    try {
      if (modalidad === "CREAR") {
        const reProyectos = await obtenerProyectosDB()
        if (reProyectos.error) throw reProyectos

        const proyectosDB = reProyectos.data as ProyectoMin[]
        if (!proyectosDB.length) {
          setShowBanner({
            mensaje: mensajesBanner.sinProyectos,
            show: true,
            tipo: "warning",
          })
        } else {
          setProyectosDB(proyectosDB)
          dispatch({
            type: "HANDLE_CHANGE",
            payload: {
              name: "id_proyecto",
              value: proyectosDB[0]?.id || 0,
            },
          })
        }
      } else {
        const reProveedor = await obtenerProveedores(null, idProveedor)
        if (reProveedor.error) throw reProveedor

        const proveedor = reProveedor.data[0] as ProveedorProyecto
        dispatch({
          type: "CARGA_INICIAL",
          payload: proveedor,
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
    let { name, value } = ev.target

    if (name == "rfc_organizacion") name = "rfc"
    if (error.campo === name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const validarForma = () => {
    const campos = {
      id_proyecto: estadoForma.id_proyecto,
      proveedor: estadoForma.nombre,
      clabe: estadoForma.clabe,
      id_banco: estadoForma.id_banco,
      rfc: estadoForma.rfc,
      rfc_organizacion: estadoForma.rfc,
      bank: estadoForma.bank,
      bank_branch_address: estadoForma.bank_branch_address,
      account_number: estadoForma.account_number,
      bic_code: estadoForma.bic_code,
      email: estadoForma.email,
      telefono: estadoForma.telefono,
      descripcion_servicio: estadoForma.descripcion_servicio,
      calle: estadoForma.direccion.calle,
      numero_ext: estadoForma.direccion.numero_ext,
      colonia: estadoForma.direccion.colonia,
      municipio: estadoForma.direccion.municipio,
      cp: estadoForma.direccion.cp,
      id_estado: estadoForma.direccion.id_estado,
      pais: estadoForma.direccion.pais,
    }

    if (estadoForma.i_tipo == 3) {
      delete campos.clabe
      delete campos.id_banco
      delete campos.rfc
      delete campos.rfc_organizacion
      delete campos.id_estado
    } else {
      delete campos.bank
      delete campos.bank_branch_address
      delete campos.account_number
      delete campos.bic_code
      delete campos.pais

      if (estadoForma.i_tipo == 1) {
        delete campos.rfc_organizacion
      } else {
        delete campos.rfc
      }
    }

    // console.log(campos)
    return validarCampos(campos)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
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
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (showBanner.show) {
    return (
      <Contenedor>
        <Banner tipo={showBanner.tipo} mensaje={showBanner.mensaje} />
      </Contenedor>
    )
  }
  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Proveedor</h2>
            )}
          </div>
          {!modoEditar &&
            idProveedor &&
            user.id == estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Proyecto</label>
          {modalidad === "CREAR" ? (
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
          ) : (
            <input
              className="form-control"
              type="text"
              value={estadoForma.proyecto}
              disabled
            />
          )}
          {error.campo == "id_proyecto" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "proveedor" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
            <option value="3">Extranjero</option>
          </select>
        </div>
        {estadoForma.i_tipo == 3 ? (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bank"
                value={estadoForma.bank}
                disabled={!modoEditar}
              />
              {error.campo == "bank" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Dirección del banco destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bank_branch_address"
                value={estadoForma.bank_branch_address}
                disabled={!modoEditar}
              />
              {error.campo == "bank_branch_address" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cuenta de destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="account_number"
                value={estadoForma.account_number}
                disabled={!modoEditar}
              />
              {error.campo == "account_number" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Código BIC/SWIFT</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bic_code"
                value={estadoForma.bic_code}
                disabled={!modoEditar}
              />
              {error.campo == "bic_code" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco Intermediario</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="intermediary_bank"
                value={estadoForma.intermediary_bank}
                disabled={!modoEditar}
              />
              {error.campo == "intermediary_bank" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Número de ruta</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="routing_number"
                value={estadoForma.routing_number}
                disabled={!modoEditar}
              />
              {error.campo == "routing_number" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        ) : (
          <>
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
              {error.campo == "clabe" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "id_banco" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">RFC</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name={estadoForma.i_tipo == 1 ? "rfc" : "rfc_organizacion"}
                value={estadoForma.rfc}
                disabled={!modoEditar}
              />
              {error.campo ==
                (estadoForma.i_tipo == 1 ? "rfc" : "rfc_organizacion") && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        )}
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
          {error.campo == "email" && <MensajeError mensaje={error.mensaje} />}
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
          {error.campo == "telefono" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">
            Descripción de la compra o servicio
          </label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="descripcion_servicio"
            value={estadoForma.descripcion_servicio}
            disabled={!modoEditar}
          />
          {error.campo == "descripcion_servicio" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "calle" && <MensajeError mensaje={error.mensaje} />}
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
          {error.campo == "numero_ext" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "colonia" && <MensajeError mensaje={error.mensaje} />}
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
          {error.campo == "municipio" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "cp" && <MensajeError mensaje={error.mensaje} />}
        </div>
        {estadoForma.i_tipo == 3 ? (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Estado</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
                name="estado"
                value={estadoForma.direccion.estado}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">País</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
                name="pais"
                value={estadoForma.direccion.pais}
                disabled={!modoEditar}
              />
              {error.campo == "pais" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        ) : (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
              name="id_estado"
              value={estadoForma.direccion.id_estado}
              disabled={!modoEditar}
            >
              <option value="0" disabled>
                Selecciona un estado
              </option>
              {estados.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
            {error.campo == "id_estado" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
        )}
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
