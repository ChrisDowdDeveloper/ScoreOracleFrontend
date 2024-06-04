export interface Credentials {
    email: string;
    password: string;
}

export interface User {
    email: string;
    userName: string;
    role: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

export interface DecodedJWT {
    sub: string;
    email: string;
    given_name: string;
    role: string;
    [key: string]: any; 
}