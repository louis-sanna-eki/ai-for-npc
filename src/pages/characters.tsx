import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "./components/Layout";

const Characters: NextPage = () => {
  const { data: sessionData } = useSession();

  // if not authenticated, don't show anything
  if (!sessionData?.user) {
    return null;
  }

  return (
    <Layout>
      <div className="flex w-full">Hello Characters!</div>
    </Layout>
  );
};

export default Characters;
