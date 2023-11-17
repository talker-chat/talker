import axios from "axios"

import config from "@root/config"

export const api = axios.create({
  withCredentials: true,
  baseURL: `https://${config.host}/api`,
  headers: {
    "Content-Type": "application/json"
  }
})
