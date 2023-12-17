import CallDurationTimer from "@components/CallDurationTimer"
import { Mic, MicOff } from "@components/Icons"
import VolumeRange from "@components/VolumeRange"
import React from "react"

import styles from "../style.m.scss"

type Props = {
  answeredAt: Date
  streamAudio: HTMLAudioElement | null
  muted: boolean
  handleMute: () => void
  hangup: () => void
}

const InCall: React.FC<Props> = ({ answeredAt, streamAudio, muted, handleMute, hangup }) => {
  return (
    <>
      <div className={styles.main}>
        <CallDurationTimer answeredAt={answeredAt} className={styles.timer} />
      </div>

      <div className={styles.actions}>
        {!!streamAudio && <VolumeRange audio={streamAudio} />}

        {answeredAt && (
          <div className={styles.mute} onClick={handleMute}>
            {muted ? <MicOff /> : <Mic />}
          </div>
        )}

        <button id="button-cancel" className={styles.cancelButton} onClick={hangup}>
          Завершить
        </button>
      </div>
    </>
  )
}

export default InCall
