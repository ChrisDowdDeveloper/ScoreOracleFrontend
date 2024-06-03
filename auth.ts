import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { authenticateUser, getUserById } from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

interface DecodedJWT {
    sub: string;
    email: string;
    given_name: string;
    role: string;
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
                session.user.role = token.role;
            }

            return session;
        },
        async jwt({ token, user, account }) {
            if (account && user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.userName;
                token.token = user.token;
                token.role = user.role; // Ensure the role is added to the token
            } else if (token.token && typeof token.token === 'string') {
                try {
                    const decodedToken: DecodedJWT = jwtDecode(token.token);
                    token.role = decodedToken.role; // Ensure role is extracted from the decoded token
                } catch (error) {
                    console.error("Error decoding token:", error);
                }
            } else {
                console.error("Token is not a valid string:", token.token);
            }

            return token;
        }
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        }),
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

                    // Decode the JWT token to extract the `sub` claim and role
                    const decodedToken: DecodedJWT = jwtDecode(user.token);

                    return {
                        id: decodedToken.sub, // Extracted user ID from the token
                        email: user.email,
                        userName: user.username,
                        token: user.token,
                        role: decodedToken.role // Extracted role from the token
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
