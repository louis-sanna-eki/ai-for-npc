import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { useState } from "react";
import Dialog from "./components/Dialog";
import Button from "./components/Button";
import Layout from "./components/Layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">AI</span> for NPC
        </h1>
        <h3 className="text-xl font-bold text-white">Transform Your Virtual Worlds with Cutting-Edge AI for NPC!</h3>
      </div>
    </Layout>
  );
};

export default Home;

