import dayjs from "dayjs"
import React from "react"
import { UserAgent, Inviter, Session } from "sip.js"

import config from "@root/config"

import styles from "../style.m.scss"
import logger from "@helpers/logger"

type Props = {
  ua: UserAgent | null
  registered: boolean
  setSession: (session: Session) => void
  setLoading: (loading: boolean) => void
  setStartedAt: (startedAt: Date) => void
}

const Idle: React.FC<Props> = ({ ua, registered, setSession, setLoading, setStartedAt }) => {
  const outboundCall = () => {
    if (!ua) return

    const target = UserAgent.makeURI(`sip:${config.dst}@${config.host}`)
    if (!target) {
      throw new Error("Failed to create target URI.")
    }

    const outboundSession = new Inviter(ua, target, {
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false }
      }
    })

    outboundSession.invite()
    setSession(outboundSession)
    setLoading(true)
    setStartedAt(dayjs().toDate())

    logger.log("send invite => ")
  }

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
