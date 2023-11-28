export type City = {
  id: number
  title: string
  area?: string
  country?: string
  region?: string
  important?: number
}

export type CityResponse = {
  response: {
    count: number
    items: Array<City>
  }
}
