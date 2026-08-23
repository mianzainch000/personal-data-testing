import React from "react";
import LoginForm from "./(auth)/login/page";

const LoginFormPage = () => {
  return <LoginForm />;
};

export default LoginFormPage;

export function generateMetadata() {
  return { title: "Login" };
}
