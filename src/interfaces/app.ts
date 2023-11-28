import type { Session, SessionState } from "sip.js"

export type Invite = {
  startedAt: Date | null
  answeredAt: Date | null
}

export type SIPEventListener = (data: SessionState) => void

declare global {
  interface Window {
    sipSession: Session | null
  }
}
