import { MainContenedor } from "./MainContenedor"
import { MainHeader } from "./MainHeader"
import { useState } from "react"
import { MenuCelular } from "./MenuCelular"
import { useSesion } from "@hooks/useSesion"

const App = ({ children }) => {
  const { user, status } = useSesion()
  const [showMenuCel, setShowMenuCel] = useState(false)

  const abrirMenu = () => setShowMenuCel(true)
  const cerrarMenu = () => setShowMenuCel(false)

  return (
    <>
      <MainHeader abrirMenu={abrirMenu} />
      {user ? (
        <>
          <MainContenedor>{children}</MainContenedor>
          {showMenuCel && <MenuCelular cerrarMenu={cerrarMenu} />}
        </>
      ) : (
        children
      )}
    </>
  )
}

export { App }
