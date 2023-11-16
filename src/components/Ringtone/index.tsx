import ring1 from "assets/audio/1.mp3"
import ring2 from "assets/audio/2.mp3"
import ring3 from "assets/audio/3.mp3"
import React, { useState, useEffect } from "react"

const RINGTONES = [ring1, ring2, ring3]

const gerRandomRingtone = () => RINGTONES[Math.floor(Math.random()*RINGTONES.length)]

const getRingtoneElement = () => document.getElementById("ringtone") as HTMLAudioElement

const Ringtone = ({ play }: { play: boolean }) => {
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

    if (!play) return pauseRing()
    playRing()
  }, [play])

  return (
    <audio id="ringtone">
      <source src={ringtone} type="audio/wav" />
    </audio>
  )
}

export default Ringtone
