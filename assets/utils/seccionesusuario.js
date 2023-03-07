class RolUsario {
    constructor(id, nombre, secciones){
        this.id = id
        this.nombre = nombre
        this.secciones = secciones
    }
}

class AccionUsuario {
    constructor( id, titulo, link, icon){
        this.id = id
        this.titulo = titulo
        this.link = link
        this.icon = icon
    }
}


//SECCIONES

const REGISTRO_USUARIO = new AccionUsuario( 1, 'Registrar usuario', '/usuarios/registro', 'bi-person-add')
// const REGISTRO_COPARTE = new AccionUsuario( 2, 'Registrar coparte', '/copartes/registro', 'bi-person-add')
const REGISTRO_AIMILADOS = new AccionUsuario( 2, 'Registro de asimilados', '/asimilados/registro', 'bi-ui-checks' )
const REGISTRO_SOLCIITUD_PRESUPUESTO = new AccionUsuario( 3, 'Solicitud de presupuesto', '/presupuestos/registro', 'bi-ui-checks' )
const VER_SOLCIITUD_PRESUPUESTO = new AccionUsuario( 4, 'Solicitudes', '/presupuestos/', 'bi-ui-checks' )
const VER_COPARTES = new AccionUsuario( 5, 'Copartes', '/copartes', 'bi-list-ul' )
// const EDITAR_SOLCIITUD_PRESUPUESTO = new AccionUsuario( 6, 'Editar solicitudes', '/presupuestos/', 'bi-ui-checks' )


//ROLES

const SUPER_USUARIO = new RolUsario( 1, 'SUPER_USUARIO', [ VER_COPARTES, VER_SOLCIITUD_PRESUPUESTO ])
const ADMINISTRADOR = new RolUsario( 2, 'ADMINISTRADOR', [ VER_COPARTES, VER_SOLCIITUD_PRESUPUESTO ])
const COPARTE = new RolUsario( 3, 'COPARTE', [ REGISTRO_SOLCIITUD_PRESUPUESTO, REGISTRO_AIMILADOS ])

const ROLES = [ SUPER_USUARIO, ADMINISTRADOR, COPARTE ]


export { ROLES }