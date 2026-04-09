import { useNavigate } from 'react-router-dom'

export interface AdminHeaderProps {
	className?: string
	onMenuClick?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const AdminHeader = ({ className, onMenuClick }: AdminHeaderProps) => {
	const navigate = useNavigate()

	return (
		<>
		<header className={cn('sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90', className)}>
			<div className="mx-auto flex items-center justify-between px-4 py-4">
				{/* Mobile menu button */}
				<button
					type="button"
					aria-label="Open navigation menu"
					onClick={onMenuClick}
					className="inline-flex items-center justify-center rounded-md p-2 text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
				>
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fillRule="evenodd" d="M3 5h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2z" clipRule="evenodd" />
					</svg>
				</button>

				{/* Brand */}
				<div className="flex items-center gap-2">
					<img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/line-chart--v1.png" alt="line-chart--v1" />
					<span className={cn('text-lg font-semibold text-black')}>MagnoGuard</span>
				</div>
				{/* Notification icon */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-label="Notifications"
						onClick={() => navigate('/admin/notifications')}
						className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
							<path d="M10 22h4" />
						</svg>
					</button>
				</div>
			</div>
		</header>
		</>
	)
}

export default AdminHeader

