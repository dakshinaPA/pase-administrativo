import { useEffect, useRef } from "react"
import styles from "./styles/Toast.module.css"

const Toast = ({ estado, cerrar }) => {
  const spanToast = useRef(null)
  let timeout: NodeJS.Timeout

  useEffect(() => {
    if (estado.show) {
      spanToast.current.style.right = "40px"

      timeout = setTimeout(() => {
        cerrar()
      }, 3000)
    } else {
      spanToast.current.style.right = "-100%"
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
