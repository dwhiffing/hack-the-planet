import { encode, decode } from 'js-base64'

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
  const confirmed = confirm(
    'Are you sure you want to clear your save and restart?',
  )
  if (confirmed) {
    localStorage.removeItem('hack-the-planet')
    document.location.reload()
  }
}
