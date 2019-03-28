import React from "react";
import { Link } from "react-router-dom";

import './Nav.css';

function Nav() {
    return (
        <div className="navContainer">
            <div className="homeNav">
            <button><Link to={{ pathname: '/'}}>Home       </Link><i className="material-icons">home</i></button>
            </div>
            <div className="lobbyNav">
            <button><Link to={{ pathname: '/lobby'}}>Lobby      </Link><i className="material-icons">assignment</i></button>
            </div>

        </div>
    )
}

export default Nav;