import React, { use, useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { TablaContenedor } from "@components/Contenedores"
import {
  aMinuscula,
  montoALocaleString,
  obtenerCopartes,
  obtenerProyectos,
} from "@assets/utils/common"
import { Proyecto } from "@models/proyecto.model"
import { useAuth } from "@contexts/auth.context"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"

const Financiadores = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<Proyecto[]>([])
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [idAEliminar, setIdAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [selectCoparte, setSelectCoparte] = useState<number>(0)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarProyectosCoparte()
  }, [selectCoparte])

  const abrirModalEliminar = (id: number) => {
    setIdAEliminar(id)
    setShowModalEliminar(true)
  }

  const cargarData = async () => {
    setIsLoading(true)

    try {
      //setear copartes para filtrar si es admin o superu usuario
      if (user.id_rol != 3) {
        const queryCopartes: QueriesCoparte =
          user.id_rol == 2 ? { id_admin: user.id } : {}

        const reCopartes = await obtenerCopartes(queryCopartes)
        if (reCopartes.error) throw reCopartes.data

        const copartesDB = reCopartes.data as CoparteMin[]

        setCopartesDB(copartesDB)
        if (copartesDB.length == 1) {
          setSelectCoparte(copartesDB[0]?.id)
        }
      } else {
        //cargar proyecto de usuario coparte
        const reProyectos = await obtenerProyectos({
          id_responsable: user.id,
          min: false,
        })
        if (reProyectos.error) throw reProyectos.data

        setProyectosDB(reProyectos.data as Proyecto[])
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarProyectosCoparte = async () => {
    if (!selectCoparte) return

    setIsLoading(true)

    const reProyectos = await obtenerProyectos({
      id_coparte: selectCoparte,
      min: false,
    })
    if (reProyectos.error) {
      console.log(reProyectos.data)
    } else {
      setProyectosDB(reProyectos.data as Proyecto[])
    }

    setIsLoading(false)
  }

  const eliminarFinanciador = async () => {
    setIdAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/proyectos/${idAEliminar}`
    )

    if (error) {
      console.log(data)
    } else {
      // await cargarData()
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

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == 2 && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/proyectos/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {user.id_rol != 3 && (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3">
            <select
              className="form-control"
              value={selectCoparte}
              onChange={({ target }) => setSelectCoparte(Number(target.value))}
            >
              <option value="0" disabled>
                Selecciona coparte
              </option>
              {copartesDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="d-none d-lg-block col mb-3"></div>
        <div className="col-12 col-sm-6 col-lg-4 mb-2">
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
      {isLoading ? (
        <Loader />
      ) : (
        <div className="row">
          <div className="col-12 table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#id</th>
                  <th>Alt id</th>
                  <th>Nombre</th>
                  {user.id_rol != 3 && <th>Responsable</th>}
                  <th>Tipo financiamiento</th>
                  <th>Monto total</th>
                  <th>Solicitado</th>
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
                    f_monto_total,
                    saldo,
                    responsable,
                  } = proyecto

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{id_alt}</td>
                      <td>{nombre}</td>
                      {user.id_rol != 3 && <td>{responsable}</td>}
                      <td>{tipo_financiamiento}</td>
                      <td>{montoALocaleString(f_monto_total)}</td>
                      <td>{montoALocaleString(saldo.f_solicitado)}</td>
                      <td>{montoALocaleString(saldo.f_comprobado)}</td>
                      <td>{montoALocaleString(saldo.f_por_comprobar)}</td>
                      <td>{montoALocaleString(saldo.f_isr)}</td>
                      <td>{montoALocaleString(saldo.f_retenciones)}</td>
                      <td>{montoALocaleString(saldo.f_pa)}</td>
                      <td>{montoALocaleString(saldo.f_ejecutado)}</td>
                      <td>{montoALocaleString(saldo.f_remanente)}</td>
                      <td>{saldo.p_avance}</td>
                      <td>
                        <div className="d-flex">
                          <BtnAccion
                            margin={false}
                            icono="bi-eye-fill"
                            onclick={() =>
                              router.push(
                                `/copartes/${id_coparte}/proyectos/${id}`
                              )
                            }
                            title="ver detalle"
                          />
                          {user.id == id_responsable && (
                            <>
                              <BtnAccion
                                margin="l"
                                icono="bi-ui-checks"
                                onclick={() =>
                                  router.push(
                                    `/proyectos/${id}/solicitudes-presupuesto/registro`
                                  )
                                }
                                title="registrar solicitud"
                              />
                              <BtnAccion
                                margin="l"
                                icono="bi-person-plus"
                                onclick={() =>
                                  router.push(
                                    `/proyectos/${id}/colaboradores/registro`
                                  )
                                }
                                title="registrar colaborador"
                              />
                              <BtnAccion
                                margin="l"
                                icono="bi-person-plus-fill"
                                onclick={() =>
                                  router.push(
                                    `/proyectos/${id}/proveedores/registro`
                                  )
                                }
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
      )}
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarFinanciador}
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
