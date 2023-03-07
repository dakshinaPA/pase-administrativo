import { UsuariosServices } from '../../api/services/usuarios'

const login = async ( req, res ) => {

    if(req.method === 'POST'){
        const { status, ...data } = await UsuariosServices.login( req.body )
        return res.status(status).json( data )
    }
    res.status(500).json({ mensaje: "Acceso no autorizado"})
}

export default login