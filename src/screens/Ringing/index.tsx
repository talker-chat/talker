import Loader from "@components/Loader"
import Ringtone from "@components/Ringtone"
import React from "react"

import config from "@root/config"

import styles from "../style.m.scss"
import { isMobile } from "@helpers/device"

type Props = {
  loading: boolean
  hangup: () => void
}

const Ringing: React.FC<Props> = ({ loading, hangup }) => {
  return (
    <>
      <div className={styles.main}>
        <Loader />

        {config.ringSound && !isMobile && <Ringtone play={loading} />}
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
