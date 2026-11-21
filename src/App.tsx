import { useState } from 'react'
import ManageScreen from './ManageScreen'
import TodayScreen from './TodayScreen'

type View = 'today' | 'manage'

function App() {
  const [view, setView] = useState<View>('today')

  if (view === 'manage') {
    return <ManageScreen onBack={() => setView('today')} />
  }
  return <TodayScreen onManage={() => setView('manage')} />
}

export default App
