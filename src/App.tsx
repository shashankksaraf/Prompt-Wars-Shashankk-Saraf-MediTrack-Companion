import { useState } from 'react'
import { DEMO_PERSONA_NAME, DEMO_SEED_MEDICINES } from './demoSchedule'
import ManageScreen from './ManageScreen'
import NamePrompt from './NamePrompt'
import { hasAnyPersonalMedicines } from './personalSchedule'
import { useProfile } from './profile'
import {
  DEMO_MEDICINES_KEY,
  DEMO_RECORDS_KEY,
  PERSONAL_MEDICINES_KEY,
  PERSONAL_RECORDS_KEY,
} from './storageKeys'
import TodayScreen from './TodayScreen'
import WelcomeScreen from './WelcomeScreen'

type Route =
  | { screen: 'welcome' }
  | { screen: 'name-setup'; kind: 'self' | 'caregiver' }
  | { screen: 'name-existing' }
  | { screen: 'personal-today' }
  | { screen: 'personal-manage' }
  | { screen: 'demo-today' }
  | { screen: 'demo-manage' }

const DEMO_SESSION_KEY = 'meditrack.session.inDemo'

function isInDemoSession(): boolean {
  try {
    return window.sessionStorage.getItem(DEMO_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function setInDemoSession(value: boolean) {
  try {
    if (value) window.sessionStorage.setItem(DEMO_SESSION_KEY, '1')
    else window.sessionStorage.removeItem(DEMO_SESSION_KEY)
  } catch {
    // Session storage may be unavailable; worst case a mid-demo refresh falls back to the normal routing.
  }
}

function determinePersonalRoute(profileName: string | null): Route {
  if (profileName) return { screen: 'personal-today' }
  if (hasAnyPersonalMedicines()) return { screen: 'name-existing' }
  return { screen: 'welcome' }
}

function determineInitialRoute(profileName: string | null): Route {
  // A plain refresh should keep a judge inside the demo they were just exploring; a genuinely
  // new browser session (sessionStorage cleared) falls through to the normal routing below.
  if (isInDemoSession()) return { screen: 'demo-today' }
  return determinePersonalRoute(profileName)
}

function App() {
  const { name, setName } = useProfile()
  const [route, setRouteState] = useState<Route>(() => determineInitialRoute(name))

  function setRoute(next: Route) {
    setInDemoSession(next.screen === 'demo-today' || next.screen === 'demo-manage')
    setRouteState(next)
  }

  switch (route.screen) {
    case 'welcome':
      return (
        <WelcomeScreen
          onChooseSelf={() => setRoute({ screen: 'name-setup', kind: 'self' })}
          onChooseCaregiver={() => setRoute({ screen: 'name-setup', kind: 'caregiver' })}
          onTryDemo={() => setRoute({ screen: 'demo-today' })}
        />
      )

    case 'name-setup':
      return (
        <NamePrompt
          heading={route.kind === 'self' ? 'What should we call your schedule?' : "Whose schedule is this?"}
          subtitle={
            route.kind === 'self'
              ? 'Just a first name is fine — it personalizes your Today screen.'
              : "Enter the name of the person you're setting this up for."
          }
          label="Name"
          placeholder={route.kind === 'self' ? 'e.g. Asha' : 'e.g. Dad'}
          submitLabel="Continue"
          onBack={() => setRoute({ screen: 'welcome' })}
          onSubmit={(value) => {
            setName(value)
            setRoute({ screen: 'personal-manage' })
          }}
        />
      )

    case 'name-existing':
      return (
        <NamePrompt
          heading="Name this schedule"
          subtitle="This device already has medicines saved. Add a name to personalize the Today screen."
          label="Name"
          placeholder="e.g. Asha"
          submitLabel="Continue"
          onSubmit={(value) => {
            setName(value)
            setRoute({ screen: 'personal-today' })
          }}
        />
      )

    case 'personal-today':
      return (
        <TodayScreen
          key="personal"
          medicinesKey={PERSONAL_MEDICINES_KEY}
          recordsKey={PERSONAL_RECORDS_KEY}
          isDemo={false}
          displayName={name ?? ''}
          onManage={() => setRoute({ screen: 'personal-manage' })}
        />
      )

    case 'personal-manage':
      return (
        <ManageScreen
          key="personal"
          medicinesKey={PERSONAL_MEDICINES_KEY}
          isDemo={false}
          onBack={() => setRoute({ screen: 'personal-today' })}
        />
      )

    case 'demo-today':
      return (
        <TodayScreen
          key="demo"
          medicinesKey={DEMO_MEDICINES_KEY}
          recordsKey={DEMO_RECORDS_KEY}
          seed={DEMO_SEED_MEDICINES}
          isDemo
          displayName={DEMO_PERSONA_NAME}
          onManage={() => setRoute({ screen: 'demo-manage' })}
          onExitDemo={() => setRoute(determinePersonalRoute(name))}
        />
      )

    case 'demo-manage':
      return (
        <ManageScreen
          key="demo"
          medicinesKey={DEMO_MEDICINES_KEY}
          seed={DEMO_SEED_MEDICINES}
          isDemo
          onBack={() => setRoute({ screen: 'demo-today' })}
        />
      )
  }
}

export default App
