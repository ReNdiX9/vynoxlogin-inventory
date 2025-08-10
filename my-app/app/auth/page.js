// src/components/LoginPage.jsx
"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useState } from "react";
import Image from "next/image";
import { CiCalendar } from "react-icons/ci";

export default function LoginPage() {
  return (
    <div className="min-h-screen min-w-screen bg-blue-800">
      {/* NAVBAR & HEADER */}
      <header className="flex items-center justify-between shadow-md px-5 py-2 bg-black">
        {/* Logo */}
        <div className="flex items-center">
          <Image src="/vynoxlogo.jpg" width={50} height={50} alt="Logo picture" className="rounded-xl" />
        </div>

        {/* Navigation */}
        <nav className="flex  items-center justify-center">
          <ul className="flex  items-center justify-center list-none m-0 p-1 gap-12">
            {["LogIn", "Gift Cards", "Services", "About", "Contact"].map((link) => (
              <li key={link} className="flex justify-center items-center p-1 ">
                <a href="#" className="text-white text-md font-medium font-sans no-underline hover:underline ">
                  {link}
                </a>
              </li>
            ))}

            {/* Book now button */}
            <li>
              <button
                className="flex items-center gap-2 rounded-lg 
                           bg-gradient-to-r from-[#FFCC66] to-[#FF7E5F] 
                           px-6 py-2 text-white font-medium  
                           shadow-[0_0_10px_rgba(255,204,102,0.6),0_0_20px_rgba(255,126,95,0.5)] 
                           transition-all duration-300 hover:scale-105 cursor-pointer
                           hover:shadow-[0_0_15px_rgba(255,204,102,0.8),0_0_20px_rgba(255,126,95,0.7)]"
              >
                <CiCalendar className="text-xl" />
                <span>Book now</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
