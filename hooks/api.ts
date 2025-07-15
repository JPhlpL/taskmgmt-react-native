import axios from 'axios'

// const baseURL = __DEV__
//   ? process.env.EXPO_PUBLIC_PROD_API_URL // on this one, if you put the prod api url, it will fetches first
//   : process.env.EXPO_PUBLIC_DEV_API_URL 

const baseURL = process.env.EXPO_PUBLIC_PROD_API_URL // on this one, if you put the prod api url, it will fetches first
  
const API = axios.create({
  baseURL,
})

export default API