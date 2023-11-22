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

export const setupRemoteMedia = (session: Session) => {
  const remoteStream = new MediaStream()
  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
    if (receiver.track) remoteStream.addTrack(receiver.track)
  })

  const a = new Audio()
  a.srcObject = remoteStream
  a.play()
}

export const cleanupMedia = () => {
  // const audio = document.getElementById("audio") as HTMLAudioElement
  // audio.srcObject = null
  // audio.pause()
}

export const toggleMicro = (session: Session, muted: boolean) => {
  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getLocalStreams().forEach(stream => {
    stream.getAudioTracks().forEach(track => (track.enabled = muted))
  })
}
