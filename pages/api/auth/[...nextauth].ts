import { Usuario } from "@models/usuario.model"
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const options: NextAuthOptions = {
  debug: true,
  session: {},
  jwt: {},
  // forma en que queremos que se conecte para delegar auth
  pages: {
    signIn: "/login",
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
        // console.log(creds.email)
        // return null

        const usuario = {
          id: "22",
          nombre: "Omar Maldonado",
          id_rol: 2,
        }

        return usuario
        // return null
      },
    }),
  ],
}

export default NextAuth(options)
