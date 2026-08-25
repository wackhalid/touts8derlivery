import Button from './Button'

interface Props {
  address: string
  label: string
  point?: { lat: number; lng: number } | null
}

export default function NavigateButton({ address, label, point }: Props) {
  const destination = point ? `${point.lat},${point.lng}` : encodeURIComponent(address)
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button variant="ghost" type="button">
        {label}
      </Button>
    </a>
  )
}
