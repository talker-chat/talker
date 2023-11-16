const numberFormat = (number: number) => {
  return number.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ")
}

export const durationFormat = (secondsDuration: number) => {
  const duration = Math.floor(secondsDuration) || 0

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration - hours * 3600) / 60)
  const seconds = duration - minutes * 60 - hours * 3600

  const hoursStr = hours > 0 ? `${hours}:` : ""
  const minStr = minutes < 10 ? `0${minutes}` : numberFormat(minutes)
  const secStr = seconds < 10 ? `0${seconds}` : seconds

  return `${hoursStr}${minStr}:${secStr}`
}
