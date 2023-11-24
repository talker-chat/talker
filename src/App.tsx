import { getLocalIp, getStats } from "@api/index"
import { Logo } from "@components/Icons"
import { Idle, Ringing, InCall } from "@screens/index"
import dayjs from "dayjs"
import React, { useState, useEffect, useRef } from "react"
import { UserAgent, Registerer, SessionState, RegistererState } from "sip.js"

import config from "@root/config"

import { disableAudioControls, cleanupMedia, setupRemoteMedia, toggleMicro } from "@helpers/app"
import logger from "@helpers/logger"

import { SIPEventListener, Invite } from "@interfaces/app"

import type { Session } from "sip.js"

import styles from "./style.m.scss"

const App = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)

  const [ua, setUA] = useState<UserAgent | null>(null)
  const [registerer, setRegisterer] = useState<Registerer | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [invite, setInvite] = useState<Invite>({ startedAt: null, answeredAt: null })

  const [loading, setLoading] = useState<boolean>(false)
  const [registered, setRegistered] = useState<boolean>(false)
  const [muted, setMuted] = useState<boolean>(false)
  const [stats, setStats] = useState({ contacts: 0 })

  const [streamAudio, setStreamAudio] = useState<HTMLAudioElement | null>(null)

  const eventListener = useRef<SIPEventListener>()

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const registration = async  () => {
    const ip = await getLocalIp()

    try {
      const UA = new UserAgent({
        authorizationUsername: config.account,
        authorizationPassword: config.password,
        contactName: config.account,
        displayName: ip,
        logLevel: "error",
        uri: UserAgent.makeURI(`sip:${config.account}@${config.host}`),
        transportOptions: {
          server: `wss://${config.host}/ws`
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
      setRegisterer(reg)
    } catch {
      logger.log("Registration error")
    }
  }

  const unregister = () => {
    if (!registerer) return

    // @ts-ignore
    if (session) session.reject()
    registerer.unregister()
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

    setInterval(fetchStats, config.fetchStatsDelay)
  }

  useEffect(() => {
    registration()
    window.addEventListener("beforeunload", unregister)

    fetchStats()

    setStream(new MediaStream())
    initAudio()
  }, [])

  useEffect(() => {
    if (session) {
      if (eventListener.current) session.stateChange.removeListener(eventListener.current)
      eventListener.current = sessionListener
      session.stateChange.addListener(eventListener.current)
    }
  }, [session, invite.startedAt, invite.answeredAt])

  const getScreen = () => {
    if (loading) return <Ringing loading={loading} hangup={hangup} />

    // if (invite.answeredAt)
    return <InCall answeredAt={new Date()} streamAudio={streamAudio} muted={muted} handleMute={handleMute} hangup={hangup} />

    return (
      <Idle
        ua={ua}
        registered={registered}
        setSession={setSession}
        setLoading={setLoading}
        setStartedAt={startedAt => setInvite({ ...invite, startedAt })}
      />
    )
  }

  return (
    <div className={styles.talker}>
      <Logo />

      <p className={styles.stats}>{`Сейчас онлайн: ${stats.contacts}`}</p>

      <div className={styles.main}>
        {loading && <Loader />}

        {invite.answeredAt && <CallDurationTimer answeredAt={invite.answeredAt} />}

        {config.sound && !isIOS && <Ringtone play={playRingtone} />}
      </div>


      {inCall && !!streamAudio && <VolumeRange audio={streamAudio} />}

      <div className={styles.actions}>
        {invite.answeredAt && (
          <div className={styles.mute} onClick={handleMute}>
            {muted ? <MicOff /> : <Mic />}
          </div>
        )}

        {inCall ? (
          <button className={styles.cancelButton} onClick={hangup}>
            cancel
          </button>
        ) : (
          <button className={styles.startButton} onClick={outboundCall} disabled={!registered}>
            start
          </button>
        )}
      </div>
    </div>
  )
}

export default App
