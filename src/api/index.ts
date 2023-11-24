import axios from "axios"
import uuid from "react-uuid"

import config from "@root/config"

import logger from "@helpers/logger"

const api = axios.create({
  withCredentials: true,
  baseURL: `https://${config.host}/api`,
  headers: {
    "Content-Type": "application/json"
  }
})

export const getLocalIp = async (): Promise<string> => {
  const defaultIp = `anonymous-${uuid().slice(0, 13)}`

  try {
    const response = await api.get("/ip")
    return response.data.ip || defaultIp
  } catch (error) {
    logger.error(error)
    return defaultIp
  }
}

export const getStats = async () => {
  try {
    const response = await api.get("/stats")
    return response.data.contacts || Math.floor(Math.random() * 10)
  } catch (error) {
    logger.error(error)
    return 0
  }
}
