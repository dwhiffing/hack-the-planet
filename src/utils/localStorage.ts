import { encode, decode } from 'js-base64'
import { store } from './valtioState'

export const exportSave = () => {
  const encoded = encode(localStorage.getItem('hack-the-planet') ?? '')
  navigator.clipboard.writeText(encoded)
  alert('copied save to clipboard')
}

export const importSave = () => {
  const save = prompt('enter your save') ?? ''
  localStorage.setItem('hack-the-planet', decode(save))
  document.location.reload()
}

export const clearSave = () => {
  store.hasResetSave = true
  const confirmed = confirm(
    'Are you sure you want to clear your save and restart?',
  )
  if (confirmed) {
    localStorage.removeItem('hack-the-planet')
    document.location.reload()
  }
}
