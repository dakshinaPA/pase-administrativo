import { useSesion } from "@hooks/useSesion"
import Link from "next/link"

const MenuPrincipal = ({ shrinkMenu }) => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  return (
    <div className="accordion accordion-flush">
      {user.id_rol != 3 && (
        <>
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button
                className="accordion-button collapsed panel-menu-item"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapse1"
                // aria-expanded="false"
                // aria-controls="flush-collapse1"
              >
                {shrinkMenu ? (
                  <i className="bi bi-person-circle"></i>
                ) : (
                  "Usuarios"
                )}
              </button>
            </h3>
            <div
              id="flush-collapse1"
              className="accordion-collapse collapse"
              // data-bs-parent="#accordionFlush"
            >
              <div className="accordion-body panel-menu-subitem">
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
                className="accordion-button collapsed panel-menu-item"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapse2"
              >
                {shrinkMenu ? (
                  <i className="bi bi-cash-coin"></i>
                ) : (
                  "Financiadores"
                )}
              </button>
            </h2>
            <div id="flush-collapse2" className="accordion-collapse collapse">
              <div className="accordion-body panel-menu-subitem">
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
                className="accordion-button collapsed panel-menu-item"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapse3"
              >
                {shrinkMenu ? <i className="bi bi-people"></i> : "Copartes"}
              </button>
            </h2>
            <div id="flush-collapse3" className="accordion-collapse collapse">
              <div className="accordion-body panel-menu-subitem">
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
        </>
      )}

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed panel-menu-item"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse4"
          >
            {shrinkMenu ? <i className="bi bi-folder2-open"></i> : "Proyectos"}
          </button>
        </h2>
        <div id="flush-collapse4" className="accordion-collapse collapse">
          <div className="accordion-body panel-menu-subitem">
            <nav>
              <ul>
                <li>
                  <Link href="/proyectos" className="">
                    Listado
                  </Link>
                </li>
                {user?.id_rol != 3 && (
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
            className="accordion-button collapsed panel-menu-item"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapse5"
          >
            {shrinkMenu ? <i className="bi bi-ui-checks"></i> : "Solicitudes"}
          </button>
        </h2>
        <div id="flush-collapse5" className="accordion-collapse collapse">
          <div className="accordion-body panel-menu-subitem">
            <nav>
              <ul>
                <li>
                  <Link href="/solicitudes-presupuesto" className="">
                    Listado
                  </Link>
                </li>
                {user.id_rol == 3 && (
                  <li>
                    <Link href="/solicitudes-presupuesto/registro" className="">
                      Registrar
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {user?.id_rol == 3 && (
        <>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed panel-menu-item"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapse6"
              >
                {shrinkMenu ? (
                  <i className="bi bi-person-plus"></i>
                ) : (
                  "Colaboradores"
                )}
              </button>
            </h2>
            <div id="flush-collapse6" className="accordion-collapse collapse">
              <div className="accordion-body panel-menu-subitem">
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
                className="accordion-button collapsed panel-menu-item"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapse7"
              >
                {shrinkMenu ? <i className="bi bi-truck"></i> : "Proveedores"}
              </button>
            </h2>
            <div id="flush-collapse7" className="accordion-collapse collapse">
              <div className="accordion-body panel-menu-subitem">
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
        </>
      )}
      <div style={{ padding: "1rem 1.25rem" }}>
        <Link href="/videos" className="text-white">
          {shrinkMenu ? <i className="bi bi-film"></i> : "Videos"}
        </Link>
      </div>
      <div style={{ padding: "1rem 1.25rem" }}>
        <Link href="/legal" className="text-white">
          {shrinkMenu ? <i className="bi bi-bank"></i> : "Legal"}
        </Link>
      </div>
      <div style={{ padding: "1rem 1.25rem" }}>
        <Link href="/formatos" className="text-white">
          {shrinkMenu ? <i className="bi bi-code-square"></i> : "Formatos"}
        </Link>
      </div>
      {user?.id_rol == 1 && (
        <div style={{ padding: "1rem 1.25rem" }}>
          <Link href="/reportes" className="text-white">
            {shrinkMenu ? (
              <i className="bi bi-file-earmark-bar-graph"></i>
            ) : (
              "Reportes"
            )}
          </Link>
        </div>
      )}
    </div>
  )
}

export { MenuPrincipal }
