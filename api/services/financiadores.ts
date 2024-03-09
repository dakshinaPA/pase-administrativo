import { FinanciadorDB } from "@api/db/financiadores"
import { RespuestaController } from "@api/utils/response"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { ResFinanciadorDB } from "@api/models/financiador.model"
import { epochAFecha } from "@assets/utils/common"

class FinanciadoresServices {
  static obtenerTipo(id_tipo: 1 | 2) {
    switch (id_tipo) {
      case 1:
        return "Aliado"
      case 2:
        return "Independiente"
    }
  }

  static trimPayload(data: Financiador): Financiador {
    return {
      ...data,
      id_alt: data.id_alt.trim(),
      nombre: data.nombre.trim(),
      rfc: data.rfc.trim(),
      actividad: data.actividad.trim(),
      representante_legal: data.representante_legal.trim(),
      rfc_representante_legal: data.rfc_representante_legal.trim(),
      pagina_web: data.pagina_web.trim(),
      enlace: {
        nombre: data.enlace.nombre.trim(),
        apellido_paterno: data.enlace.apellido_paterno.trim(),
        apellido_materno: data.enlace.apellido_materno.trim(),
        email: data.enlace.email.trim(),
        telefono: data.enlace.telefono.trim(),
      },
      direccion: {
        ...data.direccion,
        calle: data.direccion.calle.trim(),
        numero_ext: data.direccion.numero_ext.trim(),
        numero_int: data.direccion.numero_int.trim(),
        colonia: data.direccion.colonia.trim(),
        municipio: data.direccion.municipio.trim(),
        cp: data.direccion.cp.trim(),
        estado: data.direccion.estado.trim(),
      },
    }
  }

  static async obtebnerVmin() {
    const re = await FinanciadorDB.obtenerVminimalista()

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener financiadores, contactar a soporte",
        re.data
      )
    }

    return RespuestaController.exitosa(200, "Consulta exitosa", re.data)
  }

  static async obtener(id_financiador?: number, min = false) {
    if (min) return this.obtebnerVmin()

    try {
      const financiadoresDB = (await FinanciadorDB.obtener(
        id_financiador
      )) as ResFinanciadorDB[]

      const financiadores: Financiador[] = financiadoresDB.map(
        (financiadorDB) => ({
          id: financiadorDB.id,
          id_alt: financiadorDB.id_alt,
          nombre: financiadorDB.nombre,
          representante_legal: financiadorDB.representante_legal,
          rfc_representante_legal: financiadorDB.rfc_representante_legal,
          pagina_web: financiadorDB.pagina_web,
          rfc: financiadorDB.rfc,
          actividad: financiadorDB.actividad,
          i_tipo: financiadorDB.i_tipo,
          tipo: this.obtenerTipo(financiadorDB.i_tipo),
          dt_constitucion: financiadorDB.dt_constitucion,
          dt_registro: financiadorDB.dt_registro,
          enlace: {
            id: financiadorDB.id_enlace,
            nombre: financiadorDB.nombre_enlace,
            apellido_paterno: financiadorDB.apellido_paterno,
            apellido_materno: financiadorDB.apellido_materno,
            email: financiadorDB.email,
            telefono: financiadorDB.telefono,
          },
          direccion: {
            id: financiadorDB.id_direccion,
            calle: financiadorDB.calle,
            numero_ext: financiadorDB.numero_ext,
            numero_int: financiadorDB.numero_int,
            colonia: financiadorDB.colonia,
            municipio: financiadorDB.municipio,
            cp: financiadorDB.cp,
            id_estado: financiadorDB.id_estado,
            estado: financiadorDB.estado,
            id_pais: financiadorDB.id_pais,
            pais: financiadorDB.pais,
          },
          notas:
            financiadorDB.notas?.map((nota) => ({
              ...nota,
              dt_registro: epochAFecha(nota.dt_registro),
            })) || [],
        })
      )

      return RespuestaController.exitosa(200, "Consulta exitosa", financiadores)
    } catch (error) {
      return RespuestaController.fallida(
        400,
        `Error al obtener ${
          id_financiador ? "financiador" : "financiadores"
        }, contactar a soporte`,
        error
      )
    }
  }

  static async crear(data: Financiador) {
    try {
      const payload = this.trimPayload(data)
      const cr = await FinanciadorDB.crear(payload)

      return RespuestaController.exitosa(201, "Financiador creado con éxito", {
        idInsertado: cr,
      })
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al crear financiador, contactar a soporte",
        error
      )
    }
  }

  static async actualizar(id: number, data: Financiador) {
    try {
      const payload = this.trimPayload(data)
      const upFianciador = await FinanciadorDB.actualizar(id, payload)

      return RespuestaController.exitosa(
        200,
        "Financiador actualizado con éxito",
        upFianciador
      )
    } catch (error) {
      return RespuestaController.fallida(
        400,
        "Error al actualizar financiador, contactar a soporte",
        error
      )
    }
  }

  static async borrar(id: number) {
    const dl = await FinanciadorDB.borrar(id)

    if (dl.error) {
      return RespuestaController.fallida(
        400,
        "Error al borrar financiador, contactar a soporte",
        dl.data
      )
    }
    return RespuestaController.exitosa(
      200,
      "Financiador borrado con éxito",
      dl.data
    )
  }

  static async crearNota(id_financiador: number, data: NotaFinanciador) {
    const crearNota = await FinanciadorDB.crearNota(id_financiador, data)

    if (crearNota.error) {
      return RespuestaController.fallida(
        400,
        "Error al crear nota de financiador, contactar a soporte",
        crearNota.data
      )
    }

    // @ts-ignore
    const idInsertado = crearNota.data.insertId

    return RespuestaController.exitosa(
      201,
      "Nota de financiador creada con éxito",
      { idInsertado }
    )
  }

  static async obtenerNotas(id_financiador: number) {
    const re = await FinanciadorDB.obtenerNotas(id_financiador)

    if (re.error) {
      return RespuestaController.fallida(
        400,
        "Error al obtener notas del financiador, contactar a soporte",
        re.data
      )
    }

    let notas = re.data as NotaFinanciador[]
    notas = notas.map((nota) => {
      return {
        ...nota,
        dt_registro: epochAFecha(nota.dt_registro),
      }
    })

    return RespuestaController.exitosa(200, "consulta exitosa", notas)
  }
}

export { FinanciadoresServices }
