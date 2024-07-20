import { Cache } from 'swr'

export const getFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof localStorage === 'undefined') return defaultValue
  const value = localStorage.getItem(key)
  if (!value) return defaultValue
  try {
    return JSON.parse(value!)
  } catch (error) {
    return defaultValue
  }
}

let isDeletingSave = false

export const onAutoSave = (cache: Cache<any>) => {
  if (isDeletingSave) return
  const appCache = Array.from(cache.keys())
    .filter((key) => key !== 'all-node-data' && key !== 'grouped-node-data')
    .map((key) => [key, cache.get(key)])
  localStorage.setItem('app-cache', JSON.stringify(appCache))
}

export const clearLocalStorage = () => {
  isDeletingSave = true
  localStorage.removeItem('app-cache')
  window.location.reload()
}
