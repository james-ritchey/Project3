import React, { Component } from 'react';
import voyagerLogo from './voyager_logo.svg';
import splashShip from './splash_ship.svg';
import './App.css';
import Nav from './components/Navbar';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={splashShip} className="splash-ship" alt="ship" />
          <img src={voyagerLogo} className="App-logo" alt="logo" />
        </header>
        <Nav />
      </div>
    );
  }
}

export default App;
