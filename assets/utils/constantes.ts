const rolesUsuario = {
  SUPER_USUARIO: 1,
  ADMINISTRADOR: 2,
  COPARTE: 3,
}

const tiposGasto = {
  REEMBOLSO: 1,
  PAGO_A_PROVEEDOR: 2,
  ASIMILADOS: 3,
  HONORARIOS: 4,
  GASTOS_X_COMPROBAR: 5,
}

const tiposColaborador = {
  ASIMILADOS: 1,
  HONORARIOS: 2,
  SIN_PAGO: 3,
}

const tiposProveedor = {
  FISICA: 1,
  MORAL: 2,
  EXTRANJERO: 3,
}

const estatusSolicitud = {
  REVISION: 1,
  AUTORIZADA: 2,
  RECHAZADA: 3,
  PROCESADA: 4,
  DEVOLUCION: 5,
}

const rubrosPresupuestales = {
  GESTION_FINANCIERA: 1,
  ASIMILADOS: 2,
  HONORARIOS: 3,
  DONATIVOS_Y_AYUDAS: 15,
  PAGOS_EXTRANJERO: 22,
  EJECUTADO_EJERCICIOS_ANTERIORES: 23,
}

const tiposFinanciamiento = {
  ESTIPENDIO: 1,
  UNICA_MINISTRACION: 2,
  VARIAS_MINISTRACIONES: 3,
  MULTI_ANUAL: 4,
}

const tiposAjusteProyecto = {
  REINTEGRO: 1,
  ACREEDORES: 2,
}

const copartes = {
  VIOLENCIAS: {
    id: 126
  }
}

const rfcReceptores = {
  DAKSHINA: "DAK1302063W9",
  VIOLENCIAS: "CIE800912J23"
}

const clavesProductoServicio = {
  GAS_REGULAR: "15101514",
  GAS_PREMIUM: "15101515",
  DIESEL: "15101505"
}

export {
  rolesUsuario,
  tiposGasto,
  estatusSolicitud,
  rubrosPresupuestales,
  tiposColaborador,
  tiposProveedor,
  tiposFinanciamiento,
  tiposAjusteProyecto,
  rfcReceptores,
  copartes,
  clavesProductoServicio
}
