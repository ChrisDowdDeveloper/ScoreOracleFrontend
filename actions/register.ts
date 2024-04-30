"use server";

import bcrypt from "bcrypt";
import * as z from "zod";

import { RegisterSchema } from "@/schemas";
import { findUserByEmail, findUserByUsername } from "./user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const API_URL = "http://localhost:8080";
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { username, email, password, firstName, lastName, dateOfBirth } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dateOfBirth,
        dateJoined: new Date().toISOString()
    };


    const existingUsername = await findUserByUsername(username);
    const existingEmail = await findUserByEmail(email);
    if(existingUsername) {
        return { error: "Username already exists!" };
    }
    if(existingEmail) {
        return { error: "Email already exists!" }
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
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
