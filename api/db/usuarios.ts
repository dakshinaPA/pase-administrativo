import { queryDB, queryDBPlaceHolder } from './query'
import { Usuario, LoginUsuario } from '@api/models/usuarios.model'

class UsuarioDB {

    static async login( { email, password }: LoginUsuario ){

        const query = "SELECT * FROM usuarios WHERE email=? AND password=? AND b_activo=1"
        const placeHolders = [ email, password ]
        const res = await queryDBPlaceHolder( query, placeHolders )
        return res
    }

    // static async loggear( idUsuario: number ) {

    //     const query = `UPDATE usuarios SET login=1 WHERE id_usuario=${idUsuario} LIMIT 1`
    
    //     try {
    //         const res = await queryDB( query )
    //         return RespuestaDB.exitosa( res )
    //     } catch (error) {
    //         return RespuestaDB.fallida( error )
    //     }
    // }

    static async obtener( id?: number ){

        let query = 'SELECT id_usuario, nombre, apellido_paterno, apellido_materno, email, id_rol, password FROM `usuarios` WHERE b_activo=1'

        if( id ){
            query += ` AND id_usuario=${id} LIMIT 1`
        }

        const res = await queryDB( query )
        return res
    }

    static async crear( data: Usuario ){

        const { nombre, apellido_paterno, apellido_materno, email, id_rol, password } = data
            
        const query = 'INSERT INTO usuarios ( nombre, apellido_paterno, apellido_materno, email, id_rol, password ) VALUES (?, ?, ?, ?, ?, ?)'
        const placeHolders = [ nombre, apellido_paterno, apellido_materno, email, id_rol, password ]
        const res = await queryDBPlaceHolder( query, placeHolders )
        return res
    }

    static async actualizar( id: number, data: Usuario ){

        const { nombre, apellido_paterno, apellido_materno, email, id_rol, password } = data
            
        const query = `UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, email=?, id_rol=?, password=? WHERE id_usuario=? LIMIT 1`
        const placeHolders = [ nombre, apellido_paterno, apellido_materno, email, id_rol, password, id ]
        const res = await queryDBPlaceHolder( query, placeHolders )
        return res
    }

    static async borrar( id: number ){
            
        const query = `UPDATE usuarios SET b_activo=0 WHERE id_usuario=${id} LIMIT 1`
        const res = await queryDB( query )
        return res
    }
    
}

export { UsuarioDB }