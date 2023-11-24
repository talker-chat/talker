import Loader from "@components/Loader"
import Ringtone from "@components/Ringtone"
import React from "react"

import config from "@root/config"

import styles from "../style.m.scss"

type Props = {
  loading: boolean
  hangup: () => void
}

const Ringing: React.FC<Props> = ({ loading, hangup }) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <>
      <div className={styles.main}>
        <Loader />

        {config.sound && !isIOS && <Ringtone play={loading} />}
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={hangup}>
          Остановить поиск
        </button>
      </div>
    </>
  )
}

export default Ringing
