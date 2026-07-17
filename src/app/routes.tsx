import { createBrowserRouter } from 'react-router-dom'
import { RouteErrorPage } from '../shared/components/RouteErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { FoundationPage } =
        await import('../features/foundation/pages/FoundationPage')
      return { Component: FoundationPage }
    },
    errorElement: <RouteErrorPage />
  },
  {
    path: '/accounts',
    lazy: async () => {
      const { AccountsPage } =
        await import('../features/accounts/pages/AccountsPage')
      return { Component: AccountsPage }
    },
    errorElement: <RouteErrorPage />
  },
  {
    path: '/automation',
    lazy: async () => {
      const { SafetyConsolePage } =
        await import('../features/automation/pages/SafetyConsolePage')
      return { Component: SafetyConsolePage }
    },
    errorElement: <RouteErrorPage />
  }
])
