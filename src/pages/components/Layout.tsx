import Head from 'next/head'
import { ReactNode } from "react";
import Navbar from './NavBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>AI for NPC</title>
        <meta name="description" content="AI for NPC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar/>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {children}
      </main>
    </>
  );
}
