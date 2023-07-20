import { useAuth } from "@contexts/auth.context"
import { MainContenedor } from "./MainContenedor"
import { MainHeader } from "./MainHeader"
import { useState } from "react"
import { MenuCelular } from "./MenuCelular"

const App = ({ children }) => {
  const { user } = useAuth()
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
