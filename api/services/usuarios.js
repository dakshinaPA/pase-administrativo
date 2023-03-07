import { UsuarioDB } from '../db/usuarios'
import { RespuestaController } from '../utils/response'

class UsuariosServices {

    static async login( dataUsuario ){

        const { data, error } = await UsuarioDB.login( dataUsuario )

        if( error ){
            return RespuestaController.fallida( 500, 'Error al acceder a la base de datos', data )
        }

        // encontró match con usuario
        if( data.length > 0 ){
            const [ usuario ] = data
            const res = await this.loggear( usuario.id_usuario )
            return RespuestaController.exitosa( 200, 'Usuario encontrado', usuario )
        }

        // no hubo error pero no hay match con usuario
        return RespuestaController.fallida( 400, 'Usuario o contraseña no válidos', null )
    }

    static async loggear( id ){
        
        const res = await UsuarioDB.loggear( id )
        console.log( `usuario loggeado ${!res.error}` )
        return res
    }

    static async traerTodos(){
        const res = await obtenerUsuarios()
        return res
    }

    static async crear( data ){
        const res = await crearUsuario( data )
        return res
    }

    static async actualizar( data ){
        const res = await actualozarUsuario( data )
        return res
    }
}

export { UsuariosServices }