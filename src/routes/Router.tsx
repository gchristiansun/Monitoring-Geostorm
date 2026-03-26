import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Dataset from '../pages/Dataset'
import Info from '../pages/Info'

const AppRouter = () => {
	return (
		<Routes>
			<Route 
				path="/"
				element={
					<Navigate to="/dashboard" replace />
				} 
			/>

			{/* Public routes */}
			<Route 
				path="/dashboard"
				element={
					<Dashboard />
				}
			/>
			<Route 
				path="/dataset" 
				element={
					<Dataset />
				}
			/>
			<Route 
				path="/info" 
				element={
					<Info />
				}
			/>

		</Routes>
	)
}

export default AppRouter

