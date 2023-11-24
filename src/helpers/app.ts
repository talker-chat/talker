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

export const setupRemoteMedia = (stream: MediaStream | null, session: Session, audio: HTMLAudioElement) => {
  if (!stream) return

  // @ts-ignore
  session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
    if (receiver.track) stream.addTrack(receiver.track)
  })
  audio.srcObject = stream
  audio.play()
}

export const cleanupMedia = () => {
  // const audio = document.getElementById("audio") as HTMLAudioElement
  // audio.srcObject = null
  // audio.pause()
}

export const toggleMicro = (stream: MediaStream | null, muted: boolean) => {
  // @ts-ignore
  // session.sessionDescriptionHandler.peerConnection.getLocalStreams().forEach(stream => {
  //   stream.getAudioTracks().forEach(track => (track.enabled = muted))
  // })
  if (!stream) return

  const track = stream.getAudioTracks()[0]
  if (!track) return

  track.enabled = muted
}
