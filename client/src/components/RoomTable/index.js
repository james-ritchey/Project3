import React, { Component } from "react";
import { Link } from "react-router-dom";


class RoomTable extends Component {
    
    render() {
        return (
            <div>
                <ul>
                <li><Link to={{ pathname: '/game/1', state: { users: this.props.user } }}>Room 1</Link></li>
                <li><Link to={{ pathname: '/game/2', state: { users: this.props.user } }}>Room 2</Link></li>
                <li><Link to={{ pathname: '/game/3', state: { users: this.props.user } }}>Room 3</Link></li>
                <li><Link to={{ pathname: '/game/4', state: { users: this.props.user } }}>Room 4</Link></li>
                <li><Link to={{ pathname: '/game/5', state: { users: this.props.user } }}>Room 5</Link></li>
                <li><Link to={{ pathname: '/game/6', state: { users: this.props.user } }}>Room 6</Link></li>
                <li><Link to={{ pathname: '/game/7', state: { users: this.props.user } }}>Room 7</Link></li>
                <li><Link to={{ pathname: '/game/8', state: { users: this.props.user } }}>Room 8</Link></li>
                <li><Link to={{ pathname: '/game/9', state: { users: this.props.user } }}>Room 9</Link></li>
                <li><Link to={{ pathname: '/game/10', state: { users: this.props.user } }}>Room 10</Link></li>
                </ul>
            </div>
        )
    }
}

export default RoomTable;