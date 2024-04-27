"use client"

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import { Button } from "../ui/button";

export const Social = () => {
  return (
    <div className="flex items-center w-full gap-x-2">
        <Button
            size="lg"
            className="w-full"
            variant="outline"
            onClick={() => {}}
        >
            <FcGoogle className="h-7 w-7" />
        </Button>
        <Button
            size="lg"
            className="w-full"
            variant="outline"
            onClick={() => {}}
        >
            <FaFacebook className="h-7 w-7" />
        </Button>
    </div>
  )
}