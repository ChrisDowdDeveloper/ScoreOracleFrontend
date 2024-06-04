import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { authenticateUser, createUser, getUserByEmail } from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";

export interface DecodedJWT {
    sub: string;
    email: string;
    given_name: string;
    role: string;
    [key: string]: any;
}

const generateUniqueUsername = (name: string): string => {
    const baseName = name.replace(/\s+/g, '_'); // Replace spaces with underscores
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
    return `${baseName}_${randomSuffix}`;
};

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    callbacks: {
        async session({ session, token }) {
            console.log("Session callback");
            console.log("Token:", token);
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.token = token.token;
                session.user.userName = token.name;
                session.user.role = token.role;
            }

            return session;
        },
        async jwt({ token, user, account }) {
            console.log("JWT callback");
            console.log("Account:", account);
            console.log("User:", user);
            console.log("Token before processing:", token);

            if (account && user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.userName;
                token.token = user.token || account.id_token || ""; // Use id_token for JWT
                token.role = user.role;
                token.provider = account.provider; // Add provider information to the token

                try {
                    console.log("Checking for existing user with:", user.email);
                    const existingUser = await getUserByEmail(user.email as string);
                    console.log("Existing user check done");
                    if (existingUser) {
                        console.log("Existing user found");

                        // Check if the provider matches
                        if (existingUser.provider && existingUser.provider !== account.provider) {
                            console.error(`User ${existingUser.email} exists but signed in with a different provider: ${existingUser.provider}`);
                            throw new Error(`User exists with a different provider: ${existingUser.provider}`);
                        }

                        token.sub = existingUser.id;
                        token.email = existingUser.email;
                        token.name = existingUser.userName;
                        token.role = existingUser.role;
                        token.token = existingUser.token || token.token; // Use existing user token or fallback

                        console.log("Token properties after setting from existing user:", {
                            sub: token.sub,
                            email: token.email,
                            name: token.name,
                            role: token.role,
                            token: token.token,
                            provider: token.provider
                        });

                        console.log(`User ${existingUser.email} logged in with existing account.`);
                    } else {
                        console.log("No existing user found");
                        const uniqueUserName = generateUniqueUsername(user.userName);
                        const newUser = await createUser({
                            email: user.email as string,
                            userName: uniqueUserName,
                            role: user.role as string,
                            password: 'defaultPassword123',  // Provide a default password for social logins
                            firstName: user.firstName || '',  // Provide default values for firstName
                            lastName: user.lastName || ''     // Provide default values for lastName
                        });

                        token.sub = newUser.id;
                        token.email = newUser.email;
                        token.name = newUser.userName;
                        token.role = newUser.role;
                        token.token = newUser.token || ""; // Ensure token is set
                        token.provider = account.provider; // Set provider for new user

                        console.log(`User ${newUser.email} created and logged in.`);
                    }
                } catch (error) {
                    console.error("Error creating or updating user in jwt callback:", error);
                    return Promise.reject(error);
                }
            } else if (token.token && typeof token.token === 'string') {
                try {
                    console.log("Decoding token:", token.token);
                    const decodedToken: DecodedJWT = jwtDecode(token.token);
                    token.role = decodedToken.role; // Ensure role is extracted from the decoded token
                } catch (error) {
                    console.error("Error decoding token:", error);
                    return Promise.reject(error);
                }
            } else {
                console.error("Token is not a valid string:", token.token);
                return Promise.reject(new Error("Token is not a valid string"));
            }

            console.log("Token after processing:", token);
            return token;
        }
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    email: profile.email,
                    userName: profile.name,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    role: 'user', // Default role, update as needed
                    provider: 'google'
                };
            }
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.id,
                    email: profile.email,
                    userName: profile.name,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    role: 'user', // Default role, update as needed
                    provider: 'facebook'
                };
            }
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
                        role: decodedToken.role, // Extracted role from the token
                        provider: 'credentials' // Set provider for credentials login
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
