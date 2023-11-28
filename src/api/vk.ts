import axios from "axios"

import config from "@root/config"

import logger from "@helpers/logger"

import { City, CityResponse } from "@interfaces/city"

const api = axios.create({
  withCredentials: true,
  baseURL: `https://${config.vk.host}/method`,
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(
  req => {
    req.url = req.url + `&access_token=${config.vk.token}`
    return req
  },
  error => {
    Promise.reject(error)
  }
)

export const getCities = async (q?: string): Promise<Array<City>> => {
  try {
    const response = await api.get<CityResponse>(
      `/database.getCities?v=${config.vk.v}${q ? `&q=${q}` : ""}&count=5&need_all=0`
    )
    return response.data.response.items
  } catch (error) {
    logger.error(error)
    return []
  }
}
