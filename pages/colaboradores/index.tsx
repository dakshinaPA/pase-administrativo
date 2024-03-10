import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerColaboradores,
  obtenerProyectos,
} from "@assets/utils/common"
import { ColaboradorProyecto, ProyectoMin } from "@models/proyecto.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import { Banner, estadoInicialBanner, mensajesBanner } from "@components/Banner"

const Colaboradores = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [colaboradoresDB, setColaboradoresDB] = useState<ColaboradorProyecto[]>(
    []
  )
  const [colaboradorAeliminar, setColaboradorAEliminar] = useState<number>(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)

  useEffect(() => {
    cargarProyectosUsuario()
  }, [])

  useEffect(() => {
    cargarColaboradores()
  }, [selectProyecto])

  const cargarProyectosUsuario = async () => {
    const { error, data, mensaje } = await obtenerProyectos({
      id_responsable: user.id,
    })
    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      const proyectosDB = data as ProyectoMin[]
      setProyectosDB(proyectosDB)
      if (!proyectosDB.length) {
        setShowBanner({
          mensaje: mensajesBanner.sinProyectos,
          show: true,
          tipo: "warning",
        })
      } else if (proyectosDB.length == 1) {
        setSelectProyecto(proyectosDB[0].id || 0)
      }
    }

    setIsLoading(false)
  }

  const cargarColaboradores = async () => {
    if (!selectProyecto) return

    setIsLoading(true)

    const { error, data, mensaje } = await obtenerColaboradores(selectProyecto)
    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      const colaboradoresDB = data as ColaboradorProyecto[]
      setColaboradoresDB(colaboradoresDB)
    }

    setIsLoading(false)
  }

  const abrirModalEliminarColaborador = (id: number) => {
    setColaboradorAEliminar(id)
    setShowModalEliminar(true)
  }

  const eliminarColaborador = async () => {
    setColaboradorAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/colaboradores/${colaboradorAeliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      await cargarColaboradores()
    }

    setIsLoading(false)
  }

  const cancelarEliminarUsuario = () => {
    setColaboradorAEliminar(0)
    setShowModalEliminar(false)
  }

  const colaboradoresFiltrados = colaboradoresDB.filter(
    ({ nombre, apellido_paterno, apellido_materno, email }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(apellido_paterno).includes(query) ||
        aMinuscula(apellido_materno).includes(query) ||
        aMinuscula(email).includes(query)
      )
    }
  )

  const determinarNombreColaboradorAEliminar = (): string => {
    const colaboradorMatch = colaboradoresDB.find(
      (colaborador) => colaborador.id === colaboradorAeliminar
    )
    return colaboradorMatch
      ? `${colaboradorMatch.nombre} ${colaboradorMatch.nombre}`
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
            onclick={() => router.push("/colaboradores/registro")}
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
        {!colaboradoresDB.length ? (
          <div className="col-12">
            <Banner
              tipo="warning"
              mensaje="El proyecto seleccionado no cuenta con colaboradores registrados"
            />
          </div>
        ) : (
          <div className="col-12 table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr className="color1">
                  <th>#id</th>
                  <th>Id empleado</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Email</th>
                  <th>Clabe</th>
                  <th>Banco</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colaboradoresFiltrados.map((colaborador) => {
                  const {
                    id,
                    id_proyecto,
                    id_empleado,
                    nombre,
                    apellido_paterno,
                    tipo,
                    email,
                    clabe,
                    banco,
                    telefono,
                  } = colaborador

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{id_empleado}</td>
                      <td>
                        {nombre} {apellido_paterno}
                      </td>
                      <td>{tipo}</td>
                      <td>{email}</td>
                      <td>{clabe}</td>
                      <td>{banco}</td>
                      <td>{telefono}</td>
                      <td>
                        <div className="d-flex">
                          <LinkAccion
                            margin={false}
                            icono="bi-eye-fill"
                            ruta={`/colaboradores/${id}`}
                            title="ver detalle"
                          />
                          {user.id_rol != 3 && (
                            <BtnAccion
                              margin="l"
                              icono="bi-x-circle"
                              onclick={() => abrirModalEliminarColaborador(id)}
                              title="eliminar colaborador"
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
        aceptar={eliminarColaborador}
        cancelar={cancelarEliminarUsuario}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al colaborador{" "}
          {determinarNombreColaboradorAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Colaboradores
