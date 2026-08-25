import Button from './Button'
import { whatsappLink } from '../data/whatsappTemplates'

export default function WhatsappButton({
  phone,
  message,
  label = 'Notifier sur WhatsApp',
}: {
  phone: string
  message: string
  label?: string
}) {
  return (
    <a href={whatsappLink(phone, message)} target="_blank" rel="noreferrer">
      <Button variant="secondary" type="button">
        {label}
      </Button>
    </a>
  )
}
