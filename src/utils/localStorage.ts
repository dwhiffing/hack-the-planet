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

export let isDeletingSave = false
export const setToLocalStorage = (key: string, value: any) => {
  if (isDeletingSave) return
  if (typeof value === 'object' && value) {
    value = JSON.stringify(value)
  }
  localStorage.setItem(key, value)
}

export const clearLocalStorage = () => {
  isDeletingSave = true
  localStorage.removeItem('app-cache')
  window.location.reload()
}
