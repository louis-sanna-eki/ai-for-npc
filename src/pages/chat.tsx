import { NextPage } from "next";
import Dialog from "./components/Dialog";
import Layout from "./components/Layout";

const Chat: NextPage = () => {
  return (
    <Layout>
      <span className="text-white pt-16">
        <Dialog prompt="This is a placeholder prompt" />
      </span>
    </Layout>
  );
};

export default Chat;
