import axios from "axios"
import uuid from "react-uuid"

import config from "@root/config"

import logger from "@helpers/logger"

import { City, CityResponse } from "@interfaces/city"

const api = axios.create({
  withCredentials: true,
  baseURL: `https://${config.sip.host}/api`,
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

export const getCities = async (search?: string): Promise<Array<City>> => {
  try {
    const response = await api.get<CityResponse>(`/vk/cities?search=${search}`)
    return response.data.cities
  } catch (error) {
    logger.error(error)
    return []
  }
}
