import { UsuarioDB } from '../db/usuarios'
import { RespuestaController } from '../utils/response'
import { ResController } from '../models/respuestas.model'

class UsuariosServices {

    static async login( dataUsuario ){

        const { data, error } = await UsuarioDB.login( dataUsuario )

        if( error ){
            return RespuestaController.fallida( 500, 'Error al acceder a la base de datos', data )
        }

        // encontró match con usuario
        if( Array.isArray(data) && data.length > 0 ){
            const [ usuario ] = data
            // const res = await this.loggear( usuario.id_usuario )
            return RespuestaController.exitosa( 200, 'Usuario encontrado', usuario )
        }

        // no hubo error pero no hay match con usuario
        return RespuestaController.fallida( 400, 'Usuario o contraseña no válidos', null )
    }

    // static async loggear( id: number ){
        
    //     const res = await UsuarioDB.loggear( id )
    //     console.log( `usuario loggeado ${!res.error}` )
    //     return res
    // }

    static async obtener( id: number | null ): Promise< ResController >{

        const res = await UsuarioDB.obtener( id )

        if(res.error){
            return RespuestaController.fallida( 400, 'Error al obtener copartes', res.data )
        }
        return RespuestaController.exitosa( 200, 'Consulta exitosa', res.data )
    }

    // static async actualizar( id: number, data ){

    //     const res = await UsuarioDB.actualizar( id, data )
    //     if(res.error){
    //         return RespuestaController.fallida( 400, 'Error al actualziar coparte', res.data )
    //     }
    //     return RespuestaController.exitosa( 201, 'Coparte actualizada con éxito', res.data )
    // }

    static async borrar( id: number ){

        const res = await UsuarioDB.borrar( id )
        if(res.error){
            return RespuestaController.fallida( 400, 'Error al borrar coparte', res.data )
        }
        return RespuestaController.exitosa( 200, 'Coparte borrada con éxito', res.data )
    }
}

export { UsuariosServices }