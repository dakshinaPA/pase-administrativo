import { MenuPrincipal } from "@components/MenuPrincipal"
import { useEffect, useRef, useState } from "react"

const MainContenedor = ({ children }) => {
  const [shrinkMenu, setShrinkMenu] = useState(false)
  const refMenu = useRef(null)

  useEffect(() => {
    refMenu.current.style.flex = `0 0 ${shrinkMenu ? 100 : 250}px`
  }, [shrinkMenu])

  const achicarMenu = () => {
    setShrinkMenu((prevState) => !prevState)
  }

  return (
    <div className="main_contenedor">
      <div className="d-none d-md-block" ref={refMenu}>
        <MenuPrincipal shrinkMenu={shrinkMenu} />
        <i
          className={`bi bi-arrow-${shrinkMenu ? "right" : "left"}-circle`}
          style={{
            position: "absolute",
            bottom: "0",
            right: "10px",
            cursor: "pointer",
            fontSize: "30px",
          }}
          onClick={achicarMenu}
        ></i>
      </div>
      <div>{children}</div>
    </div>
  )
}

export { MainContenedor }
