import React from "react"

import { CallDurationTimer } from "@root/components/CallDurationTimer"
import { Mic, MicOff } from "@root/components/Icons"

import styles from "../style.m.scss"

type Props = {
  answeredAt: Date
  muted: boolean
  handleMute: () => void
  hangup: () => void
  next: () => void
}

const InCall: React.FC<Props> = ({ answeredAt, muted, handleMute, hangup, next }) => {
  return (
    <>
      <div className={styles.main}>
        <CallDurationTimer answeredAt={answeredAt} className={styles.timer} />
      </div>

      <div className={styles.actions}>
        {answeredAt && (
          <div className={styles.mute} onClick={handleMute}>
            {muted ? <MicOff /> : <Mic />}
          </div>
        )}

        <div className={styles.buttons}>
          <button className={styles.darkButton} onClick={hangup}>
            Завершить
          </button>
          <button className={styles.darkButton} onClick={next}>
            Следующий
          </button>
        </div>
      </div>
    </>
  )
}

export default InCall
