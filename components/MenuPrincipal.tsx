import { useAuth } from "@contexts/auth.context"
import Link from "next/link"

const MenuPrincipal = () => {
  const { user } = useAuth()

  return (
    // <div className="list-group">
    //   <Link href="/usuarios" className="list-group-item list-group-item-action">
    //     Usuarios
    //   </Link>
    //   <Link href="/financiadores" className="list-group-item list-group-item-action">
    //     Financiadores
    //   </Link>
    //   <Link href="/copartes" className="list-group-item list-group-item-action">
    //     Copartes
    //   </Link>
    //   <Link href="/proyectos" className="list-group-item list-group-item-action">
    //     Proyectos
    //   </Link>
    // </div>
    <div className="accordion accordion-flush">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse1"
            // aria-expanded="false"
            // aria-controls="flush-collapse1"
          >
            Usuarios
          </button>
        </h2>
        <div
          id="flush-collapse1"
          className="accordion-collapse collapse"
          // data-bs-parent="#accordionFlush"
        >
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/usuarios" className="">
                    Listado
                  </Link>
                </li>
                <li>
                  <Link href="/usuarios/registro" className="">
                    Registrar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse2"
          >
            Financiadores
          </button>
        </h2>
        <div id="flush-collapse2" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/financiadores" className="">
                    Listado
                  </Link>
                </li>
                {user?.id_rol == 1 && (
                  <li>
                    <Link href="/financiadores/registro" className="">
                      Registrar
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse3"
          >
            Copartes
          </button>
        </h2>
        <div id="flush-collapse3" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/copartes" className="">
                    Listado
                  </Link>
                </li>

                <li>
                  <Link href="/copartes/registro" className="">
                    Registrar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse4"
          >
            Proyectos
          </button>
        </h2>
        <div id="flush-collapse4" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/proyectos" className="">
                    Listado
                  </Link>
                </li>
                {user?.id_rol == 2 && (
                  <li>
                    <Link href="/proyectos/registro" className="">
                      Registrar
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse5"
          >
            Solicitudes
          </button>
        </h2>
        <div id="flush-collapse5" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/proyectos" className="">
                    Listado
                  </Link>
                </li>
                <li>
                  <Link href="/proyectos/registro" className="">
                    Registrar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse6"
          >
            Colaboradores
          </button>
        </h2>
        <div id="flush-collapse6" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/colaboradores" className="">
                    Listado
                  </Link>
                </li>
                <li>
                  <Link href="/colaboradores/registro" className="">
                    Registrar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse7"
          >
            Proveedores
          </button>
        </h2>
        <div id="flush-collapse7" className="accordion-collapse collapse">
          <div className="accordion-body">
            <nav>
              <ul>
                <li>
                  <Link href="/proveedores" className="">
                    Listado
                  </Link>
                </li>
                <li>
                  <Link href="/proveedores/registro" className="">
                    Registrar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export { MenuPrincipal }
