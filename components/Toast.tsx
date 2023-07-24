import { useEffect, useRef } from "react"
import styles from "./styles/Toast.module.css"

interface PropsToast {
  estado: {
    show: boolean
    mensaje: string
  }
  cerrar: () => void
}

const Toast = ({ estado, cerrar }: PropsToast) => {
  const spanToast = useRef(null)
  let timeout: NodeJS.Timeout

  useEffect(() => {
    if (estado.show) {
      spanToast.current.style.right = "40px"

      timeout = setTimeout(() => {
        cerrar()
      }, 3000)
    } else {
      spanToast.current.style.right = "-50%"
    }

    return () => clearTimeout(timeout)
  }, [estado.show])

  return (
    <small className={styles.toast} ref={spanToast}>
      {estado.mensaje}
    </small>
  )
}

export { Toast }
