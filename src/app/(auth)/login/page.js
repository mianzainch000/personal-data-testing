import React from "react";
import LoginForm from "./template";

const LoginFormPage = () => {
  return <LoginForm />;
};

export default LoginFormPage;

export function generateMetadata() {
  return { title: "Login" };
}
