import { MenuPrincipal } from "@components/MenuPrincipal"
import { useAuth } from "@contexts/auth.context"

const MainContenedor = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <div className="pt-5">{children}</div>
  }

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
