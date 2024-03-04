import { useContext, useEffect, useRef, useState } from "react"
import { useCatalogos } from "@contexts/catalogos.context"
// import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"
import { BtnAccion, BtnCancelar, BtnNeutro } from "./Botones"
// import { useProyecto } from "@contexts/proyecto.context"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { fechaActualInputDate } from "@assets/utils/common"
import { ProyectoContext } from "./FormaProyecto"
import { useSesion } from "@hooks/useSesion"
import { MinistracionProyecto } from "@models/proyecto.model"
import {
  rubrosPresupuestales,
  tiposFinanciamiento,
} from "@assets/utils/constantes"

const FormaMinistracion = () => {
  // const {
  //   estadoForma,
  //   dispatch,
  //   setShowFormaMinistracion,
  //   formaMinistracion,
  //   setFormaMinistracion,
  // } = useProyecto()
  const { rubros_presupuestales } = useCatalogos()
  const { estado, modalidad, despachar } = useContext(ProyectoContext)

  // debugger
  // return

  const inputNumero = useRef(null)
  // const inputGrupo = useRef(null)
  const inputDtRecepcion = useRef(null)
  const selectRubro = useRef(null)
  const formMinistracion = useRef(null)
  const tableRubros = useRef(null)

  // useEffect(() => {
  //   formMinistracion.current.scrollIntoView({
  //     behavior: "smooth",
  //     block: "end",
  //   })
  // }, [])

  // useEffect(() => {
  //   agregarRubro()
  // }, [estado.formaMinistracion.estado.id_rubro])

  const handleChangeMinistracion = (ev: ChangeEvent) => {
    const { name, value } = ev.target
    const payload = { name, value }
    despachar("CHANGLE_FORMA_MINISTRACION", payload)
  }

  const agregarRubro = (ev: ChangeEvent) => {
    const idRubroSeleccionado = Number(ev.target.value)
    const match = rubros_presupuestales.find(
      (rp) => rp.id === idRubroSeleccionado
    )

    despachar("AGREGAR_RUBRO_MINISTRACION", match)

    // tableRubros.current.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // })
  }

  const actualizarMontoRubro = (f_monto: string, id_rubro: number) => {
    const payload = { f_monto, id_rubro }
    despachar("ACTUALIZAR_MONTO_RUBRO_MINISTRACION", payload)
  }

  const quitarRubro = (id_rubro: number) => {
    despachar("QUITAR_RUBRO_MINISTRACION", id_rubro)
  }

  const limpiarForma = () => {
    despachar("RECALCULAR_NUMERO_MINISTRACION")
  }

  const validarForma = () => {
    if (!Number(estado.formaMinistracion.estado.i_numero)) {
      inputNumero.current.focus()
      return false
    }
    // if (!Number(formaMinistracion.i_grupo)) {
    //   inputGrupo.current.focus()
    //   return false
    // }
    if (!estado.formaMinistracion.estado.dt_recepcion) {
      inputDtRecepcion.current.focus()
      return false
    }
    try {
      //validar que haya cantidades validas en los inputs
      estado.formaMinistracion.estado.rubros_presupuestales.forEach(
        (rubro, index) => {
          if (!Number(rubro.f_monto)) throw index
        }
      )
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
    despachar("AGREGAR_MINISTRACION")
  }

  const handleGuardar = async () => {
    if (!validarForma()) return

    despachar("ACTUALIZAR_MINISTRACION")

    // limpiarForma()
  }

  // obligar al usuario a seleccionar como primera opcion el rubro de gestion financiera
  // const RubroDefault = () => {
  //   const rubroGestion = rubros_presupuestales.find((rubro) => rubro.id == 1)
  //   if (!rubroGestion) return null

  //   return <option value={rubroGestion.id}>{rubroGestion.nombre}</option>
  // }

  const rubrosNoSeleccionados = rubros_presupuestales.filter(
    (rp) =>
      !estado.formaMinistracion.estado.rubros_presupuestales
        .map(({ id_rubro }) => id_rubro)
        .includes(rp.id)
  )

  const sumaRubros =
    estado.formaMinistracion.estado.rubros_presupuestales.reduce(
      (acum, rp) => acum + Number(rp.f_monto),
      0
    )

  const disabledInputNumero =
    estado.forma.i_tipo_financiamiento <=
      tiposFinanciamiento.UNICA_MINISTRACION ||
    estado.forma.ministraciones.length > 0

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
              value={estado.formaMinistracion.estado.i_numero}
              ref={inputNumero}
              disabled={disabledInputNumero}
            />
          </div>
          {/* <div className="mb-3">
            <label className="form-label">Grupo</label>
            <input
              className="form-control"
              type="text"
              onChange={handleChangeMinistracion}
              name="i_grupo"
              value={estado.formaMinistracion.estado.i_grupo}
              ref={inputGrupo}
            />
          </div> */}
          <div className="mb-3">
            <label className="form-label">Fecha de rececpión</label>
            <input
              className="form-control"
              type="date"
              onChange={handleChangeMinistracion}
              name="dt_recepcion"
              value={estado.formaMinistracion.estado.dt_recepcion}
              max={fechaActualInputDate()}
              ref={inputDtRecepcion}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rubro</label>
            <select
              className="form-control"
              name="id_rubro"
              value={estado.formaMinistracion.estado.id_rubro}
              onChange={agregarRubro}
              ref={selectRubro}
            >
              <option value="0" disabled>
                Selecciona rubro
              </option>
              {rubrosNoSeleccionados.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
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
              {estado.formaMinistracion.estado.rubros_presupuestales.map(
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
                      {id_rubro != rubrosPresupuestales.GESTION_FINANCIERA && (
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
        {!estado.formaMinistracion.estado.id ? (
          <div className="col-12 text-end">
            <BtnNeutro
              margin={false}
              texto="Agregar presupuesto"
              width={false}
              onclick={handleAgregar}
            />
          </div>
        ) : (
          <div className="col-12 d-flex justify-content-between">
            <BtnCancelar onclick={limpiarForma} margin={false} />
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={handleGuardar}
            >
              Actualizar presupuesto
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { FormaMinistracion }
