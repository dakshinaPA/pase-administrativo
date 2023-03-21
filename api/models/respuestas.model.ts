export interface ResController {
    status: number
    mensaje: string
    error: boolean,
    data: Array<object> | object
}

export interface ResDB {
    error: boolean,
    data: Array<object> | object
}