import { CoparteDB } from '../db/copartes'
import { RespuestaController } from '../utils/response'

class CopartesServices {

    static async obtener( id ){

        const res = await CoparteDB.obtener( id )
        
        if(res.error){
            return RespuestaController.fallida( 400, 'Error al obtener copartes', res.data )
        }
        const copartesHidratadas = res.data.map( cop => {

            let tipoTxt

            switch ( Number(cop.tipo) ) {
                case 1:
                    tipoTxt = "Constituida"
                    break;
                case 2:
                    tipoTxt = "No constituida"
                    break;
            }

            return { ...cop, tipoTxt }
        })
        return RespuestaController.exitosa( 200, 'Consulta exitosa', copartesHidratadas )
    }

    static async crear( data ){
        const res = await CoparteDB.crear( data )
        if(res.error){
            return RespuestaController.fallida( 400, 'Error al crear coparte', res.data )
        }
        return RespuestaController.exitosa( 201, 'Coparte creada con éxito', res.data )
    }

    static async actualizar( id, data ){
        const res = await CoparteDB.actualizar( id, data )
        if(res.error){
            return RespuestaController.fallida( 400, 'Error al actualziar coparte', res.data )
        }
        return RespuestaController.exitosa( 201, 'Coparte actualizada con éxito', res.data )
    }

    static async borrar( id ){
        const res = await CoparteDB.borrar( id )
        if(res.error){
            return RespuestaController.fallida( 400, 'Error al borrar coparte', res.data )
        }
        return RespuestaController.exitosa( 200, 'Coparte borrada con éxito', res.data )
    }
}

export { CopartesServices }