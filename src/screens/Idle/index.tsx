import dayjs from "dayjs"
import React from "react"
import { UserAgent, Inviter, Session } from "sip.js"

import config from "@root/config"

import styles from "../style.m.scss"
import logger from "@helpers/logger"

import { SettingsType } from "@interfaces/settings"

type Props = {
  ua: UserAgent | null
  registered: boolean
  settings: SettingsType
  setSession: (session: Session) => void
  setLoading: (loading: boolean) => void
  setStartedAt: (startedAt: Date) => void
}

const Idle: React.FC<Props> = ({ ua, registered, settings, setSession, setLoading, setStartedAt }) => {
  const outboundCall = () => {
    if (!ua || !registered) return alert("Неизвестная ошибка, попробуйте позже")

    const target = UserAgent.makeURI(`sip:${config.sip.dst}@${config.sip.host}`)
    if (!target) {
      throw new Error("Failed to create target URI.")
    }

    const outboundSession = new Inviter(ua, target, {
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false }
      },
      params: {
        toDisplayName: `city=${settings.city?.title || ""}`
      }
    })

    outboundSession.invite()
    setSession(outboundSession)
    setLoading(true)
    setStartedAt(dayjs().toDate())
    window.sipSession = outboundSession

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
        <button id="button-start" className={styles.startButton} onClick={outboundCall}>
          Начать разговор
        </button>
      </div>
    </>
  )
}

export default Idle
