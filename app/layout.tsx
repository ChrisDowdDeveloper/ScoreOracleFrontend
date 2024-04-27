import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScoreOracle",
  description: "ScoreOracle is an application designed to engage sports enthusiasts by allowing them to predict the outcomes of sports games. The main objective of ScoreOracle is to provide a platform where users can sign up, set up their profiles, and engage with daily sports games by predicting which teams will win. It aims to enhance the sports viewing experience by adding an interactive element of competition and prediction to the mix.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
