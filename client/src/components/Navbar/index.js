import React from "react";
import "./Navbar.css";
import usersNav from "../../users_nav.svg";
import profileNav from "../../profile_nav.svg";
import Container from "../Container";
import loginNav from "../../login_nav.svg";
import signupNav from "../../signup_nav.svg";

import User from "../../api/Users"

const Nav = () => {
  const triggerText = 'Open form';

  const onSubmitLogin = (event) => {
    event.preventDefault(event);
    const { name, password } = event.target;
    User.login(name.value, password.value, () => {
      //this.props.history.push("/game")
    })
  };

  const onSubmitSignup = (event) => {
    event.preventDefault(event);
    const { name, password } = event.target;
    User.signup(name.value, password.value, () => {
      //this.props.history.push("/game")
    })
  };
<<<<<<< HEAD
    return (
        <nav className="navbar">
        <img src={usersNav} className="users-nav" alt="users" />
        <Container src={loginNav} className="login-nav" triggerText={triggerText} onSubmit={onSubmit}
        formBtntext="login" />
        <Container src={signupNav} className="signup-nav" triggerText={triggerText} onSubmit={onSubmit}
        formBtntext="sign up" />
        <img src={profileNav} className="profile-nav" alt="profile" />
        </nav>
    )
=======
  
  return (
      <nav className="navbar">
      <img src={usersNav} className="users-nav" alt="users" />
      <Container src={loginNav} className="login-nav" triggerText={triggerText} onSubmit={onSubmitLogin}
      formBtnText="Login" />
      <Container src={signupNav} className="signup-nav" triggerText={triggerText} onSubmit={onSubmitSignup}
      formBtnText="Sign Up" />
      <img src={profileNav} className="profile-nav" alt="profile" />
      </nav>
  )
>>>>>>> f969bd3ff287be85d588c9913f2c8af9dc28bf73
}


export default Nav;