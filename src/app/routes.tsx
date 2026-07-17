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
  }
])
