import axios from 'axios'

const baseURL = __DEV__
  ? process.env.EXPO_PUBLIC_DEV_API_URL
  : process.env.EXPO_PUBLIC_PROD_API_URL
  
const API = axios.create({
  baseURL,
})

export default API