/* eslint-disable no-console */
import { CallDurationTimer } from "@components/CallDurationTimer"
import Loader from "@components/Loader"
import ringSound from "assets/audio/ring.mp3"
import React, { useState, useEffect, useRef } from "react"
import { UserAgent, Registerer, SessionState, RegistererState, Inviter } from "sip.js"

import type { Session } from "sip.js"

import styles from "./style.m.scss"

const config = {
  host: "gazzzati.ru",
  account: "1001",
  password: "7411",
  dst: "1002",
  sound: true
}

type Invite = {
  startedAt: Date | null
  answeredAt: Date | null
}

type SIPEventListener = (data: SessionState) => void

export const setupRemoteMedia = (session: Session) => {
  const remoteStream = new MediaStream()
  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
    if (receiver.track) remoteStream.addTrack(receiver.track)
  })

  const audio = document.getElementById("audio") as HTMLAudioElement

  if (audio) {
    audio.srcObject = remoteStream
    audio.play()
  }
}

export const cleanupMedia = () => {
  const audio = document.getElementById("audio") as HTMLAudioElement
  audio.srcObject = null
  audio.pause()
}

export const getMediaElement = (): HTMLAudioElement => {
  return document.getElementById("ringing") as HTMLAudioElement
}

export const playRing = () => {
  getMediaElement().volume = 0.16
  getMediaElement().play()
}

export const pauseRing = () => {
  getMediaElement().pause()
}

const App = () => {
  const [ua, setUA] = useState<UserAgent | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [inCall, setInCall] = useState<boolean>(false)

  const [registerer, setRegisterer] = useState<Registerer | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [invite, setInvite] = useState<Invite>({startedAt: null, answeredAt: null,})

  const eventListener = useRef<SIPEventListener>()
  const ringSoundInterval = useRef(0)

  const registration = () => {
    try {
      const UA = new UserAgent({
        authorizationUsername: config.account,
        authorizationPassword: config.password,
        contactName: config.account,
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
            console.log("Online")
            break

          case RegistererState.Terminated:
          case RegistererState.Unregistered:
            console.log("Offline")
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
          console.log("Offline")
        })

      setUA(UA)
      setRegisterer(reg)
    } catch {
      // console.log("Phone error", err)
    }
  }

  const startRingSound = () => {
    if (!config || !config.sound) return

    playRing()
    ringSoundInterval.current = window.setInterval(() => playRing(), 2000)
  }

  const stopRingSound = () => {
    pauseRing()
    if (ringSoundInterval.current) clearInterval(ringSoundInterval.current)
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
    startRingSound()
    setLoading(true)
    setInCall(true)
    console.log("send invite => ")

    setInvite({ ...invite, startedAt: new Date() })
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

    if(invite.answeredAt) return session.bye()
    // @ts-ignore
    session.cancel()
  }

  const sessionListener = (newState: SessionState) => {
    const terminate = () => {
      cleanupMedia()
      stopRingSound()
      setLoading(false)
      setInCall(false)
      setInvite({startedAt: null, answeredAt: null})
      console.log("terminate")
    }

    switch (newState) {
      // case SessionState.Establishing:
      //   setMaximized(true)
      //   break

      case SessionState.Established:
        setInvite({ ...invite, answeredAt: new Date() })
        stopRingSound()
        setLoading(false)
        if (session) setupRemoteMedia(session)
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

  useEffect(() => {
    registration()
    window.addEventListener("beforeunload", () => unregister())
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

      <div className={styles.main}>
        {loading && <Loader />}

        {invite.answeredAt && <CallDurationTimer answeredAt={invite.answeredAt} />}

        <audio id="ringing" controls >
          <track default kind="captions" />
          <source src={ringSound} type="audio/wav"/>
        </audio>

        <audio id="audio" controls>
          <track default kind="captions" />
        </audio>
      </div>

      <div className={styles.actions}>
         {inCall ? (
           <button className={styles.cancelButton} onClick={hangup}>cancel</button>
         ) : (
           <button className={styles.startButton} onClick={outboundCall}>start</button>
         )}
       </div>
    </div>
  )
}

export default App
