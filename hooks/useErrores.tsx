import { useRef, useState } from "react"

const useErrores = () => {
  const estadoInicialError = {
    campo: "",
    mensaje: "",
  }

  const [error, setError] = useState(estadoInicialError)
  const formRef = useRef(null)

  const validarCampos = (campos): boolean => {
    try {
      for (const key in campos) {
        switch (key) {
          case "nombre":
          case "apellido_paterno":
          case "apellido_materno":
          case "representante_legal":
          case "titular_cuenta":
            if (!/^[a-zA-Z\u00C0-\u017F\s]{2,}$/.test(campos[key]))
              throw [key, "Nombre inválido"]
            break
          case "email":
            if (
              !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(campos[key])
            )
              throw [key, "Correo inválido"]
            break
          case "telefono":
            if (!/^[0-9]{10,15}$/.test(campos[key]))
              throw [key, "Número de 10 a 15 dígitos"]
            break
          case "password":
            if (!/^.{8,}$/.test(campos[key])) throw [key, "Mínimo 8 caracteres"]
            break
          case "cargo":
          case "actividad":
          case "sector_beneficiado":
          case "bank_branch_address":
            if (!/^[a-zA-Z0-9\u00C0-\u017F\s]{5,}$/.test(campos[key]))
              throw [key, "Mínimo 5 caracteres"]
            break
          case "bic_code":
            if (!/^.{8,11}$/.test(campos[key]))
              throw [key, "Código de 8 a 11 caracteres"]
            break
          case "id_coparte":
          case "id_administrador":
          case "id_financiador":
          case "id_responsable":
          case "id_proyecto":
          case "id_banco":
          case "i_tipo_gasto":
          case "id_partida_presupuestal":
            if (!(campos[key] > 0)) throw [key, "Campo requerido"]
            break
          case "i_beneficiados":
          case "f_importe":
          case "f_retenciones":
            if (!(campos[key] > 0)) throw [key, "Cantidad mayor a 0"]
            break
          case "id_alt":
            if (!/^[0-9]{3,}$/.test(campos[key]))
              throw [key, "Mínimo 3 dígitos"]
            break
          case "descripcion":
          case "descripcion_servicio":
          case "descripcion_gasto":
            if (!/^.{10,}$/.test(campos[key]))
              throw [key, "Mínimo 10 caracteres"]
            break
          case "nombre_financiador":
          case "nombre_coparte":
          case "calle":
          case "colonia":
          case "municipio":
          case "estado":
          case "proveedor":
          case "bank":
          case "intermediary_bank":
            if (!/^[a-zA-Z0-9\u00C0-\u017F\s]{3,}$/.test(campos[key]))
              throw [key, "Mínimo 3 caracteres"]
            break
          case "nombre_corto":
            if (!/^[a-zA-Z\u00C0-\u017F\s]{2,}$/.test(campos[key]))
              throw [key, "Mínimo 2 caracteres"]
            break
          case "numero_ext":
            if (!/^[a-zA-Z0-9]{1,}$/.test(campos[key]))
              throw [key, "Mínimo 1 caracter"]
            break
          case "rfc":
          case "rfc_representante_legal":
            if (!/^[A-Z]{4}[0-9]{6}([A-Z0-9]{3})?$/.test(campos[key]))
              throw [key, "RFC inválido"]
            break
          case "rfc_organizacion":
            if (!/^[A-Z]{3}[0-9]{6}[A-Z0-9]{3}$/.test(campos[key]))
              throw [key, "RFC inválido"]
            break
          case "clabe":
            if (!/^[0-9]{18}$/.test(campos[key]))
              throw [key, "CLABE a 18 dígitos"]
            break
          case "curp":
            if (
              !/^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/.test(
                campos[key]
              )
            )
              throw [key, "CURP inválido"]
            break
          case "cp":
            if (!/^.{5,9}$/.test(campos[key]))
              throw [key, "Código postal inválido"]
            break
          case "dt_constitucion":
          case "dt_inicio":
          case "dt_fin":
            if (!/^[0-9]{4}\-[0-1][0-9]\-[0-3][0-9]$/.test(campos[key]))
              throw [key, "Fecha inválida"]
            break
          case "telefono":
          case "account_number":
          case "routing_number":
            if (!/^[0-9]{1,}$/.test(campos[key]))
              throw [key, "Sólo dígitos"]
            break
        }
      }

      setError(estadoInicialError)
      return true
    } catch (error) {
      const inputError = formRef.current.querySelector(
        `input[name=${error[0]}], select[name=${error[0]}], textarea[name=${error[0]}] `
      )
      inputError?.focus()

      setError({
        campo: error[0],
        mensaje: error[1],
      })
      return false
    }
  }

  return { error, validarCampos, formRef }
}

export { useErrores }
