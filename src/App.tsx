import { getLocalIp, getStats } from "@api/index"
import { Logo } from "@components/Icons"
import { Idle, Ringing, InCall, Settings } from "@screens/index"
import dayjs from "dayjs"
import React, { useState, useEffect, useRef } from "react"
import { UserAgent, Registerer, SessionState, RegistererState } from "sip.js"

import config from "@root/config"

import { disableAudioControls, cleanupMedia, setupRemoteMedia, toggleMicro } from "@helpers/app"
import logger from "@helpers/logger"
import { useMobilePageVisibility } from "@helpers/visibility"

import { SIPEventListener, Invite } from "@interfaces/app"
import { SettingsType } from "@interfaces/settings"

import type { Session } from "sip.js"

import styles from "./style.m.scss"

const App = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [streamAudio, setStreamAudio] = useState<HTMLAudioElement | null>(null)

  const [ua, setUA] = useState<UserAgent | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [invite, setInvite] = useState<Invite>({ startedAt: null, answeredAt: null })

  const [loading, setLoading] = useState<boolean>(false)
  const [registered, setRegistered] = useState<boolean>(false)
  const [muted, setMuted] = useState<boolean>(false)
  const [settings, setSettings] = useState<SettingsType>({ open: false, city: null })
  const [stats, setStats] = useState({ contacts: 0 })

  const eventListener = useRef<SIPEventListener>()
  const isMobileVisible = useMobilePageVisibility()

  const registration = async (account: string) => {
    const ip = await getLocalIp()

    try {
      const UA = new UserAgent({
        authorizationUsername: account,
        authorizationPassword: config.sip.password,
        contactName: account,
        displayName: ip,
        logLevel: "error",
        uri: UserAgent.makeURI(`sip:${account}@${config.sip.host}`),
        transportOptions: {
          server: `wss://${config.sip.host}/ws`
        }
      })

      const reg = new Registerer(UA)

      reg.stateChange.addListener(newState => {
        switch (newState) {
          case RegistererState.Registered:
            setRegistered(true)
            logger.log("Online")
            break

          case RegistererState.Terminated:
          case RegistererState.Unregistered:
            setRegistered(false)
            logger.log("Not registered")
            break
        }
      })

      UA.start()
        .then(() => {
          logger.log("Connecting")
          reg.register()
        })
        .catch(() => {
          logger.log("Not registered")
        })

      setUA(UA)
    } catch {
      logger.log("Registration error")
    }
  }

  const hangup = () => {
    setLoading(false)
    if (!session) return

    if (invite.answeredAt) return session.bye()
    // @ts-ignore
    session.cancel()
  }

  const handleMute = () => {
    setMuted(!muted)
    if (!session) return
    toggleMicro(session, muted)
  }

  const sessionListener = (newState: SessionState) => {
    if (!session) return

    const terminate = () => {
      cleanupMedia()
      setLoading(false)
      setMuted(false)
      toggleMicro(session, false)
      setInvite({ startedAt: null, answeredAt: null })
      logger.log("terminate")
    }

    switch (newState) {
      // case SessionState.Establishing:

      case SessionState.Established:
        logger.log("established")

        setLoading(false)
        setInvite({ ...invite, answeredAt: dayjs().toDate() })
        setupRemoteMedia(stream, session, streamAudio)
        break

      case SessionState.Terminating:
      case SessionState.Terminated:
        terminate()
        break
    }
  }

  const initAudio = () => {
    const streamAudio = new Audio()

    streamAudio.volume = config.audio.initVolume
    setStreamAudio(streamAudio)

    disableAudioControls()
  }

  const fetchStats = async () => {
    const contacts = await getStats()
    setStats({ contacts })
  }

  useEffect(() => {
    const account = config.sip.accounts[Math.floor(Math.random() * config.sip.accounts.length)]
    registration(account)

    window.addEventListener("beforeunload", () => window.sipSession?.bye())

    fetchStats()
    setInterval(fetchStats, config.fetchStatsDelay)

    setStream(new MediaStream())
    initAudio()
  }, [])

  useEffect(() => {
    if (!isMobileVisible) hangup()
  }, [isMobileVisible])

  useEffect(() => {
    if (session) {
      if (eventListener.current) session.stateChange.removeListener(eventListener.current)
      eventListener.current = sessionListener
      session.stateChange.addListener(eventListener.current)
    }
  }, [session, invite.startedAt, invite.answeredAt])

  const getScreen = () => {
    if (settings.open) return <Settings settings={settings} setSettings={setSettings} />

    if (loading) return <Ringing loading={loading} hangup={hangup} />

    if (invite.answeredAt)
      return (
        <InCall
          answeredAt={invite.answeredAt}
          streamAudio={streamAudio}
          muted={muted}
          handleMute={handleMute}
          hangup={hangup}
        />
      )

    return (
      <Idle
        ua={ua}
        registered={registered}
        settings={settings}
        setSession={setSession}
        setLoading={setLoading}
        setStartedAt={startedAt => setInvite({ ...invite, startedAt })}
      />
    )
  }

  return (
    <div className={styles.talker}>
      <Logo />

      <p
        className={styles.stats}
        onClick={() => setSettings({ ...settings, open: !settings.open })}
      >{`Сейчас онлайн: ${stats.contacts}`}</p>

      {getScreen()}
    </div>
  )
}

export default App
