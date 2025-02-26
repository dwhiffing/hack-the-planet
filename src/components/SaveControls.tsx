import React, { memo, useState } from 'react'
import { IGlobalAction } from '@/types'
import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { clearSave, exportSave, importSave } from '@/utils/localStorage'
import ReactModal from 'react-modal'

export const SaveControls = memo(function SaveControls() {
  const { selectedNodeId } = useSnapshot(store)
  const { [selectedNodeId]: _selectedNode } = useSnapshot(store.nodes)
  const [isOpen, setIsOpen] = useState(false)
  const globalActions: IGlobalAction[] = [
    {
      getLabel: () => 'Reset Save',
      description: 'Reset your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: clearSave,
    },
    {
      getLabel: () => 'Export Save',
      description: 'Export your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: exportSave,
    },
    {
      getLabel: () => 'Import Save',
      description: 'Import your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: importSave,
    },
  ]

  return (
    <div className={`pointer-events-auto`}>
      <button onClick={() => setIsOpen(true)}>Settings</button>
      <ReactModal
        isOpen={isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick
        onRequestClose={() => setIsOpen(false)}
        className="pointer-events-none absolute inset-20 flex items-center justify-center"
        overlayClassName="fixed bg-[#000a] inset-0 z-40"
      >
        <div className="pointer-events-auto z-40 flex h-40 items-center gap-2 bg-white p-4">
          {globalActions
            .filter((a) => a.getIsVisible())
            .map((a, i) => (
              <button
                key={i}
                disabled={a.getIsDisabled()}
                title={a.description}
                onClick={a.onClick}
              >
                {a.getLabel()}
              </button>
            ))}
        </div>
      </ReactModal>
    </div>
  )
})

export function formatMoney(number: number) {
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
