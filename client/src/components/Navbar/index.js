import React from "react";
import "./Navbar.css";
import usersNav from "../../users_nav.svg";
import profileNav from "../../profile_nav.svg";
import Container from "../Container";

import User from "../../api/Users"

const Nav = () => {
    const triggerText = 'Open form';
    const onSubmit = (event) => {
    event.preventDefault(event);
    const { name, password } = event.target;
    User.login(name.value, password.value);
    console.log(event.target.password.value);
  };
    return (
        <nav className="navbar">
        <img src={usersNav} className="users-nav" alt="users" />
        <Container triggerText={triggerText} onSubmit={onSubmit} />
        <img src={profileNav} className="profile-nav" alt="profile" />
        </nav>
    )
}


export default Nav;