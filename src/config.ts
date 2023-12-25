export default {
  sip: {
    host: "talker.su",
    accounts: ["peer1", "peer2", "peer3", "peer4", "peer5"],
    password: "talker",
    dst: "talker"
  },
  ringSound: true,
  fetchStatsDelay: 20_000,
  audio: {
    initVolume: 0.7,
    step: 0.01,
    min: 0,
    max: 1
  }
}
