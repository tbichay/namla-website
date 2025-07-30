import Link from 'next/link'

interface ButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function Button({ 
  href, 
  onClick, 
  children, 
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseClasses = "inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 text-base sm:text-lg transition-colors text-center font-medium rounded-sm"
  const variants = {
    primary: "bg-stone-800 text-white hover:bg-stone-700 active:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
    secondary: "border border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white active:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}