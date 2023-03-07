
class RespuestaDB {
    
    static exitosa( data ){
        return {
            data,
            error: false
        }
    }

    static fallida( data ){
        return {
            data,
            error: true
        }
    }
}

class RespuestaController {
    
    static exitosa( status, mensaje, data ){
        return {
            status,
            mensaje,
            error: false,
            data,
        }
    }

    static fallida( status, mensaje, data ){
        return {
            status,
            mensaje,
            error: true,
            data,
        }
    }
}

export { RespuestaDB, RespuestaController }