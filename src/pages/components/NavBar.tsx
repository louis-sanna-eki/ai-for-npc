import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import SignSession from "./SignSession";

const Navbar = () => {
  const router = useRouter();

  const { data: sessionData } = useSession();
  const isLoggedIn = !!sessionData?.user;


  return (
    <nav className="fixed left-0 top-0 h-20 w-full bg-gray-800 text-white">
      <div className="mx-12 flex h-full max-w-6sxl items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold sm:text-3xl">AI for NPC</h1>
        </div>
        <ul className="ml-12 flex items-center">
          <NavItem href="/" isActive={router.pathname === "/"}>
            Home
          </NavItem>
          {isLoggedIn ? <NavItem href="/characters" isActive={router.pathname === "/characters"}>
            NPC creator
          </NavItem>: null}
          {isLoggedIn ? <NavItem href="/chat" isActive={router.pathname === "/chat"}>
            Chat
          </NavItem>: null}
        </ul>
      <SignSession />
      </div>
    </nav>
  );
};

const NavItem = ({ href, isActive, children }: any) => {
  const activeClass = isActive ? "bg-gray-700" : "";
  return (
    <li className={`mx-3 rounded-md px-3 py-2 ${activeClass}`}>
      <Link href={href} className="hover:text-gray-300">
        {children}
      </Link>
    </li>
  );
};

export default Navbar;
