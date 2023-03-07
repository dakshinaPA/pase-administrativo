import { RespuestaDB } from '../utils/response'
import { queryDB } from './query'

class UsuarioDB {

    static async login({ email, password }){

        const query = `SELECT * FROM usuarios WHERE email='${email}' AND password='${password}'`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async loggear( idUsuario ) {

        const query = `UPDATE usuarios SET login=1 WHERE id_usuario=${idUsuario} LIMIT 1`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async obtener(){

        const query = 'SELECT * FROM `usuarios`'
    
        try {
            const res = await queryDB( query )
            return dbRespuestaExitosa( res )
        } catch (error) {
            return dbRespuestaFallida( error )
        }
    }

    static async crear( data ){

        const { nombre, apellido } = data
            
        const query = `INSERT INTO usuarios ( nombre, apellido ) VALUES ('${nombre}', '${apellido}')`
    
        try {
            const res = await queryDB( query )
            return dbRespuestaExitosa( res )
        } catch (error) {
            return dbRespuestaFallida( error )
        }
    }

    static async actualizar( data ){

        const { id, nombre, apellido } = data
            
        const query = `UPDATE usuarios SET nombre='${nombre}', apellido='${apellido}' WHERE id_usuario=${1}`
    
        try {
            const res = await queryDB( query )
            return dbRespuestaExitosa( res )
        } catch (error) {
            return dbRespuestaFallida( error )
        }
    }
    
}

export { UsuarioDB }