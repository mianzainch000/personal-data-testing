import React from "react";
import SignupForm from "./template";

const SignupPage = () => {
  return <SignupForm />;
};

export default SignupPage;

export function generateMetadata() {
  return { title: "Signup" };
}
