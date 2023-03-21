import { CopartesServices } from '../../../api/services/copartes'

export default async ( req, res ) => {

    const id = req.query.id
    
    switch( req.method ){
        case 'GET':
            var { status, ...data } = await CopartesServices.obtener( id )
            res.status(status).json( data )
            break
        case 'PUT':
            var { status, ...data } = await CopartesServices.actualizar( id, req.body )
            res.status(status).json( data )
            break
        case 'DELETE':
            var { status, ...data } = await CopartesServices.borrar( id )
            res.status(status).json( data )
            break
        default:
            res.status(500).json({ mensaje: "Acceso no autorizado"})
    }   
}