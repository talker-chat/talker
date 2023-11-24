import type { Session } from "sip.js"

export const disableAudioControls = () => {
  const EVENTS: Array<MediaSessionAction> = [
    "play",
    "pause",
    "seekbackward",
    "seekforward",
    "previoustrack",
    "nexttrack"
  ]
  EVENTS.forEach(event => navigator.mediaSession.setActionHandler(event, () => null))
}

export const setupRemoteMedia = (
  stream: MediaStream | null,
  session: Session,
  streamAudio: HTMLAudioElement | null
) => {
  if (!stream || !session || !streamAudio) return

  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
    if (receiver.track) stream.addTrack(receiver.track)
  })

  streamAudio.srcObject = stream
  streamAudio.play()
}

export const cleanupMedia = () => {
  // const audio = document.getElementById("audio") as HTMLAudioElement
  // audio.srcObject = null
  // audio.pause()
}

export const toggleMicro = (session: Session, muted: boolean) => {
  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getSenders().forEach(sender => {
    if (sender.track) sender.track.enabled = muted
  })
}
