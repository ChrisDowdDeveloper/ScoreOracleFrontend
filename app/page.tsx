import React from 'react';
import { Roboto_Condensed } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import Image from 'next/image';
import logo from "../public/Logo/lg-black.svg"

const font = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["600"]
})

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-100">
      <div className='space-y-6 text-center'>
        <Image className="mx-auto" src={logo} alt={'ScoreOracle logo'} width={300} />
        <p className={cn('text-black text-lg', font.className)}>
          ScoreOracle is a competitive app designed to engage sports enthusiasts by allowing them to predict the outcomes of sports games
        </p>
        <div>
          <LoginButton>
            <Button variant="secondary" size="lg" className='font-bold'>
              Sign In
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
