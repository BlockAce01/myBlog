import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import jwt from 'jsonwebtoken'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }

      // Generate a JWT token that the backend can validate
      if (profile) {
        // For now, use the Google ID as userId - we'll handle user creation on the backend
        const backendPayload = {
          userId: token.sub || (profile as any).id,
          email: profile.email,
          name: profile.name,
          role: 'user'
        }
        token.backendToken = jwt.sign(backendPayload, process.env.JWT_SECRET!, { expiresIn: '7d' })
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string
      session.backendToken = token.backendToken as string
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST }
