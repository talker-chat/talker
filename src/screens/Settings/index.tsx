import React from "react"

import { SettingsType } from "@interfaces/app"

type Props = {
  settings: SettingsType
}

const Settings: React.FC<Props> = ({ settings }) => {

  return (
    <div>
      {settings.open}
    </div>
  )
}

export default Settings
