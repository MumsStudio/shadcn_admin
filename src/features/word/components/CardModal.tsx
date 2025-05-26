import { createRoot } from 'react-dom/client'

interface CardModalProps {
  onConfirm: (card: { id: string; name: string; content: string }) => void
  onClose: () => void
}

export const CardModal = ({ onConfirm, onClose }: CardModalProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (
      form.elements.namedItem('name') as HTMLInputElement
    ).value.trim()
    const content = (
      form.elements.namedItem('content') as HTMLTextAreaElement
    ).value.trim()

    if (name) {
      onConfirm({
        id: Date.now().toString(),
        name,
        content,
      })
    }
  }

  return (
    <div className='card-modal' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <label>
            Card Name:
            <input type='text' name='name' required />
          </label>
          <label>
            Card Content:
            <textarea name='content' />
          </label>
          <button type='submit'>Add Card</button>
        </form>
      </div>
    </div>
  )
}

export const showCardModal = (
  props: Omit<CardModalProps, 'onClose'>
): Promise<{ id: string; name: string; content: string } | null> => {
  return new Promise((resolve) => {
    const modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)

    const root = createRoot(modalContainer)

    const handleClose = (card?: {
      id: string
      name: string
      content: string
    }) => {
      root.unmount()
      document.body.removeChild(modalContainer)
      resolve(card || null)
    }

    root.render(
      <CardModal
        {...props}
        onConfirm={(card) => handleClose(card)}
        onClose={() => handleClose()}
      />
    )
  })
}
