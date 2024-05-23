import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { authenticateUser, getUserById } from "@/lib/db";
import { jwtDecode } from "jwt-decode";

interface DecodedJWT {
    sub: string;
    email: string;
    given_name: string;
    [key: string]: any; 
  }

export const { 
    handlers: { GET, POST }, 
    auth,
    signIn, 
    signOut 
} = NextAuth({
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.token = token.token;
                session.user.userName = token.name;
            }

            if(token.role && session.user) {
                session.user.role = token.role;
            }

            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.userName;
                token.token = user.token;
            }

            if(!token.sub) return token;

            const existingUser = await getUserById(token.sub as string, token.token as string);

            if(!existingUser) return token;

            token.role = existingUser.role;

            return token;
        }
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const validatedFields = LoginSchema.safeParse(credentials);

                    if (!validatedFields.success) {
                        console.log("Validation failed:", validatedFields.error);
                        return null;
                    }

                    const { email, password } = validatedFields.data;

                    console.log("Calling authenticateUser with:", { email, password });
                    const user = await authenticateUser({ email, password });

                    if (!user) {
                        console.log("Authentication failed: no user returned");
                        return null;
                    }

                    // Decode the JWT token to extract the `sub` claim
                    const decodedToken: DecodedJWT = jwtDecode(user.token);

                    return {
                        id: decodedToken.sub, // Extracted user ID from the token
                        email: user.email,
                        userName: user.username,
                        token: user.token
                    };
                } catch (error) {
                    console.error("Error in authorize function:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/auth/login'
    }
});