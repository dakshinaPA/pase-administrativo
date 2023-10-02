import ReactDOM from "react-dom"
import styles from "./styles/MenuCelular.module.css"
import { MenuPrincipal } from "./MenuPrincipal"

const MenuCelular = ({ cerrarMenu }) => {
  return ReactDOM.createPortal(
    <div className={styles.menu_cel}>
      <div className="text-end">
        <i
          className="bi bi-x-circle text-white me-2"
          style={{ fontSize: "30px" }}
          onClick={cerrarMenu}
        ></i>
      </div>
      <MenuPrincipal shrinkMenu={false} />
    </div>,
    document.querySelector("#menu_celular")
  )
}

export { MenuCelular }
