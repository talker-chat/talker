import ring1 from "assets/audio/1.mp3"
import ring2 from "assets/audio/2.mp3"
import ring3 from "assets/audio/3.mp3"
import React, { useState, useEffect, useRef } from "react"

const RINGTONES = [ring1, ring2, ring3]

const gerRandomRingtone = () => RINGTONES[Math.floor(Math.random() * RINGTONES.length)]

const getRingtoneElement = () => document.getElementById("ringtone") as HTMLAudioElement

const Ringtone = ({ play }: { play: boolean }) => {
  const [ringtone, setRingtone] = useState<string>(ring2)
  const [audio, setAudio] = useState<HTMLElement>()

  const audioRef = useRef<HTMLButtonElement>()

  function simulateclick (e)  {
    e?.click()
  }
  const playRing = () => {
    audio?.play().catch((e) => console.error(e))
  }

  const pauseRing = () => {
    audio?.pause()
  }

  useEffect(() => {
    handleLoadClick()

  }, [])

  useEffect(() => {
    console.log(11111)
    // if (!play) return pauseRing()
    // playRing()
  }, [play])

  //////

  // 1. load the audio in a user interaction
  const handleLoadClick = async () => {
    const _audio = new Audio(ring2)
    _audio.load();
    _audio.loop = true
    _audio.volume = 0.17
    _audio.addEventListener('canplaythrough', () => {
      setAudio(_audio)
      _audio &&
      _audio.play().catch((e) => console.error(e))
    });
  };

  return (
   <div>
    <button onClick={handleLoadClick}>1111</button>
    <button onClick={playRing}>2222</button>
    <button onClick={pauseRing}>333</button>
   </div>
  )
}

export default Ringtone
