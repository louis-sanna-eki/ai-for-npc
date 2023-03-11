import { useSession, signOut, signIn } from "next-auth/react";
import Button from "./Button";

const SignSession: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-center justify-center gap-4 ml-auto">
      <p className="text-center text-white">
        {sessionData && <span>Logged in as: {sessionData.user?.name}</span>}
      </p>
      <Button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
    </div>
  );
};

export default SignSession;
