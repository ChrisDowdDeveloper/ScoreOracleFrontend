import { Roboto_Condensed } from "next/font/google";
import logo from "../../public/Logo/lg-black.svg";
import Image from 'next/image';

import { cn } from "@/lib/utils";

const font = Roboto_Condensed({
    subsets: ["latin"],
    weight: ["600"]
});

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <Image src={logo} alt={"ScoreOracle Logo"} width={150}/>
            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    );
};