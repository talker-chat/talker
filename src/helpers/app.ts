import type { Session } from "sip.js"

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
