import { SessionState } from "sip.js"

export type Invite = {
  startedAt: Date | null
  answeredAt: Date | null
}

export type SIPEventListener = (data: SessionState) => void
