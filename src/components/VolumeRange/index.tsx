import React, { FC, useState } from "react"
import { Range, getTrackBackground } from "react-range"

import { VolumeDown, VolumeUp } from "../Icons"

import styles from "./style.m.scss"

const STEP = 0.01
const MIN = 0
const MAX = 1
export const VolumeRange: FC<{ audio: HTMLAudioElement }> = ({ audio }) => {
  const [currentVolume, setCurrentVolume] = useState([0.5])
  const handleChangeVolumeFromThumb = (values: Array<number>) => {
    audio.volume = values[0]
    setCurrentVolume(values)
  }

  const handleClickVolumeMin = () => {
    audio.volume = 0
    setCurrentVolume([0])
  }

  const handleClickVolumeMax = () => {
    audio.volume = 1
    setCurrentVolume([1])
  }
  return (
    <div className={styles.wrapper}>
      <VolumeDown handleClick={handleClickVolumeMin} />
      <Range
        values={currentVolume}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={values => handleChangeVolumeFromThumb(values)}
        renderTrack={({ props, children }) => (
          <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} className={styles.renderTrack}>
            <div
              ref={props.ref}
              style={{
                height: "5px",
                width: "100%",
                borderRadius: "4px",
                background: getTrackBackground({
                  values: currentVolume,
                  colors: ["#303b55", "#ccc"],
                  min: MIN,
                  max: MAX
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
