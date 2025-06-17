import axios from 'axios';

const API = axios.create({
  baseURL: 'https://your-fastapi-domain.com', // e.g., https://api.taskmgmt.dev
});

export default API;