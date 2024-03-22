import { RegistroContenedor } from "@components/Contenedores"
import { useCatalogos } from "@contexts/catalogos.context"

const PageVideos = () => {
  const { rubros_presupuestales } = useCatalogos()

  return (
    <RegistroContenedor>
      <div className="row">
        <div className="col-12 mb-3">
          <h2 className="color1">Partidas presupuestales</h2>
        </div>
        <div className="col-12 table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr className="color1">
                <th style={{ width: "20%" }}>Nombre</th>
                <th style={{ width: "40%" }}>Descripción</th>
                <th style={{ width: "40%" }}>
                  Importante <i className="bi bi-exclamation-diamond ms-1"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {rubros_presupuestales.map(
                ({ id, nombre, descripcion, importante }) => (
                  <tr key={id}>
                    <td className="fw-bold">{nombre}</td>
                    <td>{descripcion}</td>
                    <td>{importante}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RegistroContenedor>
  )
}

export default PageVideos
