import { useEffect, useState } from 'react'

const PREFIX = 'RCTlab-'

export default function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key

  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey)
    if (jsonValue != null) {
      const parsedValue = JSON.parse(jsonValue)
      // if the parsed value is an empty string, return the initial value
      if (parsedValue === '') {
        return initialValue
      }
      return parsedValue
    }

    if (typeof initialValue === 'function') {
      return initialValue()
    } else {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value))
  }, [prefixedKey, value])

  return [value, setValue]
}
