import axios from 'axios';

import config from '../config/config';

const userURL = `${config.backendURL}/api/users`;
const Users = {
  login: (username, password, cb) => {
    axios.post(`${userURL}/login`, {
      username: username,
      password: password
    }).then(cb());
  },
  signup: (username, password, cb) => {
    axios.post(`${userURL}/signup`, {
      username: username,
      password: password
    }).then(cb());
  }
  
}

export default Users;