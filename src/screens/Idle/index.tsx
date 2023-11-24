import React from "react"

import styles from "../style.m.scss"

type Props = {
  registered: boolean
  outboundCall: () => void
}

const Idle: React.FC<Props> = ({ registered, outboundCall }) => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.info}>
          Знакомьтесь и общайтесь с совершенно незнакомыми людьми на любые темы. Разговоры не записываются.
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.startButton} onClick={outboundCall} disabled={!registered}>
          Начать разговор
        </button>
      </div>
    </>
  )
}

export default Idle
