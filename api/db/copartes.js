import { RespuestaDB } from '../utils/response'
import { queryDB } from './query'

class CoparteDB {

    static async obtener( id ){

        let query = 'SELECT * FROM `copartes` WHERE b_activo=1'

        if( id ){
            query += ` AND id_coparte=${id} LIMIT 1`
        }
    
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

    static async actualizar( id_coparte, data ){

        const { nombre, id, tipo } = data
            
        const query = `UPDATE copartes SET nombre='${nombre}', id='${id}', tipo=${tipo} WHERE id_coparte=${id_coparte}`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }

    static async borrar( id ){
            
        const query = `UPDATE copartes SET b_activo=0 WHERE id_coparte=${id} LIMIT 1`
    
        try {
            const res = await queryDB( query )
            return RespuestaDB.exitosa( res )
        } catch (error) {
            return RespuestaDB.fallida( error )
        }
    }
}

export { CoparteDB }