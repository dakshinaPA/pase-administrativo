
import { useSolicitudes } from '../contexts/solicitud.context'
import { determinarNombreArchivo } from '../assets/utils/common'

const TablaSolicitudes = () => {

    const { solicitudes, mostrarFormatonuevaSolicitud, showForm, borrarSolicitud, editarSolicitud } = useSolicitudes()

    const determiarTipoGasto = (idTipo) => {
        switch(Number(idTipo)){
            case 1:
                return 'Programación'
            case 2:
                return 'Reeombolso'
            case 3:
                return 'Asimilados'
        }
    }

    const determiarComprobante = (idTipo) => {
        switch(Number(idTipo)){
            case 1:
                return 'Factura'
            case 2:
                return 'Recibo de asimilados'
            case 3:
                return 'Recibo de honorarios'
            case 4:
                return 'Invoice'
            case 5:
                return 'Recibo no deducible'
        }
    }

    if(solicitudes.length === 0){
        return null
    }

    return(
        <div className="container my-5">
            <div className="row">
                <div className="col-12" style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>CLABE</th>
                                <th>Banco</th>
                                <th>Titular</th>
                                <th>RFC</th>
                                <th>Correo</th>
                                <th>Tipo gasto</th>
                                <th>Descripción</th>
                                <th>Partida</th>
                                <th>Importe</th>
                                <th>Comprobante</th>
                                <th>Archivo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map( (solicitud, index) => {

                                const {id, proveedor, clabe, banco, titular, rfc, email1, tipoGasto, descripcion, partida, importe, comprobante, archivo } = solicitud

                                return(
                                    <tr key={`solicitud_${index + 1}`}>
                                        <td>{proveedor}</td>
                                        <td>{clabe}</td>
                                        <td>{banco}</td>
                                        <td>{titular}</td>
                                        <td>{rfc}</td>
                                        <td>{email1}</td>
                                        <td>{determiarTipoGasto(tipoGasto)}</td>
                                        <td>{descripcion}</td>
                                        <td>{partida}</td>
                                        <td>{importe}</td>
                                        <td>{determiarComprobante(comprobante)}</td>
                                        <td>{determinarNombreArchivo(archivo).nombre}</td>
                                        <td className="d-flex">
                                            <button className="btn btn-dark me-1" onClick={() => editarSolicitud(id)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-dark" onClick={() => borrarSolicitud(id)}>
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {!showForm &&
                <div className="col-12 text-end p-1">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={mostrarFormatonuevaSolicitud}
                    >
                        Nueva trasnferencia
                    </button>
                </div>
                }
            </div>
        </div>
    )
}

export { TablaSolicitudes }