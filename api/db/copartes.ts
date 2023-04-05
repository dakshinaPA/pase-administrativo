import { ResDB } from '@api/models/respuestas.model'
import { queryDB } from './query'
import { Coparte } from '@api/models/copartes.model'


class CoparteDB {

    static async obtener( id: number ): Promise<ResDB>{

        let query = 'SELECT * FROM `copartes` WHERE b_activo=1'

        if( id ){
            query += ` AND id_coparte=${id} LIMIT 1`
        }
    
        const res = await queryDB( query )
        return res
    }

    static async crear( data: Coparte ): Promise<ResDB> {

        const { nombre, id, id_tipo } = data
            
        const query = `INSERT INTO copartes ( nombre, id, id_tipo ) VALUES ('${nombre}', '${id}', '${id_tipo}')`
        const res = await queryDB( query )
        return res
    }

    static async actualizar( id_coparte: number, data: Coparte ): Promise<ResDB> {

        const { nombre, id, id_tipo } = data
            
        const query = `UPDATE copartes SET nombre='${nombre}', id='${id}', id_tipo=${id_tipo} WHERE id_coparte=${id_coparte}`
        const res = await queryDB( query )
        return res
    }

    static async borrar( id: number ): Promise<ResDB> {
            
        const query = `UPDATE copartes SET b_activo=0 WHERE id_coparte=${id} LIMIT 1`
        const res = await queryDB( query )
        return res
    }
}

export { CoparteDB }