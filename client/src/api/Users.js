import axios from 'axios';

import config from '../config/config';

const userURL = `${config.backendURL}/api/users`;
const Users = {
  login: (username, password, cb) => {
    axios.post(`${userURL}/login`, {
      username: username,
      password: password
    }).then(res => cb(res));
  },
  signup: (username, password, cb) => {
    axios.post(`${userURL}/signup`, {
      username: username,
      password: password
    }).then(res => cb(res));
  },
  hiscores: (limit, cb) => {
    axios.get(`${userURL}/hiscores?limit=${limit}`)
      .then(res => cb(res))
  }
  
}

export default Users;