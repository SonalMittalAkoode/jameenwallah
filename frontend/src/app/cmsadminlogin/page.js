"use client";
import SignIn from "@/components/common/login-signup-modal/SignIn";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Login = () => {
  return (
    <section className="login-section">
      {/* Background Image */}
      <div className="login-bg-image">
        <Image
          src="/images/dashboard/dashboard_background.jpg"
          alt="Login Background"
          fill
          priority
          quality={90}
          className="login-bg-img"
        />
      </div>

      {/* Overlay */}
      <div className="login-overlay" />

      {/* Glassmorphism Form Container */}
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header text-center mb40">
            <Link href="/">
              <Image
                width={138}
                height={44}
                className="login-logo mb25"
                src="/images/big-cat-logo.png"
                alt="logo"
              />
            </Link>
            <h2 className="login-title">Login to CMS Dashboard</h2>
            <p className="login-subtext">
              Sign in with this account across the following sites.
            </p>
          </div>
          <SignIn />
        </div>
      </div>
    </section>
  );
};

export default Login;
