export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatBytes(value?: number | null) {
  if (!value) {
    return "0 B"
  }

  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 3)
  const amount = value / 1024 ** exponent

  return `${amount.toFixed(amount >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}
