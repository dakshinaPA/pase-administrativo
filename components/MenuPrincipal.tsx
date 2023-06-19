import Link from "next/link"

const MenuPrincipal = () => {
  return (
    <div className="list-group">
      <Link href="/usuarios" className="list-group-item list-group-item-action">
        Usuarios
      </Link>
      <Link href="/financiadores" className="list-group-item list-group-item-action">
        Financiadores
      </Link>
      <Link href="/copartes" className="list-group-item list-group-item-action">
        Copartes
      </Link>
      <Link href="/proyectos" className="list-group-item list-group-item-action">
        Proyectos
      </Link>
    </div>
  )
}

export { MenuPrincipal }
