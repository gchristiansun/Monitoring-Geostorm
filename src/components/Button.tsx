import { forwardRef } from 'react'

type ButtonVariant = 'light' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
	className?: string
}

const base =
	'inline-flex items-center justify-center whitespace-nowrap select-none rounded-md font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
	dark: 'bg-[rgb(74,93,249)] text-white hover:bg-[rgb(66,82,237)] active:bg-[rgb(55,68,216)] focus-visible:ring-[rgb(74,93,249)] ring-offset-white',
	light:
		'bg-[rgb(74,93,249)] text-white border border-[rgb(74,93,249)] hover:bg-[rgb(66,82,237)] active:bg-[rgb(55,68,216)] focus-visible:ring-[rgb(74,93,249)] ring-offset-white',
}

const sizes: Record<ButtonSize, string> = {
	sm: 'text-sm px-3 py-1.5',
	md: 'text-sm px-4 py-2',
	lg: 'text-base px-6 py-3',
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'dark', size = 'md', fullWidth, className, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
				{...props}
			>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

export default Button

