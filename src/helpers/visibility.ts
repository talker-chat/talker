import { useState, useEffect } from "react"

import { isMobile } from "./device"

declare global {
  interface Document {
    msHidden?: boolean
    webkitHidden?: boolean
  }
}

const getBrowserVisibilityProp = () => {
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    return "visibilitychange"
  } else if (typeof document.msHidden !== "undefined") {
    return "msvisibilitychange"
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitvisibilitychange"
  }
}

const getBrowserDocumentHiddenProp = () => {
  if (typeof document.hidden !== "undefined") {
    return "hidden"
  } else if (typeof document.msHidden !== "undefined") {
    return "msHidden"
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitHidden"
  }
}

const getIsDocumentHidden = () => {
  const prop = getBrowserDocumentHiddenProp() as string
  return !document[prop]
}

export const useMobilePageVisibility = (): boolean => {
  if (!isMobile) return true

  const [isVisible, setIsVisible] = useState(getIsDocumentHidden())
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden())

  useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp() as string

    document.addEventListener(visibilityChange, onVisibilityChange, false)

    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange)
    }
  })

  return isVisible
}
