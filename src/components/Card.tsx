import type { PropsWithChildren } from 'react'

export interface CardProps extends PropsWithChildren {
	className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const base = 'rounded-xl p-6 shadow-sm border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]'

const Card = ({ children, className }: CardProps) => {
	return (
		<div className={cn(base, className)}>
			{children}
		</div>
	)
}

export default Card

