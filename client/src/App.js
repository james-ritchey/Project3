import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import Landing from './pages/Landing';
import Game from './pages/Game';
import User from './api/Users';
import Lobby from './pages/Lobby';


class App extends Component {
  state = {
    user: {
      isAuth: false,
      username: ""
    }
  }

  onLogin = (event) => {
    event.preventDefault();
    const { name, password } = event.target;
    User.login(name.value, password.value, (res) => {
      this.setState( { user: { isAuth: true, username: res.data.username }});
    })
    //redirect here
  }

  onSignup = (event) => {
    event.preventDefault();
    const { name, password } = event.target;
    User.signup(name.value, password.value, (res) => {
      this.setState( { user: { isAuth: true, username: res.data.username }});
    })
    //Set state if authenticates with backend
  }

  render() {
    return (
      <Router>
      <div>
        {console.log(this.state)}
        <Switch>
          <Route exact path="/lobby"
            render={() => this.state.user.isAuth ? (<Lobby user={this.state.user} />) : (<Redirect to="/" />)}
          />
          <Route exact path="/game/:id"
            render={() => this.state.user.isAuth ? (<Game user={this.state.user} />) : (<Redirect to="/" />)}
          />
          <Route path='/'
            render={() => <Landing user={this.state.user} onLogin={this.onLogin} onSignup={this.onSignup}  />}
          /> 
        </Switch>
      </div>
    </Router>
    );
  }
}

export default App;
