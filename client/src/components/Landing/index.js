import React from "react";
import "./landing.css";
import usersNav from "../../img/users_nav.svg";
import profileNav from "../../img/profile_nav.svg";
import Container from "../Container";
import loginNav from "../../img/login_nav.svg";
import signupNav from "../../img/signup_nav.svg";
//import { Redirect } from 'react-router-dom';

import User from "../../api/Users"

const Nav = (props) => {
  const triggerText = 'Open form';

  const onSubmitLogin = (event) => {
    event.preventDefault(event);
    const { name, password } = event.target;
    User.login(name.value, password.value, function() {
      //return <Redirect to={ { pathname: '/game ' } }/>
    })
  };

  const onSubmitSignup = (event) => {
    event.preventDefault(event);
    const { name, password } = event.target;
    User.signup(name.value, password.value, () => {
      //this.props.history.push("/game")
    })
  };
  
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
}


export default Nav;