import { VolumeDown, VolumeUp } from "@components/Icons"
import React, { useState } from "react"
import { Range, getTrackBackground } from "react-range"

import config from "@root/config"

import styles from "./style.m.scss"

type Props = {
  audio: HTMLAudioElement
}

const VolumeRange: React.FC<Props> = ({ audio }) => {
  const [currentVolume, setCurrentVolume] = useState(config.audio.initVolume)

  const handleChangeVolumeFromThumb = (values: Array<number>) => {
    audio.volume = values[0]
    setCurrentVolume(values[0])
  }

  const handleClickVolumeMin = () => {
    audio.volume = 0
    setCurrentVolume(0)
  }

  const handleClickVolumeMax = () => {
    audio.volume = 1
    setCurrentVolume(1)
  }
  return (
    <div className={styles.wrapper}>
      <VolumeDown handleClick={handleClickVolumeMin} />
      <Range
        values={[currentVolume]}
        step={config.audio.step}
        min={config.audio.min}
        max={config.audio.max}
        onChange={values => handleChangeVolumeFromThumb(values)}
        renderTrack={({ props, children }) => (
          <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} className={styles.renderTrack}>
            <div
              ref={props.ref}
              style={{
                height: 4,
                width: "100%",
                borderRadius: 4,
                background: getTrackBackground({
                  values: [currentVolume],
                  colors: ["#9D9EA2", "#303b55"],
                  min: config.audio.min,
                  max: config.audio.max
                }),
                alignSelf: "center"
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => <div {...props} className={styles.renderThumb} />}
      />
      <VolumeUp handleClick={handleClickVolumeMax} />
    </div>
  )
}

export default VolumeRange