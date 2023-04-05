import { UsuariosServices } from '@api/services/usuarios'
import { NextApiRequest, NextApiResponse  } from 'next'

export default async ( req: NextApiRequest, res: NextApiResponse ) => {

    switch( req.method ){
        case 'GET':
            var { status, ...data } = await UsuariosServices.obtener()
            res.status(status).json( data )
            break
        case 'POST':
            var { status, ...data } = await UsuariosServices.crear( req.body )
            res.status(status).json( data )
            break
        default:
            res.status(500).json({ mensaje: "Acceso no autorizado"})
    }   
}
