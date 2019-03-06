import React from "react";
import "./style.css";
import usersNav from "../../users_nav.svg";
import loginNav from "../../login_nav.svg";
import profileNav from "../../profile_nav.svg";

function Nav(props) {
    return (
        <nav className="navbar">
        <img src={usersNav} className="users-nav" alt="users" />
        <img src={loginNav} className="login-nav" alt="login" />
        <img src={profileNav} className="profile-nav" alt="profile" />        
        </nav>
    )
}

export default Nav;