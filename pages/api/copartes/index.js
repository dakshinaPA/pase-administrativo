import { CopartesServices } from '../../../api/services/copartes'

export default async ( req, res ) => {

    switch( req.method ){
        case 'GET':
            var { status, ...data } = await CopartesServices.obtener()
            res.status(status).json( data )
            break
        case 'POST':
            var { status, ...data } = await CopartesServices.crear( req.body )
            res.status(status).json( data )
            break
        default:
            res.status(500).json({ mensaje: "Acceso no autorizado"})
    }   
}
