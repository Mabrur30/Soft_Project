import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";

export default function Navbar({ onLoginClick }) {
  return (
    <nav className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm">
            UL
          </div>
          <span className="font-bold text-slate-900 hidden sm:inline">
            UIU Lab Inventory
          </span>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink
            to="/"
            className="text-slate-600 hover:text-primary-500 transition-colors"
          >
            Features
          </NavLink>
          <NavLink
            to="/"
            className="text-slate-600 hover:text-primary-500 transition-colors"
          >
            About
          </NavLink>
          <NavLink
            to="/"
            className="text-slate-600 hover:text-primary-500 transition-colors"
          >
            Contact
          </NavLink>
        </div>

        {/* Login */}
        <Button size="sm" variant="secondary" onClick={onLoginClick}>
          Login
        </Button>
      </div>
    </nav>
  );
}
