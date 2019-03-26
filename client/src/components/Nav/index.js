import React from "react";
import { Link } from "react-router-dom";

import './Nav.css';

function Nav() {
    return (
        <div className="side-nav">
            <button><Link to={{ pathname: '/'}}>Home</Link></button>
            <button><Link to={{ pathname: '/lobby'}}>Lobby</Link></button>
        </div>
    )
}

export default Nav;