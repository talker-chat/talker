import type { Session, SessionState } from "sip.js"

export type Invite = {
  startedAt: Date | null
  answeredAt: Date | null
}

export type SIPEventListener = (data: SessionState) => void

export type SettingsType = {
  open: boolean
}

declare global {
  interface Window {
    sipSession: Session | null
  }
}
