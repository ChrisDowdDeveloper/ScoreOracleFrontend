"use server";

import bcrypt from "bcrypt";
import * as z from "zod";

import { RegisterSchema } from "@/schemas";
import { findUserByEmail, findUserByUsername } from "./user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const API_BASE_URL = process.env.BASE_DATABASE_URL;
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { userName, email, password, firstName, lastName } = validatedFields.data;
    const userData = {
        userName,
        email,
        password,
        firstName,
        lastName
    };

    console.log(userData);

    try {
        const response = await fetch(`${API_BASE_URL}/User/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error("There was an error processing the registration.");
        }

        const json = await response.json();
        return { success: "User created!", data: json };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: (error as Error).message };
    }
    // Optionally handle sending verification email here if needed
}
