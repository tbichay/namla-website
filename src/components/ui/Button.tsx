import Link from 'next/link'

interface ButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function Button({ 
  href, 
  onClick, 
  children, 
  variant = 'primary',
  className = ''
}: ButtonProps) {
  const baseClasses = "inline-block px-8 py-3 text-lg transition-colors"
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "border border-black text-black hover:bg-black hover:text-white"
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
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}