import { ResController, ResDB } from '@api/models/respuestas.model'

class RespuestaDB {
    
    static exitosa( data: [] ): ResDB {
        return {
            data,
            error: false
        }
    }

    static fallida( data: object ): ResDB {
        return {
            data,
            error: true
        }
    }
}

class RespuestaController {
    
    static exitosa( status: number, mensaje: string, data: [] | object ): ResController {
        return {
            status,
            mensaje,
            error: false,
            data,
        }
    }

    static fallida( status: number, mensaje: string, data: [] | object ): ResController {
        return {
            status,
            mensaje,
            error: true,
            data,
        }
    }
}

export { RespuestaDB, RespuestaController }