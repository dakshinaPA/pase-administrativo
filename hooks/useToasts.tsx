import { useEffect, useRef, useState } from "react"
import styles from "@components/styles/Toast.module.css"

const estaInicialToast = {
  show: false,
  mensaje: "",
}

const useToast = () => {
  const [toastState, setToastState] = useState(estaInicialToast)

  const mostrarToast = (mensaje: string) => {
    setToastState({
      show: true,
      mensaje,
    })
  }

  const cerrarToast = () => {
    setToastState((prevState) => ({
      ...prevState,
      show: false,
    }))
  }

  return { toastState, mostrarToast, cerrarToast }
}

export { useToast }
