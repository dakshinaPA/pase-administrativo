import { MenuPrincipal } from "@components/MenuPrincipal"

const MainContenedor = ({ children }) => {
  return (
    <div className="main_contenedor">
      <div className="d-none d-md-block">
        <MenuPrincipal />
      </div>
      <div>{children}</div>
    </div>
  )
}

export { MainContenedor }
