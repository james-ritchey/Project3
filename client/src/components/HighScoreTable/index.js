import React, { Component } from "react";
import User from '../../api/Users';

class HighScoreTable extends Component {

  constructor(props) {
    super(props);
    this.state = {  hiscoreList: null };
  }

  componentDidMount() {
    User.hiscores(10, (res) => {
      this.setState({ hiscoreList: res.data })
    })
  }

  hiscoreList() {
    if(!this.state.hiscoreList) {
      return <div>HI</div>
    } else {
      let hiscoreList = [];
      for(let i = 0; i < this.state.hiscoreList.length; i++) {
        hiscoreList.push(
          <li key={this.state.hiscoreList[i]._id}>{this.state.hiscoreList[i].username} : {this.state.hiscoreList[i].hiscore}</li>
        )
        
      }
      return hiscoreList;
    }
    
  }

  render() {
    return (
      <div>
        <h3>High Scores</h3>
        <ul>
          {this.hiscoreList()}
        </ul>
      </div>
    )
  }
}

export default HighScoreTable;