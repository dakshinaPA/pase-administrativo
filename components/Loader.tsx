import { FondoNegro } from "@components/FondoNegro"
// import { loaderContainer, spinner } from './styles/Loader.module.css'
import styles from "./styles/Loader.module.css"

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <i className={`bi bi-arrow-repeat ${styles.spinner} color3`}></i>
    </div>
  )
}

export { Loader }
