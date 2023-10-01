import { ProyectoDB } from "@api/db/proyectos"
import { ColaboradorServices } from "./colaboradores"
import { ProveedorServices } from "./proveedores"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  MinistracionProyecto,
  ColaboradorProyecto,
  ProveedorProyecto,
  QueriesProyecto,
  RubroMinistracion,
  NotaProyecto,
} from "@models/proyecto.model"

import { ResProyectoDB } from "@api/models/proyecto.model"
import { epochAFecha } from "@assets/utils/common"
import { SolicitudesPresupuestoServices } from "./solicitudes-presupuesto"

class ProyectosServices {
  static async obtenerVMin(queries: QueriesProyecto) {
    try {
      const re = await ProyectoDB.obtenerVMin(queries)
      if (re.error) throw re.data

      return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static obtenerTipoFinanciamiento(i_tipo: number) {
    switch (i_tipo) {
      case 1:
        return "Estipendio"
      case 2:
        return "Única ministración"
      case 3:
        return "Varias ministraciones"
      case 4:
        return "Multi anual"
    }
  }

  static transformarDataProyecto = (data: ResProyectoDB): Proyecto => {
    const { id_proyecto_saldo, proveedores, ...resto } = data

    const f_monto_total = Number(data.f_monto_total)
    const f_solicitado = Number(data.f_solicitado)
    const f_comprobado = Number(data.f_comprobado)
    const f_transferido = Number(data.f_transferido)
    const f_retenciones = Number(data.f_retenciones)
    const f_pa = Number(data.f_pa)
    const p_avance = Number(data.p_avance)

    const f_por_comprobar = f_solicitado - f_comprobado
    const f_isr = f_por_comprobar * 0.35
    const f_ejecutado = f_transferido + f_retenciones + f_isr + f_pa
    const f_remanente = f_monto_total - f_ejecutado

    return {
      ...resto,
      tipo_financiamiento: this.obtenerTipoFinanciamiento(
        resto.i_tipo_financiamiento
      ),
      saldo: {
        id: id_proyecto_saldo,
        f_monto_total,
        f_solicitado,
        f_transferido,
        f_comprobado,
        f_por_comprobar,
        f_isr,
        f_remanente,
        p_avance,
        f_retenciones,
        f_ejecutado,
        f_pa,
      },
    }
  }

  static async obtener(queries: QueriesProyecto) {
    const { id, min } = queries

    if (min) return this.obtenerVMin(queries)
    if (id) return this.obtenerUno(id)
    try {
      const re = (await ProyectoDB.obtener(queries)) as ResProyectoDB[]

      const proyectos = re.map(this.transformarDataProyecto)

      return RespuestaController.exitosa(200, "Consulta exitosa", proyectos)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static async obtenerUno(id_proyecto: number) {
    try {
      const re = (await ProyectoDB.obtenerUno(id_proyecto)) as ResProyectoDB

      const {
        ministraciones,
        rubros_ministracion,
        colaboradores,
        proveedores,
        solicitudes,
        notas,
        ...dataProyecto
      } = re

      const ministracionesConRubros: MinistracionProyecto[] =
        ministraciones.map((ministracion) => {
          const rubros_presupuestales = rubros_ministracion.filter(
            (rb) => rb.id_ministracion == ministracion.id
          )

          //transformar los montos de los rubros a numero
          const dataTransformada = rubros_presupuestales.map((rp) => ({
            ...rp,
            f_monto: Number(rp.f_monto),
          }))

          return {
            ...ministracion,
            rubros_presupuestales: dataTransformada,
          }
        })

      const colaboradoresHyd = colaboradores.map((col) => ({
        ...col,
        tipo: ColaboradorServices.obtenerTipo(col.i_tipo),
      }))

      const proveedoresHyd = proveedores.map((prov) => ({
        ...prov,
        tipo: ProveedorServices.obtenerTipo(prov.i_tipo),
      }))

      const solicitudesHyd = solicitudes.map((sol) =>
        SolicitudesPresupuestoServices.trasnformarData(sol)
      )

      const proyecto: Proyecto = {
        ...this.transformarDataProyecto(dataProyecto),
        ministraciones: ministracionesConRubros,
        colaboradores: colaboradoresHyd,
        proveedores: proveedoresHyd,
        solicitudes_presupuesto: solicitudesHyd,
        notas,
      }

      return RespuestaController.exitosa(200, "Consulta exitosa", proyecto)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static async obtenerData(id_proyecto: number) {
    try {
      const reColaboradores = ColaboradorServices.obtener(id_proyecto)
      const reProveedores = ProveedorServices.obtener(id_proyecto)
      const rerubros = ProyectoDB.obtenerRubrosMinistraciones(id_proyecto)

      const resCombinadas = await Promise.all([
        reColaboradores,
        reProveedores,
        rerubros,
      ])

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const colaboradores = resCombinadas[0].data as ColaboradorProyecto[]
      const proveedores = resCombinadas[1].data as ProveedorProyecto[]
      const rubros_presupuestales = resCombinadas[2].data as RubroMinistracion[]

      return RespuestaController.exitosa(200, "Consulta exitosa", {
        colaboradores,
        proveedores,
        rubros_presupuestales,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener data del proyecto",
        error
      )
    }
  }

  static async crear(data: Proyecto) {
    try {
      const cr = await ProyectoDB.crear(data)

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear proyecto", error)
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const up = await ProyectoDB.actualizar(id_proyecto, data)

      return RespuestaController.exitosa(
        200,
        "Proyecto actualizado con éxito",
        up
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualziar proyecto",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await ProyectoDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(400, "Error al borrar proyecto", null)
    }
    return RespuestaController.exitosa(
      200,
      "Proyecto borrado con éxito",
      dl.data
    )
  }

  static async obtenerNotas(id_proyecto: number) {
    const re = await ProyectoDB.obtenerNotas(id_proyecto)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener notas del financiador",
        re.data
      )
    }

    let notas = re.data as NotaProyecto[]
    notas = notas.map((nota) => {
      return {
        ...nota,
        dt_registro: epochAFecha(nota.dt_registro),
      }
    })

    return RespuestaController.exitosa(200, "consulta exitosa", notas)
  }

  static async crearNota(id_proyecto: number, data: NotaProyecto) {
    const cr = await ProyectoDB.crearNota(id_proyecto, data)

    if (cr.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de proyecto",
        cr.data
      )
    }

    // @ts-ignore
    const idInsertado = cr.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de proyecto creada con éxito",
      { idInsertado }
    )
  }
}

export { ProyectosServices }
