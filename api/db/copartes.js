import { RespuestaDB } from '../utils/response'
import { queryDB } from './query'

class CoparteDB {

    static async obtener(){

        const query = 'SELECT * FROM `copartes`'
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async crear( data ){

        const { nombre, id, tipo } = data
            
        const query = `INSERT INTO copartes ( nombre, id, tipo ) VALUES ('${nombre}', '${id}', '${tipo}')`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async actualizar( data ){

        const { id_coparte, nombre, id, tipo } = data
            
        const query = `UPDATE copartes SET nombre='${nombre}', id='${id}', tipo=${tipo} WHERE id_coparte=${id_coparte}`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async borrar( id ){
            
        const query = `DELETE FROM copartes WHERE id_coparte=${id} LIMIT 1`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }
}

export { CoparteDB }