import { getLocalIp, getStats } from "@api/index"
import { Logo } from "@components/Icons"
import { Idle, Ringing, InCall } from "@screens/index"
import dayjs from "dayjs"
import React, { useState, useEffect, useRef } from "react"
import { UserAgent, Registerer, SessionState, RegistererState, Inviter } from "sip.js"

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
  const [nextRequest, setNextRequest] = useState<boolean>(false)
  const [stats, setStats] = useState({ contacts: 0 })

  const eventListener = useRef<SIPEventListener>()

  const registration = async () => {
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
    setInvite({ ...invite, startedAt: dayjs().toDate() })

    logger.log("send invite => ")
  }

  const hangup = () => {
    logger.log("hangup", nextRequest)
    setLoading(false)
    if (!session) return

    if (invite.answeredAt) return session.bye().catch(e => logger.error(e))
    // @ts-ignore
    session.cancel()
    logger.log("hangup", nextRequest)
  }

  const handleMute = () => {
    setMuted(!muted)
    if (!session) return
    toggleMicro(session, muted)

  }

  const next = () => {
    setNextRequest(true)
    hangup()
  }

  const sessionListener = (newState: SessionState) => {
    if (!session) return

    const terminate = () => {
      logger.log("terminate", nextRequest)

      cleanupMedia()

      setMuted(false)
      toggleMicro(session, false)
      setInvite({ startedAt: null, answeredAt: null })
      logger.log("terminate", nextRequest)
      if(nextRequest) {
        outboundCall()
        setLoading(true)
        setNextRequest(false)
        return
      }

      setLoading(false)
    }

    switch (newState) {
      // case SessionState.Establishing:

      case SessionState.Established:
        setLoading(false)
        setInvite({ ...invite, answeredAt: dayjs().toDate() })
        if (session) setupRemoteMedia(stream, session)
        break

      case SessionState.Terminating:
      case SessionState.Terminated:
        terminate()
        break
    }
  }

  const fetchStats = async () => {
    const contacts = await getStats()
    setStats({ contacts })
  }

  useEffect(() => {
    registration()
    window.addEventListener("beforeunload", unregister)

    fetchStats()
    setInterval(fetchStats, 20000)

    setStream(new MediaStream())
    disableAudioControls()
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
    if (invite.answeredAt) return <InCall answeredAt={invite.answeredAt} muted={muted} handleMute={handleMute} hangup={hangup} next={next}/>
    return <Idle registered={registered} outboundCall={outboundCall} />
  }

  return (
    <div className={styles.talker}>
      <Logo />

      <p className={styles.stats}>{`Сейчас онлайн: ${stats.contacts}`}</p>

      {getScreen()}
    </div>
  )
}

export default App
