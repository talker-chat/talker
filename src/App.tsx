/* eslint-disable no-console */
import ring1 from "@assets/audio/1.mp3"
import ring2 from '@assets/audio/2.mp3';
import ring3 from '@assets/audio/3.mp3';
import dayjs from "dayjs"
import JsSIP from "jssip"
import React, { useEffect, useState } from "react"

import { CallDurationTimer } from "@root/components/CallDurationTimer"
import { Mic, MicOff } from "@root/components/Icons"
import Loader from "@root/components/Loader"
import config from "@root/config"
import {RTCSession} from '@root/node_modules/jssip/lib/RTCSession';

import { Invite } from "@interfaces/app"

import styles from "./style.m.scss"

const RINGTONES = [ring1, ring2, ring3]
const gerRandomRingtone = () => RINGTONES[Math.floor(Math.random() * RINGTONES.length)]

const App = () => {
  //const [registered, setRegistered] = useState<boolean>(false)
  let s
  const [session, setSession] = useState<RTCSession>()
  const [loading, setLoading] = useState<boolean>(false)
  const [inCall, setInCall] = useState<boolean>(false)
  const [ringtone, setRingtone] = useState<string>()
  const [audio, setAudio] = useState<HTMLAudioElement>()
  const [invite, setInvite] = useState<Invite>({ startedAt: null, answeredAt: null })

  const socket = new JsSIP.WebSocketInterface(`wss://${config.host}/ws`)
  const configuration = {
    sockets: [socket],
    uri: `sip:${config.account}@${config.host}`,
    password: config.password
  }

  const ua = new JsSIP.UA(configuration)
  JsSIP.debug.enable('*')
  // События регистрации клиента
  ua.on("connected", function (e) {
    /* Ваш код */
    console.log("connected", e)
  })
  ua.on("disconnected", function (e) {
    /* Ваш код */
    console.log("disconnected", e)
  })

  ua.on("registered", function (e) {
    /* Ваш код */
    console.log("registered", e)
  })
  ua.on("unregistered", function (e) {
    /* Ваш код */
    console.log("unregistered", e)
  })

  const remoteAudio = new window.Audio()
  remoteAudio.autoplay = true

  const callTerminated = () => {
    setLoading(false)
    setInCall(false)
    setInvite({answeredAt: null, startedAt: null})
  }

  const eventHandlers = {
    progress: e => console.log("Progress", e),
    sending: e => console.log("Sending", e),
    accepted: e => console.log("Accepted", e),
    update: e => console.log("Update", e),
    failed: e => {
      callTerminated()
      console.log("call failed with cause: " + e.cause)
    },
    ended: e => {
      callTerminated()
      console.log("call ended with cause: " + e.cause)
    },
    confirmed: e => {
      console.log("call confirmed", e)
      remoteAudio.srcObject = s.connection.getLocalStreams()[0]
      // if(s) {
      //   console.log(101111)
      //   remoteAudio.srcObject = s.connection.getLocalStreams()[0]
      // }
      pauseRing()
      setLoading(false)
      setInvite({ ...invite, answeredAt: dayjs().toDate() })
    },
    sdp: e => {
      // playRing()
      console.log("call sdp", e)
    }
  }

  const registration = () => {
    try {
      ua.start() // register

    } catch {
      console.log("Registration error")
    }
  }

  const unregister = () => {
    if (!ua.isRegistered) return
    if (session) {
      //session.connection.close()
      console.log("unregister", session)
      session.terminate()
    }

    ua.unregister()
    ua.stop()
  }

  const outboundCall = () => {
    if (!ua) return

    s = ua.call(config.dst, {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: false }
    })
    if (!s) {
      throw new Error("Failed to create session")
    }
    setSession(s)
    setLoading(true)
    setInCall(true)
    console.log("send invite => ", s)

    // playRing()

    setInvite({ ...invite, startedAt: dayjs().toDate() })
  }

  const hangup = () => {
    callTerminated()

    if (!session) return
    session.terminate()
  }

  const playRing = () => {
    console.log("playRing")
    if(!config.sound) return

    if(audio) {
      audio?.play().catch((e) => console.error(e))
      return
    }
    console.log("playRing2")
    const _audio = new Audio(ringtone)
    _audio.load();
    _audio.loop = true
    _audio.volume = 0.17
    _audio.addEventListener('canplaythrough', () => {
      setAudio(_audio)
      _audio &&
      _audio.play().catch((e) => console.error(e))
    });
  };

  const pauseRing = () => {
    audio?.pause()
  }

  useEffect(() => {
    // fetchStats()
    // setInterval(fetchStats, 20000)

    registration()
    window.addEventListener("beforeunload", () => unregister())

    setRingtone(gerRandomRingtone())
  }, [])

  return (
    <div className={styles.talker}>
      <h3 className={styles.heading}>#talker</h3>

      {/* <p className={styles.stats}>{stats.contacts ? `${stats.contacts} people are talking now` : ""}</p> */}

      <div className={styles.main}>
        {loading && <Loader />}

        {invite.answeredAt && <CallDurationTimer answeredAt={invite.answeredAt} />}
      </div>

      <div className={styles.actions}>
        {inCall && (
          // <div className={styles.mute} onClick={handleMute}>
          //   {muted ? <MicOff /> : <Mic />}
          // </div>
          <div></div>
        )}

        {inCall ? (
          <button className={styles.cancelButton} onClick={hangup}>
            cancel
          </button>
        ) : (
          <button className={styles.startButton} onClick={outboundCall} disabled={!ua.isRegistered}>
            start
          </button>
        )}
      </div>
    </div>
  )
}

export default App