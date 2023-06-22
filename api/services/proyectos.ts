import { ProyectoDB } from "@api/db/proyectos"
import { ColaboradorServices } from "@api/services/colaboradores"
import { ProveedorServices } from "@api/services/proveedores"
import { RespuestaController } from "@api/utils/response"
import {
  Proyecto,
  RubroProyecto,
  MinistracionProyecto,
  ColaboradorProyecto,
  ProveedorProyecto,
} from "@models/proyecto.model"
import { ResProyectoDB } from "@api/models/proyecto.model"
import { epochAFecha } from "@assets/utils/common"
import { ResDB } from "@api/models/respuestas.model"

class ProyectosServices {
  static async obtenerVMin(id_proyecto?: number) {
    const re = await ProyectoDB.obtenerVMin(id_proyecto)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        re.data
      )
    }

    return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
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

  static async obtener(id_coparte: number, id_proyecto?: number, min = false) {
    if (min) return await this.obtenerVMin(id_proyecto)
    try {
      const obtenerDB = await ProyectoDB.obtener(id_coparte, id_proyecto)
      if (obtenerDB.error) throw obtenerDB.data

      const proyectosDB = obtenerDB.data as ResProyectoDB[]

      const dataTransformada: Proyecto[] = await Promise.all(
        proyectosDB.map(async (proyecto) => {
          const {
            id,
            id_financiador,
            financiador,
            id_coparte,
            id_responsable,
            id_alt,
            f_monto_total,
            i_tipo_financiamiento,
            i_beneficiados,
            dt_registro,
            nombre_responsable,
          } = proyecto

          let rubros: RubroProyecto[] = null
          let ministraciones: MinistracionProyecto[] = null
          let colaboradores: ColaboradorProyecto[] = null
          let proveedores: ProveedorProyecto[] = null

          if (id_proyecto) {
            const reRubros = ProyectoDB.obtenerRubros(id_proyecto)
            const reMinistraciones =
              ProyectoDB.obtenerMinistraciones(id_proyecto)
            const reColaboradores = ColaboradorServices.obtener(id_proyecto, 0)
            const reProveedores = ProveedorServices.obtener(id_proyecto, 0)

            const resCombinadas = await Promise.all([
              reRubros,
              reMinistraciones,
              reColaboradores,
              reProveedores,
            ])

            for (const rc of resCombinadas) {
              if (rc.error) throw rc.data
            }

            rubros = resCombinadas[0].data as RubroProyecto[]
            ministraciones = resCombinadas[1].data as MinistracionProyecto[]
            colaboradores = resCombinadas[2].data as ColaboradorProyecto[]
            proveedores = resCombinadas[3].data as ProveedorProyecto[]
          }

          return {
            id,
            id_coparte,
            id_alt,
            f_monto_total,
            i_tipo_financiamiento,
            tipo_financiamiento: this.obtenerTipoFinanciamiento(
              i_tipo_financiamiento
            ),
            i_beneficiados,
            dt_registro_epoch: dt_registro,
            dt_registro: epochAFecha(dt_registro),
            financiador: {
              id: id_financiador,
              nombre: financiador,
            },
            responsable: {
              id: id_responsable,
              nombre: nombre_responsable,
            },
            rubros,
            ministraciones,
            colaboradores,
            proveedores,
          }
        })
      )

      return RespuestaController.exitosa(
        200,
        "Consulta exitosa",
        dataTransformada
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores",
        error
      )
    }
  }

  static async crear(data: Proyecto) {
    try {
      const { rubros, ministraciones } = data
      const cr = await ProyectoDB.crear(data)
      if (cr.error) throw cr.data

      // @ts-ignore
      const idInsertado = cr.data.insertId

      const promesas: Promise<ResDB>[] = []

      for (const rubro of rubros) {
        promesas.push(ProyectoDB.crearRubro(idInsertado, rubro))
      }

      for (const ministracion of ministraciones) {
        promesas.push(ProyectoDB.crearMinistracion(idInsertado, ministracion))
      }

      const resCombinadas = await Promise.all(promesas)
      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(201, "Proyecto creado con éxito", {
        idInsertado,
      })
    } catch (error) {
      return RespuestaController.fallida(400, "Error al crear proyecto", error)
    }
  }

  static async actualizar(id_proyecto: number, data: Proyecto) {
    try {
      const { rubros, ministraciones } = data

      const promesas: Promise<ResDB>[] = []

      promesas.push(ProyectoDB.actualizar(id_proyecto, data))
      // promesas.push(ProyectoDB.limpiarRubros(id_proyecto))

      for (const rubro of rubros) {
        if (rubro.id) {
          // promesas.push(ProyectoDB.actualizarRubro(rubro))
        } else {
          promesas.push(ProyectoDB.crearRubro(id_proyecto, rubro))
        }
      }

      for (const minis of ministraciones) {
        if (minis.id) {
          // promesas.push(ProyectoDB.actualizarMinistracion(minis))
        } else {
          promesas.push(ProyectoDB.crearMinistracion(id_proyecto, minis))
        }
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      return RespuestaController.exitosa(
        200,
        "Proyecto actualizado con éxito",
        null
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
}

export { ProyectosServices }
