import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="relative hidden w-full h-full lg:w-1/2 lg:block">
          <Link to="/" className="block w-full h-full">
            <img
              src="/images/brand/login_plus.png"
              alt="Horizonte Plus — Conecta tu potencial con educación virtual de calidad"
              className="object-cover w-full h-full"
            />
          </Link>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
