import { useNavigate } from 'react-router-dom'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export interface AdminHeaderProps {
	className?: string
	onMenuClick?: () => void
	theme: 'light' | 'dark'
	onThemeToggle: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const AdminHeader = ({ className, onMenuClick, theme, onThemeToggle }: AdminHeaderProps) => {
	const navigate = useNavigate()

	return (
		<>
		<header className={cn('sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]', className)}>
			<div className="mx-auto flex items-center justify-between px-4 py-4">
				{/* Mobile menu button */}
				<button
					type="button"
					aria-label="Open navigation menu"
					onClick={onMenuClick}
					className="inline-flex items-center justify-center rounded-md p-2 text-[var(--foreground)] hover:bg-[var(--input)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] md:hidden"
				>
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fillRule="evenodd" d="M3 5h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2z" clipRule="evenodd" />
					</svg>
				</button>

				{/* Brand */}
				<div className="flex items-center w-60 gap-2">
					<img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/line-chart--v1.png" alt="line-chart--v1" />
					<span className={cn('text-lg font-extrabold text-[var(--foreground)] flex justify-center')}>GIOSTORM</span>
				</div>
				{/* Notification icon */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-label="Notifications"
						onClick={() => navigate('/admin/notifications')}
						className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground)] hover:bg-[var(--input)]"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
							<path d="M10 22h4" />
						</svg>
					</button>
					<button
						type="button"
						aria-label="Toggle theme"
						onClick={onThemeToggle}
						className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground)] hover:bg-[var(--input)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
					>
						{theme === 'dark' ? (
							<SunIcon className="h-5 w-5" />
						) : (
							<MoonIcon className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>
		</header>
		</>
	)
}

export default AdminHeader

