import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"
import { BtnAccion, BtnCancelar, BtnNeutro } from "./Botones"
import { useProyecto } from "@contexts/proyecto.context"
import { useCatalogos } from "@contexts/catalogos.context"
import { useEffect, useRef } from "react"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { fechaActualInputDate } from "@assets/utils/common"

const FormaMinistracion = () => {
  const {
    estadoForma,
    dispatch,
    setShowFormaMinistracion,
    formaMinistracion,
    setFormaMinistracion,
  } = useProyecto()
  const { rubros_presupuestales } = useCatalogos()

  const inputNumero = useRef(null)
  const inputGrupo = useRef(null)
  const inputDtRecepcion = useRef(null)
  const selectRubro = useRef(null)
  const formMinistracion = useRef(null)
  const tableRubros = useRef(null)

  useEffect(() => {
    formMinistracion.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [])

  useEffect(() => {
    agregarRubro()
  }, [formaMinistracion.id_rubro])

  const handleChangeMinistracion = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaMinistracion((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const agregarRubro = () => {
    const idRubro = formaMinistracion.id_rubro
    const matchRubro = rubros_presupuestales.find((rp) => rp.id == idRubro)
    if (!matchRubro) {
      console.log(matchRubro)
      return
    }

    setFormaMinistracion((prevState) => ({
      ...prevState,
      id_rubro: 0,
      rubros_presupuestales: [
        ...prevState.rubros_presupuestales,
        {
          id_rubro: matchRubro.id,
          rubro: matchRubro.nombre,
          f_monto: 0,
        },
      ],
    }))

    tableRubros.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const actualizarMontoRubro = (monto: string, id_rubro: number) => {
    const indexRubro = formaMinistracion.rubros_presupuestales.findIndex(
      (rp) => rp.id_rubro == id_rubro
    )
    if (indexRubro < 0) {
      console.log(indexRubro)
      return
    }

    const nuevosRubros = [...formaMinistracion.rubros_presupuestales]
    nuevosRubros[indexRubro] = {
      ...nuevosRubros[indexRubro],
      f_monto: monto,
    }

    setFormaMinistracion((prevState) => ({
      ...prevState,
      rubros_presupuestales: nuevosRubros,
    }))
  }

  const quitarRubro = (id_rubro: number) => {
    const listaFiltrada = formaMinistracion.rubros_presupuestales.filter(
      (rubro) => rubro.id_rubro != id_rubro
    )

    setFormaMinistracion((prevstate) => ({
      ...prevstate,
      rubros_presupuestales: listaFiltrada,
    }))
  }

  const cerrarForma = () => {
    setShowFormaMinistracion(false)
  }

  const validarForma = () => {
    if (!Number(formaMinistracion.i_numero)) {
      inputNumero.current.focus()
      return false
    }

    if (!Number(formaMinistracion.i_grupo)) {
      inputGrupo.current.focus()
      return false
    }

    if (!formaMinistracion.dt_recepcion) {
      inputDtRecepcion.current.focus()
      return false
    }

    if (!formaMinistracion.rubros_presupuestales.length) {
      selectRubro.current.focus()
      return false
    }

    try {
      //validar que haya cantidades validas en los inputs
      formaMinistracion.rubros_presupuestales.forEach((rubro, index) => {
        if (!Number(rubro.f_monto)) throw index
      })
    } catch (index) {
      const input =
        tableRubros.current.querySelectorAll("input[type=text]")[index]
      input.focus()
      return false
    }

    return true
  }

  const handleAgregar = () => {
    if (!validarForma()) return

    dispatch({
      type: "AGREGAR_MINISTRACION",
      payload: formaMinistracion,
    })

    cerrarForma()
  }

  const handleGuardar = async () => {
    if (!validarForma()) return

    const nuevaListaMinistraciones = estadoForma.ministraciones.map((min) => {
      if (min.id == formaMinistracion.id) {
        return formaMinistracion
      }
      return min
    })

    dispatch({
      type: "ACTUALIZAR_MINISTRACIONES",
      payload: nuevaListaMinistraciones,
    })

    cerrarForma()
  }

  const rubrosNoSeleccionados = () => {
    const rubros: RubrosPresupuestalesDB[] = []
    const idsRubrosForma = formaMinistracion.rubros_presupuestales.map(
      ({ id_rubro }) => Number(id_rubro)
    )

    for (const rp of rubros_presupuestales) {
      if (!idsRubrosForma.includes(rp.id)) {
        rubros.push(rp)
      }
    }

    return rubros
  }

  // obligar al usuario a seleccionar como primera opcion el rubro de gestion financiera
  const RubroDefault = () => {
    const rubroGestion = rubros_presupuestales.find((rubro) => rubro.id == 1)
    if (!rubroGestion) return null

    return <option value={rubroGestion.id}>{rubroGestion.nombre}</option>
  }

  const sumaRubros = formaMinistracion.rubros_presupuestales.reduce(
    (acum, rp) => acum + Number(rp.f_monto),
    0
  )

  const disabledInputNumero =
    estadoForma.i_tipo_financiamiento <= 2 ||
    estadoForma.ministraciones.length > 0

  return (
    <div className="col-12 mb-3" ref={formMinistracion}>
      <div className="row py-3 rounded" style={{ backgroundColor: "#f6f6f6" }}>
        <div className="col-12 col-lg-4">
          <div className="mb-3">
            <label className="form-label">Número</label>
            <input
              className="form-control"
              type="text"
              onChange={handleChangeMinistracion}
              name="i_numero"
              value={formaMinistracion.i_numero}
              ref={inputNumero}
              disabled={disabledInputNumero}
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
              ref={inputGrupo}
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
              max={fechaActualInputDate()}
              ref={inputDtRecepcion}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rubro</label>
            <select
              className="form-control"
              name="id_rubro"
              value={formaMinistracion.id_rubro}
              onChange={handleChangeMinistracion}
              ref={selectRubro}
            >
              <option value="0" disabled>
                Selecciona rubro
              </option>
              {formaMinistracion.rubros_presupuestales.length > 0 ? (
                rubrosNoSeleccionados().map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))
              ) : (
                <RubroDefault />
              )}
            </select>
          </div>
        </div>
        <div className="col-12 col-lg mb-3 table-responsive">
          <label className="form-label">Rubros seleccionados</label>
          <table className="table" ref={tableRubros}>
            <thead>
              <tr>
                <th>Rubro</th>
                <th>Monto</th>
                <th>
                  <i className="bi bi-trash"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {formaMinistracion.rubros_presupuestales.map(
                ({ id_rubro, rubro, f_monto }, index) => (
                  <tr key={id_rubro}>
                    <td>{rubro}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={f_monto}
                        onChange={({ target: { value } }) =>
                          actualizarMontoRubro(value, id_rubro)
                        }
                      />
                    </td>
                    <td>
                      {id_rubro != 1 && (
                        <BtnAccion
                          margin={false}
                          icono="bi-x-circle"
                          onclick={() => quitarRubro(id_rubro)}
                          title="editar ministración"
                        />
                      )}
                    </td>
                  </tr>
                )
              )}
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={sumaRubros}
                    disabled
                  />
                </td>
                <td></td>
              </tr>
            </tbody>
            <tbody></tbody>
          </table>
        </div>
        <div className="col-12 d-flex justify-content-between">
          <BtnCancelar onclick={cerrarForma} margin={false} />
          {!formaMinistracion.id ? (
            <BtnNeutro
              margin={false}
              texto="Agregar ministración"
              width={false}
              onclick={handleAgregar}
            />
          ) : (
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={handleGuardar}
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { FormaMinistracion }
