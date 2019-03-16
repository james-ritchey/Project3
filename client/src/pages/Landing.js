import React, { Component } from "react";
//import { Link } from "react-router-dom";
import voyagerLogo from '../img/voyager_logo.svg';
import coverShip from '../img/cover_ship.svg';
import usersNav from "../img/users_nav.svg";
import Form from "../components/Form";
import { Redirect } from 'react-router-dom';

import "./Landing.css";

class Login extends Component {
  state = {
    login : false,
    signup: false
  }

  onEnter = () => {
    //show Login form 
    this.setState({ login: true });
  }


  renderObj() {
    if(!this.state.login && !this.state.signup) {
      return (
        <div>
          <img src={coverShip} className="cover-ship" alt="ship" />
          <img src={voyagerLogo} className="App-logo" alt="logo" />
          {/*Enter button*/}
          
          <img src={usersNav} className="users-nav" alt="users" onClick={this.onEnter} />
        </div>
      )
    } else if(this.state.login) {
      return <Form formBtntext="Login" onSubmit={this.props.onLogin} loginSignupState={() => this.setState({ login: false, signup: true})}/>
    } else {
      return <Form formBtntext="Signup" onSubmit={this.props.onSignup} loginSignupState={() => this.setState({ login: true, signup: false})}/>
    }
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
        {this.props.user.isAuth ? <Redirect to={{ pathname:"/lobby", state: { user: this.props.user }}} /> : this.renderObj()}
        </header>
      </div>
      
    )
  }
}

export default Login;