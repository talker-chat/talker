import ring1 from "assets/audio/1.mp3"
import ring2 from "assets/audio/2.mp3"
import ring3 from "assets/audio/3.mp3"
import ring4 from "assets/audio/4.mp3"
import ring5 from "assets/audio/5.mp3"
import React, { useState, useEffect } from "react"

const RINGTONES = [ring1, ring2, ring3, ring4, ring5]

const gerRandomRingtone = () => RINGTONES[Math.floor(Math.random() * RINGTONES.length)]

const getRingtoneElement = () => document.getElementById("ringtone") as HTMLAudioElement

type Props = {
  play: boolean
}

const Ringtone: React.FC<Props> = ({ play }) => {
  const [ringtone, setRingtone] = useState<string>(ring2)

  const playRing = () => {
    getRingtoneElement().volume = 0.16
    getRingtoneElement().load()
    getRingtoneElement().play()
  }

  const pauseRing = () => {
    getRingtoneElement().pause()
  }

  useEffect(() => {
    setRingtone(gerRandomRingtone())
  }, [])

  useEffect(() => {
    if (!play) return pauseRing()
    playRing()
  }, [play])

  return (
    <audio id="ringtone" loop>
      <source src={ringtone} type="audio/wav" />
    </audio>
  )
}

export default Ringtone
