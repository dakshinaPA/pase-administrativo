export interface ApiCallRes {
  error: boolean
  data: object[]
  mensaje?: string
}

class ApiCall {
  static async get(url: string): Promise<ApiCallRes> {
    try {
      let res = await fetch(url)
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
      let res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      let res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json " },
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
      let res = await fetch(url, {
        method: "DELETE",
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
