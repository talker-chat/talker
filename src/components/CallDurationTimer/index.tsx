import dayjs from "dayjs"
import React, { useEffect, useState, useRef } from "react"

import { durationFormat } from "@helpers/formatter"

type Props = {
  answeredAt: Date
  className?: string
}

const CallDurationTimer: React.FC<Props> = ({ answeredAt, className }) => {
  const [duration, setDuration] = useState(0)
  const timerRef = useRef<number>(0)

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setDuration(dayjs().diff(answeredAt, "seconds"))
    }, 1000)

    return () => {
      window.clearInterval(timerRef.current)
    }
  }, [])

  return <div className={className}>{durationFormat(duration)}</div>
}

export default CallDurationTimer
