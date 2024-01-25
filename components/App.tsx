import { MainContenedor } from "./MainContenedor"
import { MainHeader } from "./MainHeader"
import { useState } from "react"
import { MenuCelular } from "./MenuCelular"
import { useSession } from "next-auth/react"

const App = ({ children }) => {
  const { data } = useSession()
  const [showMenuCel, setShowMenuCel] = useState(false)

  const abrirMenu = () => setShowMenuCel(true)
  const cerrarMenu = () => setShowMenuCel(false)

  return (
    <>
      <MainHeader abrirMenu={abrirMenu} />
      {data?.user ? (
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
