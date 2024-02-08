import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerProveedores,
  obtenerProyectos,
} from "@assets/utils/common"
import { ProveedorProyecto, ProyectoMin } from "@models/proyecto.model"
import { BtnAccion, BtnNeutro } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import { Banner, estadoInicialBanner, mensajesBanner } from "@components/Banner"

const Proveedores = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [proveedoresDB, setProveedoresDB] = useState<ProveedorProyecto[]>([])
  const [proveedorAeliminar, setProveedorAEliminar] = useState<number>(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)

  useEffect(() => {
    cargarProyectosUsuario()
  }, [])

  useEffect(() => {
    cargarProveedores()
  }, [selectProyecto])

  const cargarProyectosUsuario = async () => {
    const reProyectos = await obtenerProyectos({ id_responsable: user.id })
    if (reProyectos.error) {
      console.log(reProyectos.data)
      setShowBanner({
        mensaje: mensajesBanner.fallaApi,
        show: true,
        tipo: "error",
      })
    } else {
      const proyectosDB = reProyectos.data as ProyectoMin[]
      if (!proyectosDB.length) {
        setShowBanner({
          mensaje: mensajesBanner.sinProyectos,
          show: true,
          tipo: "warning",
        })
      } else {
        setProyectosDB(proyectosDB)
        if (proyectosDB.length == 1) {
          setSelectProyecto(proyectosDB[0].id || 0)
        }
      }
    }

    setIsLoading(false)
  }

  const cargarProveedores = async () => {
    if (!selectProyecto) return

    setIsLoading(true)

    const reProveedores = await obtenerProveedores(selectProyecto)
    if (reProveedores.error) {
      console.log(reProveedores.data)
      setShowBanner({
        mensaje: mensajesBanner.fallaApi,
        show: true,
        tipo: "error",
      })
    } else {
      const proveedoresDB = reProveedores.data as ProveedorProyecto[]
      setProveedoresDB(proveedoresDB)
    }

    setIsLoading(false)
  }

  const abrirModalEliminarProveedor = (id: number) => {
    setProveedorAEliminar(id)
    setShowModalEliminar(true)
  }

  const eliminarProveedor = async () => {
    setProveedorAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/proveedores/${proveedorAeliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      await cargarProveedores()
    }

    setIsLoading(false)
  }

  const cancelarEliminarProveedor = () => {
    setProveedorAEliminar(0)
    setShowModalEliminar(false)
  }

  const proveedoresFiltrados = proveedoresDB.filter(({ nombre, email }) => {
    const query = inputBusqueda.toLocaleLowerCase()
    return (
      aMinuscula(nombre).includes(query) || aMinuscula(email).includes(query)
    )
  })

  const determinarNombreProveedorAEliminar = (): string => {
    const proveedorMatch = proveedoresDB.find(
      (proveedor) => proveedor.id === proveedorAeliminar
    )
    return proveedorMatch
      ? `${proveedorMatch.nombre} ${proveedorMatch.nombre}`
      : ""
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
        <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
          <BtnNeutro
            texto="Registrar +"
            onclick={() => router.push("/proveedores/registro")}
            margin={false}
            width={true}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3">
          <select
            className="form-control"
            onChange={({ target: { value } }) =>
              setSelectProyecto(Number(value))
            }
            value={selectProyecto}
          >
            <option value="0" disabled>
              Selecciona proyecto
            </option>
            {proyectosDB.map(({ id, id_alt, nombre }) => (
              <option key={id} value={id}>
                {nombre} - {id_alt}
              </option>
            ))}
          </select>
        </div>
        <div className="d-none d-xl-block col mb-3"></div>
        <div className="col-12 col-lg-5 col-xl-4 mb-3">
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
        {!proveedoresDB.length ? (
          <div className="col-12">
            <Banner
              tipo="warning"
              mensaje="El proyecto seleccionado no cuneta con proveedores registrados"
            />
          </div>
        ) : (
          <div className="col-12 table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#id</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Servicio</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((proveedor) => {
                  const {
                    id,
                    id_proyecto,
                    nombre,
                    tipo,
                    descripcion_servicio,
                    email,
                    telefono,
                  } = proveedor

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{nombre}</td>
                      <td>{tipo}</td>
                      <td>{descripcion_servicio}</td>
                      <td>{email}</td>
                      <td>{telefono}</td>
                      <td>
                        <div className="d-flex">
                          <BtnAccion
                            margin={false}
                            icono="bi-eye-fill"
                            onclick={() =>
                              router.push(
                                `/proyectos/${id_proyecto}/proveedores/${id}`
                              )
                            }
                            title="ver detalle"
                          />
                          {user.id_rol != 3 && (
                            <BtnAccion
                              margin="l"
                              icono="bi-x-circle"
                              onclick={() => abrirModalEliminarProveedor(id)}
                              title="eliminar proveedor"
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
        )}
      </div>
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarProveedor}
        cancelar={cancelarEliminarProveedor}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al proveedor{" "}
          {determinarNombreProveedorAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Proveedores
