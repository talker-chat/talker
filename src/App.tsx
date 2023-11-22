/* eslint-disable no-console */
import { api } from "@api/index"
import { CallDurationTimer } from "@components/CallDurationTimer"
import { Mic, MicOff } from "@components/Icons"
import Loader from "@components/Loader"
import Ringtone from "@components/Ringtone"
import dayjs from "dayjs"
import React, { useState, useEffect, useRef } from "react"
import { UserAgent, Registerer, SessionState, RegistererState, Inviter } from "sip.js"

import config from "@root/config"

import { disableAudioControls, cleanupMedia, setupRemoteMedia, toggleMicro } from "@helpers/app"

import { SIPEventListener, Invite } from "@interfaces/app"

import type { Session } from "sip.js"

import styles from "./style.m.scss"

const App = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)

  const [ua, setUA] = useState<UserAgent | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [inCall, setInCall] = useState<boolean>(false)
  const [registered, setRegistered] = useState<boolean>(false)
  const [playRingtone, setPlayRingtone] = useState<boolean>(false)
  const [muted, setMuted] = useState<boolean>(false)
  const [stats, setStats] = useState({ contacts: 0 })

  const [registerer, setRegisterer] = useState<Registerer | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [invite, setInvite] = useState<Invite>({ startedAt: null, answeredAt: null })

  const eventListener = useRef<SIPEventListener>()

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const registration = () => {
    try {
      const UA = new UserAgent({
        authorizationUsername: config.account,
        authorizationPassword: config.password,
        contactName: config.account,
        displayName: config.account,
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
            console.log("Online")
            break

          case RegistererState.Terminated:
          case RegistererState.Unregistered:
            setRegistered(false)
            console.log("Not registered")
            break

          default:
            break
        }
      })

      UA.start()
        .then(() => {
          console.log("Connecting")
          reg.register()
        })
        .catch(() => {
          console.log("Not registered")
        })

      setUA(UA)
      setRegisterer(reg)
    } catch {
      console.log("Registration error")
    }
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
    setPlayRingtone(true)
    setLoading(true)
    setInCall(true)
    console.log("send invite => ")

    setInvite({ ...invite, startedAt: dayjs().toDate() })
  }

  const unregister = () => {
    if (!registerer) return
    if (session) {
      // @ts-ignore
      session.reject()
    }

    registerer.unregister()
  }

  const hangup = () => {
    setLoading(false)
    setInCall(false)
    if (!session) return

    if (invite.answeredAt) return session.bye()
    // @ts-ignore
    session.cancel()
  }

  const handleMute = () => {
    if (!session) return
    toggleMicro(stream, muted)
    setMuted(!muted)
  }

  const sessionListener = (newState: SessionState) => {
    if (!session) return

    const terminate = () => {
      cleanupMedia()
      setPlayRingtone(false)
      setLoading(false)
      setInCall(false)
      setMuted(false)
      toggleMicro(stream, false)
      setInvite({ startedAt: null, answeredAt: null })
      console.log("terminate")
    }

    switch (newState) {
      // case SessionState.Establishing:
      //   setMaximized(true)
      //   break

      case SessionState.Established:
        setInvite({ ...invite, answeredAt: dayjs().toDate() })
        setPlayRingtone(false)
        setLoading(false)
        if (session) setupRemoteMedia(stream, session)
        break

      case SessionState.Terminating:
        terminate()
        break

      case SessionState.Terminated:
        terminate()
        break

      default:
        break
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get("/stats")
      setStats({ contacts: response.data.contacts })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchStats()
    setInterval(fetchStats, 20000)

    registration()
    window.addEventListener("beforeunload", unregister)

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

  return (
    <div className={styles.talker}>
      <h3 className={styles.heading}>#talker</h3>

      <p className={styles.stats}>{stats.contacts ? `${stats.contacts} people are talking now` : ""}</p>

      <div className={styles.main}>
        {loading && <Loader />}

        {invite.answeredAt && <CallDurationTimer answeredAt={invite.answeredAt} />}

        {config.sound && !isIOS && <Ringtone play={playRingtone} />}
      </div>

      <div className={styles.actions}>
        {inCall && (
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
