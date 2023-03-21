import { RespuestaDB } from '../utils/response'
import { queryDB } from './query'
import { ResDB } from '../models/respuestas.model'

class UsuarioDB {

    static async login({ email, password }): Promise<ResDB> {

        const query = `SELECT * FROM usuarios WHERE email='${email}' AND password='${password}'`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async loggear( idUsuario: number ) {

        const query = `UPDATE usuarios SET login=1 WHERE id_usuario=${idUsuario} LIMIT 1`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async obtener( id: number ): Promise<ResDB> {

        let query = 'SELECT id_usuario, nombre, apellido_paterno, apellido_materno, email, id_rol FROM `usuarios` WHERE b_activo=1'

        if( id ){
            query += ` AND id_usuario=${id} LIMIT 1`
        }
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    // static async crear( data ){

    //     const { nombre, apellido } = data
            
    //     const query = `INSERT INTO usuarios ( nombre, apellido ) VALUES ('${nombre}', '${apellido}')`
    
    //     try {
    //         const res = await queryDB( query )
    //         return dbRespuestaExitosa( res )
    //     } catch (error) {
    //         return dbRespuestaFallida( error )
    //     }
    // }

    // static async actualizar( data ){

    //     const { id, nombre, apellido } = data
            
    //     const query = `UPDATE usuarios SET nombre='${nombre}', apellido='${apellido}' WHERE id_usuario=${1}`
    
    //     try {
    //         const res = await queryDB( query )
    //         return dbRespuestaExitosa( res )
    //     } catch (error) {
    //         return dbRespuestaFallida( error )
    //     }
    // }

    static async borrar( id: number ): Promise<ResDB> {
            
        const query = `UPDATE usuarios SET b_activo=0 WHERE id_usuario=${id} LIMIT 1`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }
    
}

export { UsuarioDB }