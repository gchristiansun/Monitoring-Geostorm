import { NavLink } from 'react-router-dom'
import { XMarkIcon, Squares2X2Icon, CubeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export interface AdminSidebarProps {
	className?: string
	isOpen?: boolean
	onClose?: () => void
	active?: 'dashboard' | 'dataset' | 'info'
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const items = [
	{ key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
	{ key: 'dataset', label: 'Dataset', icon: 'box', to: '/dataset' },
	{ key: 'info', label: 'Info', icon: 'file', to: '/info' },
] as const

const Icon = ({ name }: { name: string }) => {
	switch (name) {
		case 'dashboard':
			return <Squares2X2Icon className="w-4 h-4" />
		case 'box':
			return <CubeIcon className="w-4 h-4" />
		case 'file':
			return <DocumentTextIcon className="w-4 h-4" />
		default:
			return null
	}
}

const AdminSidebar = ({ isOpen = false, onClose }: AdminSidebarProps) => {
	return (
		<>
			<div
				className={cn(
					'fixed inset-0 z-[50] bg-black/30 transition-opacity md:hidden',
					isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
				)}
				onClick={onClose}
			/>

			<aside
				className={cn(
					'fixed left-0 h-screen w-64 md:top-16 top-0 z-[60] bg-white border-r border-neutral-200 p-4',
					'transform transition-transform duration-300 ease-in-out',
					isOpen ? 'translate-x-0' : '-translate-x-full',
					'md:translate-x-0' // selalu tampil di desktop
				)}
			>
				<div className="mb-4 flex items-center justify-between md:hidden">
					<span className="text-base font-semibold">Menu</span>
					<button
						type="button"
						aria-label="Close menu"
						onClick={onClose}
						className="rounded-md p-1 text-neutral-800 hover:bg-neutral-100"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>
				<nav className="space-y-1">
					{items.map((item) => (
						<NavLink
							key={item.key}
							to={item.to}
							className={({ isActive }) =>
								cn(
									'group flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors',
									isActive
										? 'bg-[#833AB4] text-white shadow-sm'
										: 'text-neutral-800 hover:bg-neutral-100',
								)
							}
							end={item.key === 'dashboard'}
						>
							<span className={cn('flex h-6 w-6 items-center justify-center')}>
								<Icon name={item.icon} />
							</span>
							<span>{item.label}</span>
						</NavLink>
					))}
				</nav>
			</aside>
		</>
	)
}

export default AdminSidebar

