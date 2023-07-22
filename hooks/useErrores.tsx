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
            if (!/^[0-9]{10}$/.test(campos[key]))
              throw [key, "Número a 10 dígitos"]
            break
          case "password":
            if (!/^.{8,}$/.test(campos[key])) throw [key, "Mínimo 8 caracteres"]
            break
          case "cargo":
          case "actividad":
          case "sector_beneficiado":
            if (!/^[a-zA-Z0-9\u00C0-\u017F\s]{5,}$/.test(campos[key]))
              throw [key, "Mínimo 5 caracteres"]
            break
          case "id_coparte":
          case "id_administrador":
          case "id_financiador":
          case "id_responsable":
            if (!(campos[key] > 0)) throw [key, "Campo requerido"]
            break
          case "i_beneficiados":
            if (!(campos[key] > 0)) throw [key, "Cantidad mayor a 0"]
            break
          case "id_alt":
            if (!/^[0-9]{3,}$/.test(campos[key]))
              throw [key, "Mínimo 3 dígitos"]
            break
          case "descripcion":
            if (!/^[a-zA-Z\u00C0-\u017F\s]{10,}$/.test(campos[key]))
              throw [key, "Mínimo 10 caracteres"]
            break
          case "nombre_financiador":
          case "nombre_coparte":
          case "calle":
          case "colonia":
          case "municipio":
          case "estado":
            if (!/^[a-zA-Z\u00C0-\u017F\s]{3,}$/.test(campos[key]))
              throw [key, "Mínimo 3 caracteres"]
            break
          case "nombre_corto":
            if (!/^[a-zA-Z]{2,}$/.test(campos[key]))
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
          case "cp":
            if (!/^[0-9]{5}$/.test(campos[key]))
              throw [key, "Código postal inválido"]
            break
          case "dt_constitucion":
          case "dt_inicio":
          case "dt_fin":
            if (!/^[0-9]{4}\-[0-1][1-9]\-[0-3][0-9]$/.test(campos[key]))
              throw [key, "Fecha inválida"]
            break
        }
      }

      setError(estadoInicialError)
      return true
    } catch (error) {
      formRef.current
        .querySelector(
          `input[name=${error[0]}], select[name=${error[0]}], textarea[name=${error[0]}] `
        )
        .focus()

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
