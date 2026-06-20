interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue'
  children: React.ReactNode
}

const variants = {
  default:  'bg-warm-100 text-warm-700',
  success:  'bg-green-100 text-green-800',
  warning:  'bg-amber-100 text-amber-800',
  danger:   'bg-red-100 text-red-700',
  purple:   'bg-purple-100 text-purple-800',
  blue:     'bg-blue-100 text-blue-800',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
