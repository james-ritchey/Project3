import React, { Component } from "react";
//import { Link } from "react-router-dom";
import voyagerLogo from '../voyager_logo.svg';
import coverShip from '../cover_ship.svg';
import Nav from '../components/Navbar';

class Login extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={coverShip} className="cover-ship" alt="ship" />
          <img src={voyagerLogo} className="App-logo" alt="logo" />
          <Nav />
        </header>
      </div>
      
    )
  }
}

export default Login;