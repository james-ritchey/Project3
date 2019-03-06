import axios from 'axios';

import config from '../config/config';

const userURL = `${config.backendURL}/api/users`;
const Users = {
  login: (username, password) => {
    axios.post(`${userURL}/login`, {
      username: username,
      password: password
    }).then(test => console.log(test));
  },
  signup: (username, password) => {
    axios.post(`${userURL}/signup`, {
      username: username,
      password: password
    }).then(test => console.log(test));
  }
  
}

export default Users;