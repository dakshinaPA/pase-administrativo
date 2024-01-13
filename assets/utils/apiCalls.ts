export interface ApiCallRes {
  error: boolean
  data: object[] | object
  mensaje?: string
}

const customHeaders = {
  "Content-Type": "application/json",
  "api-key": "true",
}

class ApiCall {
  static async get(url: string): Promise<ApiCallRes> {
    try {
      let res = await fetch(`/api${url}`, {
        headers: customHeaders,
      })
      return (await res.json()) as ApiCallRes
    } catch (error) {
      console.log(error)
      return {
        error: true,
        data: error,
      }
    }
  }

  static async post(url: string, data: object): Promise<ApiCallRes> {
    try {
      let res = await fetch(`/api${url}`, {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(data),
      })
      return (await res.json()) as ApiCallRes
    } catch (error) {
      console.log(error)
      return {
        error: true,
        data: error,
      }
    }
  }

  static async put(url: string, data: object): Promise<ApiCallRes> {
    try {
      let res = await fetch(`/api${url}`, {
        method: "PUT",
        headers: customHeaders,
        body: JSON.stringify(data),
      })
      return (await res.json()) as ApiCallRes
    } catch (error) {
      console.log(error)
      return {
        error: true,
        data: error,
      }
    }
  }

  static async delete(url: string): Promise<ApiCallRes> {
    try {
      let res = await fetch(`/api${url}`, {
        method: "DELETE",
        headers: customHeaders,
      })
      return (await res.json()) as ApiCallRes
    } catch (error) {
      console.log(error)
      return {
        error: true,
        data: error,
      }
    }
  }
}

export { ApiCall }
