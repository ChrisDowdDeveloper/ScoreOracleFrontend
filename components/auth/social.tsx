"use client"

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {

    const onClick = async (provider: "google" | "facebook") => {
        try {
            await signIn(provider, {
                callbackUrl: DEFAULT_LOGIN_REDIRECT,
            });
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => onClick("google")}
            >
                <FcGoogle className="h-7 w-7" />
            </Button>
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => onClick("facebook")}
            >
                <FaFacebook className="h-7 w-7" />
            </Button>
        </div>
    )
}