import Router from './routes/Router'
import { NotificationProvider } from './contexts/NotificationContext'

const App = () => {
  return (
    <NotificationProvider>
      <Router />
    </NotificationProvider>
  )
}

export default App