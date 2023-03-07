import { TablaContainer, Acciones } from '@components/TablaContainer'
import { useCopartes } from '@contexts/copartes.context'
import { useRouter } from 'next/router'

const TablaCopartes = () => {

    const { copartes, editarCoparte, eliminarCoparte } = useCopartes()

    const definirtipoCoparte = ( tipo ) => {
        switch( tipo ){
            case 1:
                return 'Constituida'
            case 2:
                return 'No constituida'
        }
    }

    return(
        <TablaContainer>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Id</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {copartes.map(({ id_coparte, nombre, id, tipo }) => (
                <tr key={id_coparte}>
                    <td>{nombre}</td>
                    <td>{id}</td>
                    <td>{definirtipoCoparte( tipo )}</td>
                    <Acciones
                        editar={() => editarCoparte( id_coparte )}
                        eliminar={() => eliminarCoparte( id_coparte )}
                    />
                </tr>
                ))}
            </tbody>
        </TablaContainer>
    )
}

const PanelCopartes = () => {

    const { buscarCoparte } = useCopartes()
    const router = useRouter()

    return(
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 col-md-7">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push('copartes/registro')}
                    >
                        Registrar +
                    </button>
                </div>
                <div className="col-12 col-md-5">
                    <div className="input-group">
                        <input
                            type="text"
                            name="busqueda"
                            className="form-control"
                            placeholder="Buscar coparte"
                            onChange={buscarCoparte}
                        />
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Copartes = () => {
    return(
        <>
            <PanelCopartes/>
            <TablaCopartes/>
        </>
    )
}

export default Copartes