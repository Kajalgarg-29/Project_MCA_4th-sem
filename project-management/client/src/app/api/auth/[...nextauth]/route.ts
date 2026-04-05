import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            return {
              id: String(data.user.userId),
              name: data.user.username,
              email: data.user.email,
              accessToken: data.token,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              username: user.name?.replace(/\s+/g, "").toLowerCase() || user.email?.split("@")[0],
              googleId: user.id,
            }),
          });
          const data = await res.json();
          if (data.token) {
            (user as any).accessToken = data.token;
            (user as any).dbUserId = data.user.userId;
            (user as any).dbUsername = data.user.username;
          }
        } catch {
          // Allow sign in even if DB sync fails
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.userId = (user as any).dbUserId || user.id;
        token.username = (user as any).dbUsername || user.name;
        token.email = user.email;
      }
      if (account?.provider === "google") {
        token.provider = "google";
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.user.userId = token.userId;
      session.user.username = token.username;
      session.user.email = token.email;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
