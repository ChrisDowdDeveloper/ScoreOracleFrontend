import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required."
    }),
    password: z.string().min(1, {
        message: "Password is required."
    }),
});

export const RegisterSchema = z.object({
    username: z.string().min(1, {
        message: "Username is required and must be unique."
    }),
    email: z.string().email({
        message: "Email is required and must be unique."
    }),
    password: z.string().min(6, {
        message: "Password needs to be at least 6 characters."
    }),
    firstName: z.string().min(1, {
        message: "First name is required."
    }),
    lastName: z.string().min(1, {
        message: "Last name is required."
    }),
    dateOfBirth: z.string(),
});