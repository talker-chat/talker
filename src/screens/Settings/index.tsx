import { getCities } from "@api/vk"
import React, { useEffect } from "react"
import { components } from "react-select"
import AsyncSelect from "react-select/async"

import styles from "../style.m.scss"

import { SettingsType } from "@interfaces/settings"

type Props = {
  settings: SettingsType
  setSettings: (settings: SettingsType) => void
}

const stylesObj = {
  control: base => ({
    ...base,
    width: 200,
    backgroundColor: "#161D29",
    border: "none",
    boxShadow: "none",
    cursor: "pointer"
  }),
  input: base => ({
    ...base,
    color: "#FFF"
  }),
  singleValue: base => ({
    ...base,
    color: "#FFF"
  }),
  placeholder: base => ({
    ...base,
    color: "#9D9FA3"
  }),
  indicatorSeparator: base => ({
    ...base,
    display: "none"
  }),
  indicatorsContainer: base => ({
    ...base,
    svg: {
      fill: "#9D9FA3"
    }
  }),
  menu: base => ({
    ...base,
    backgroundColor: "#161D29",
    margin: "5px 0"
  }),
  option: base => {
    return {
      ...base,
      backgroundColor: "transparent",
      color: "#FFF",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#0C70B9"
      },
      ":focus": {
        backgroundColor: "#0C70B9"
      },
      ":active": {
        backgroundColor: "#0C70B9"
      }
    }
  }
}

const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const handleChange = value => {
    setSettings({ ...settings, city: value })
    localStorage.setItem("cityId", value.id)
    localStorage.setItem("cityTitle", value.title)
  }

  const fetchCities = async input => {
    return getCities(input)
  }

  useEffect(() => {
    const cityId = localStorage.getItem("cityId")
    const cityTitle = localStorage.getItem("cityTitle")
    if (cityId && cityTitle) setSettings({ ...settings, city: { id: Number(cityId), title: cityTitle } })
  }, [])

  return (
    <div className={styles.settings}>
      <AsyncSelect
        cacheOptions
        defaultOptions
        placeholder="Город"
        value={settings.city}
        getOptionLabel={e => e.title}
        getOptionValue={e => e.id}
        loadOptions={fetchCities}
        onChange={handleChange}
        components={{
          Option: ({ children, ...rest }) => (
            <components.Option {...rest}>
              {children}
              <div className={styles.cityDescription}>{rest.data.country || rest.data.area}</div>
            </components.Option>
          )
        }}
        styles={stylesObj}
      />
    </div>
  )
}

export default Settings
