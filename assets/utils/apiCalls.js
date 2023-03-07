class ApiCall {

    static async get( url ){
        try {
            let res = await fetch( url )
            return await res.json()
        } catch (error) {
            throw new Error( error )
        }
    }

    static async post( url, data ){
        try {
            let res = await fetch( url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify( data )
            })
            return await res.json()
        } catch (error) {
            throw new Error( error )
        }
    }

    static async put( url, data ){
        try {
            let res = await fetch( url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify( data )
            })
            return await res.json()
        } catch (error) {
            throw new Error( error )
        }
    }

    static async delete( url, id ){
        try {
            let res = await fetch( url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({ id })
            })
            return await res.json()
        } catch (error) {
            throw new Error( error )
        }
    }
}

export { ApiCall }