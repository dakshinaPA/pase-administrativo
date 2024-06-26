import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  Contenedor,
  RegistroContenedor,
  TablaContenedor,
} from "@components/Contenedores"
import {
  aMinuscula,
  cortarString,
  montoALocaleString,
  obtenerProyectos,
} from "@assets/utils/common"
import { Proyecto, QueriesProyecto } from "@models/proyecto.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { Banner, estadoInicialBanner, mensajesBanner } from "@components/Banner"
import { useSesion } from "@hooks/useSesion"
import { rolesUsuario } from "@assets/utils/constantes"
import { PieChart } from "@components/PieChart"
import { TooltipInfo } from "@components/Tooltip"

const Financiadores = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<Proyecto[]>([])
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)

  useEffect(() => {
    cargarData()
  }, [])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const cargarData = async () => {
    try {
      //setear copartes para filtrar si es admin o superu usuario
      let queries: QueriesProyecto = { min: false }

      if (user.id_rol == rolesUsuario.ADMINISTRADOR) {
        queries = { ...queries, id_admin: user.id }
      } else if (user.id_rol == rolesUsuario.COPARTE) {
        queries = { ...queries, id_responsable: user.id }
      }

      const reProyectos = await obtenerProyectos(queries)
      if (reProyectos.error) throw reProyectos

      const proyectos = reProyectos.data as Proyecto[]
      setProyectosDB(proyectos)
      if (!proyectos.length) {
        setShowBanner({
          mensaje: mensajesBanner.sinProyectos,
          show: true,
          tipo: "warning",
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

  const eliminarProyecto = async () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/proyectos/${idAEliminar}`
    )

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      await cargarData()
    }

    setIsLoading(false)
  }

  const cancelarEliminar = () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
  }

  const busquedaFiltrados = proyectosDB.filter(({ id_alt, nombre }) => {
    const query = aMinuscula(inputBusqueda)
    return (
      aMinuscula(id_alt).includes(query) || aMinuscula(nombre).includes(query)
    )
  })

  const determinarNombreAEliminar = (): string => {
    const proyecto = proyectosDB.find((proyecto) => proyecto.id === idAEliminar)
    return proyecto ? `${proyecto.id_alt} - ${proyecto.nombre}` : ""
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

  if (user.id_rol == rolesUsuario.COPARTE) {
    return (
      <RegistroContenedor>
        {proyectosDB.map(({ id, id_coparte, nombre, id_alt, saldo }) => {
          return (
            <div key={id_alt} className="row mb-5 proyecto-card">
              <div className="col-12 bg2 py-3 mb-3">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-8">
                    <h4 className="mb-0 color4">
                      {cortarString(nombre, 50)} - {id_alt}
                    </h4>
                  </div>
                  <div className="col-12 col-md-6 col-lg-4 text-end">
                    <LinkAccion
                      margin={false}
                      icono="bi-eye-fill"
                      ruta={`/proyectos/${id}`}
                      title="ver detalle"
                    />
                    <LinkAccion
                      margin="l"
                      icono="bi-ui-checks"
                      ruta={`/proyectos/${id}/solicitudes-presupuesto/registro`}
                      title="registrar solicitud"
                    />
                    <LinkAccion
                      margin="l"
                      icono="bi-person-plus"
                      ruta={`/proyectos/${id}/colaboradores/registro`}
                      title="registrar colaborador"
                    />
                    <LinkAccion
                      margin="l"
                      icono="bi-person-plus-fill"
                      ruta={`/proyectos/${id}/proveedores/registro`}
                      title="registrar proveedor"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td>Solicitado transferido</td>
                      <td className="text-end">
                        {montoALocaleString(saldo.f_transferido)}
                      </td>
                    </tr>
                    <tr>
                      <td>Impuestos</td>
                      <td className="text-end">
                        {montoALocaleString(saldo.f_retenciones)}
                      </td>
                    </tr>
                    <tr>
                      <td>35% ISR</td>
                      <td className="text-end">
                        {montoALocaleString(saldo.f_isr)}
                      </td>
                    </tr>
                    <tr>
                      <td>Pase administrativo</td>
                      <td className="text-end">
                        {montoALocaleString(saldo.f_pa)}
                      </td>
                    </tr>
                    <tr>
                      <td>Reintegros</td>
                      <td className="text-end">
                        - {montoALocaleString(saldo.f_reintegros)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <hr className="my-0" />
                      </td>
                    </tr>
                    <tr>
                      <th className="color1">Total ejecutado</th>
                      <td className="text-end fw-bold color1">
                        {montoALocaleString(saldo.f_ejecutado)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th className="color1">Financiamiento</th>
                      <td className="text-end fw-bold color1">
                        {montoALocaleString(saldo.f_monto_total)}
                      </td>
                    </tr>
                    <tr>
                      <th className="color1">Disponible</th>
                      <td
                        className={`text-end fw-bold ${
                          saldo.f_remanente < 0 ? "color-red" : "color3"
                        }`}
                      >
                        {montoALocaleString(saldo.f_remanente)}
                      </td>
                    </tr>
                    <tr>
                      <th className="color1">
                        <span className="me-1">Por comprobar</span>
                        <TooltipInfo texto="con base a este monto se calcula el 35% ISR" />
                      </th>
                      <td className="text-end color-warning">
                        {montoALocaleString(saldo.f_por_comprobar)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-12 col-lg-4 mb-3 text-center">
                <h6 className="mb-3 color1 fw-bold">Avance</h6>
                <PieChart lado={150} porcentaje={saldo.p_avance} />
              </div>
            </div>
          )
        })}
      </RegistroContenedor>
    )
  }

  //totales
  let totalFinanciamiento = 0
  let totalTransferido = 0
  let totalComprobado = 0
  let totalXComprobar = 0
  let totalIsr = 0
  let totalRetenciones = 0
  let totalPa = 0
  let totalEjecutado = 0
  let totalRemanente = 0

  for (const { saldo } of busquedaFiltrados) {
    totalFinanciamiento += saldo.f_monto_total
    totalTransferido += saldo.f_transferido
    totalComprobado += saldo.f_comprobado
    totalXComprobar += saldo.f_por_comprobar
    totalIsr += saldo.f_isr
    totalRetenciones += saldo.f_retenciones
    totalPa += saldo.f_pa
    totalEjecutado += saldo.f_ejecutado
    totalRemanente += saldo.f_remanente
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
          <BtnNeutro
            texto="Registrar +"
            onclick={() => router.push("/proyectos/registro")}
            margin={false}
            width={true}
          />
        </div>
        <div className="d-none d-lg-block col mb-3"></div>
        <div className="col-12 col-sm-6 col-xl-4 mb-2">
          <div className="input-group">
            <input
              type="text"
              name="busqueda"
              className="form-control"
              placeholder="Buscar registro"
              value={inputBusqueda}
              onChange={({ target: { value } }) => setInputBusqueda(value)}
            />
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-sm">
            <thead className="table-light">
              <tr className="color1">
                <th>#id</th>
                <th>Alt id</th>
                <th>Nombre</th>
                <th>Responsable</th>
                <th>Coparte</th>
                <th>Administrador</th>
                <th>Financiamiento</th>
                <th>Transferido</th>
                <th>Comprobado</th>
                <th>Por comprobar</th>
                <th>ISR (35%)</th>
                <th>Retenciones</th>
                <th>PA</th>
                <th>Total ejecutado</th>
                <th>Remanente</th>
                <th>Avance</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-light">
                <td className="fw-bold" colSpan={6}>
                  Totales
                </td>
                <td className="fw-bold">
                  {montoALocaleString(totalFinanciamiento)}
                </td>
                <td className="fw-bold">
                  {montoALocaleString(totalTransferido)}
                </td>
                <td className="fw-bold">
                  {montoALocaleString(totalComprobado)}
                </td>
                <td className="fw-bold">
                  {montoALocaleString(totalXComprobar)}
                </td>
                <td className="fw-bold">{montoALocaleString(totalIsr)}</td>
                <td className="fw-bold">
                  {montoALocaleString(totalRetenciones)}
                </td>
                <td className="fw-bold">{montoALocaleString(totalPa)}</td>
                <td className="fw-bold">
                  {montoALocaleString(totalEjecutado)}
                </td>
                <td className="fw-bold">
                  {montoALocaleString(totalRemanente)}
                </td>
                <td colSpan={2}></td>
              </tr>
              {busquedaFiltrados.map((proyecto) => {
                const {
                  id,
                  id_alt,
                  nombre,
                  administrador,
                  saldo,
                  responsable,
                  coparte,
                } = proyecto

                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{id_alt}</td>
                    <td>{nombre}</td>
                    <td>{responsable}</td>
                    <td>{coparte}</td>
                    <td>{administrador}</td>
                    <td>{montoALocaleString(saldo.f_monto_total)}</td>
                    <td>{montoALocaleString(saldo.f_transferido)}</td>
                    <td>{montoALocaleString(saldo.f_comprobado)}</td>
                    <td>{montoALocaleString(saldo.f_por_comprobar)}</td>
                    <td>{montoALocaleString(saldo.f_isr)}</td>
                    <td>{montoALocaleString(saldo.f_retenciones)}</td>
                    <td>{montoALocaleString(saldo.f_pa)}</td>
                    <td>{montoALocaleString(saldo.f_ejecutado)}</td>
                    <td
                      className={saldo.f_remanente < 0 ? "color-red" : "color3"}
                    >
                      {montoALocaleString(saldo.f_remanente)}
                    </td>
                    <td>{`${saldo.p_avance}%`}</td>
                    <td>
                      <div className="d-flex">
                        <LinkAccion
                          margin={false}
                          icono="bi-eye-fill"
                          ruta={`/proyectos/${id}`}
                          title="ver detalle"
                        />
                        {user.id_rol == rolesUsuario.SUPER_USUARIO && (
                          <BtnAccion
                            margin="l"
                            icono="bi-x-circle"
                            onclick={() => abrirModalEliminar(id)}
                            title="eliminar proyecto"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarProyecto}
        cancelar={cancelarEliminar}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al proyecto {determinarNombreAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
