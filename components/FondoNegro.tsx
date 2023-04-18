import ReactDOM from "react-dom"
import styles from "./styles/FondoNegro.module.css"

const FondoNegro = (props) => {
  return ReactDOM.createPortal(
    <div className={styles.fondo}>{props.children}</div>,
    document.querySelector("#modal")
  )
}

export { FondoNegro }
