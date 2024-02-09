import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import {
  aMinuscula,
  montoALocaleString,
  obtenerProyectos,
} from "@assets/utils/common"
import { Proyecto, QueriesProyecto } from "@models/proyecto.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { Banner, estadoInicialBanner, mensajesBanner } from "@components/Banner"
import { useSesion } from "@hooks/useSesion"

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

      if (user.id_rol == 2) {
        queries = { ...queries, id_admin: user.id }
      } else if (user.id_rol == 3) {
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
    } catch ({ error, mensaje }) {
      console.log(error)
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

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol != 3 && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/proyectos/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
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
          <table className="table">
            <thead className="table-light">
              <tr className="color1">
                <th>#id</th>
                <th>Alt id</th>
                <th>Nombre</th>
                {user.id_rol != 3 && (
                  <>
                    <th>Responsable</th>
                    <th>Coparte</th>
                  </>
                )}
                <th>Tipo financiamiento</th>
                <th>Monto total</th>
                <th>Solicitado</th>
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
              {busquedaFiltrados.map((proyecto) => {
                const {
                  id,
                  id_alt,
                  nombre,
                  id_coparte,
                  id_responsable,
                  financiador,
                  tipo_financiamiento,
                  saldo,
                  responsable,
                  coparte,
                } = proyecto

                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{id_alt}</td>
                    <td>{nombre}</td>
                    {user.id_rol != 3 && (
                      <>
                        <td>{responsable}</td>
                        <td>{coparte}</td>
                      </>
                    )}
                    <td>{tipo_financiamiento}</td>
                    <td>{montoALocaleString(saldo.f_monto_total)}</td>
                    <td>{montoALocaleString(saldo.f_solicitado)}</td>
                    <td>{montoALocaleString(saldo.f_transferido)}</td>
                    <td>{montoALocaleString(saldo.f_comprobado)}</td>
                    <td>{montoALocaleString(saldo.f_por_comprobar)}</td>
                    <td>{montoALocaleString(saldo.f_isr)}</td>
                    <td>{montoALocaleString(saldo.f_retenciones)}</td>
                    <td>{montoALocaleString(saldo.f_pa)}</td>
                    <td>{montoALocaleString(saldo.f_ejecutado)}</td>
                    <td>{montoALocaleString(saldo.f_remanente)}</td>
                    <td>{`${saldo.p_avance}%`}</td>
                    <td>
                      <div className="d-flex">
                        <LinkAccion
                          margin={false}
                          icono="bi-eye-fill"
                          ruta={`/copartes/${id_coparte}/proyectos/${id}`}
                          title="ver detalle"
                        />
                        {user.id == id_responsable && (
                          <>
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
                          </>
                        )}
                        {user.id_rol == 1 && (
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
