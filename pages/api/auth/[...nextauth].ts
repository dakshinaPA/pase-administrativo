import { UsuariosServices } from "@api/services/usuarios"
import { Usuario } from "@models/usuario.model"
// import { Usuario } from "@models/usuario.model"
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  debug: false,
  session: {
    strategy: "jwt",
    // maxAge: 20
  },
  jwt: {},
  // forma en que queremos que se conecte para delegar auth
  pages: {
    signIn: "/login",
    // error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        const nuevoToken = {
          ...token,
          accessToken: account.access_token,
          id: user.id,
          //@ts-ignore
          nombre: user.nombre,
          //@ts-ignore
          id_rol: user.id_rol,
        }

        return nuevoToken
      }
      return token
    },
    async session({ session, token, user }) {
      const nuevaSesion = {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.id,
          nombre: token.nombre,
          id_rol: token.id_rol,
        },
      }

      return nuevaSesion
    },
  },
  providers: [
    CredentialsProvider({
      name: "Dakshina",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(creds, req) {
        const { error, data } = await UsuariosServices.login(creds)

        if (error) {
          return null
        }

        const usuarioEncontrado = data[0] as Usuario

        return {
          id: String(usuarioEncontrado.id),
          nombre: `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido_paterno} ${usuarioEncontrado.apellido_materno}`,
          id_rol: usuarioEncontrado.id_rol,
        }
      },
    }),
  ],
}

export default NextAuth(authOptions)

