import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          My Blog
        </Link>

        <nav className="flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          >
            Create Post
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          >
            Register
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
