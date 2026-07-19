import { createBrowserRouter } from 'react-router-dom'
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout'
import { RouteErrorPage } from '../shared/components/RouteErrorPage'
import { RouteHydrateFallback } from '../shared/components/RouteHydrateFallback'

export const router = createBrowserRouter([
  {
    path: '/',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { LandingPage } =
        await import('../features/landing/pages/LandingPage')
      return { Component: LandingPage }
    },
    errorElement: <RouteErrorPage />
  },
  {
    element: <AuthenticatedLayout />,
    HydrateFallback: RouteHydrateFallback,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: 'dashboard',
        lazy: async () => {
          const { DashboardPage } =
            await import('../features/dashboard/pages/DashboardPage')
          return { Component: DashboardPage }
        }
      },
      {
        path: 'accounts',
        lazy: async () => {
          const { AccountsPage } =
            await import('../features/accounts/pages/AccountsPage')
          return { Component: AccountsPage }
        }
      },
      {
        path: 'automation',
        lazy: async () => {
          const { SafetyConsolePage } =
            await import('../features/automation/pages/SafetyConsolePage')
          return { Component: SafetyConsolePage }
        }
      },
      {
        path: 'analysis',
        lazy: async () => {
          const { MarketAnalysisPage } =
            await import('../features/analysis/pages/MarketAnalysisPage')
          return { Component: MarketAnalysisPage }
        }
      },
      {
        path: 'bots',
        lazy: async () => {
          const { BotConsolePage } =
            await import('../features/bots/pages/BotConsolePage')
          return { Component: BotConsolePage }
        }
      },
      {
        path: 'scanner',
        lazy: async () => {
          const { DiffersScannerPage } =
            await import('../features/scanner/pages/DiffersScannerPage')
          return { Component: DiffersScannerPage }
        }
      },
      {
        path: 'bulk',
        lazy: async () => {
          const { BulkTraderPage } =
            await import('../features/bulk/pages/BulkTraderPage')
          return { Component: BulkTraderPage }
        }
      },
      {
        path: 'copy',
        lazy: async () => {
          const { CopyTradingPage } =
            await import('../features/copy/pages/CopyTradingPage')
          return { Component: CopyTradingPage }
        }
      },
      {
        path: 'history',
        lazy: async () => {
          const { TradeRecordsPage } =
            await import('../features/records/pages/TradeRecordsPage')
          return { Component: TradeRecordsPage }
        }
      },
      {
        path: 'charts',
        lazy: async () => {
          const { ChartsPage } =
            await import('../features/charts/pages/ChartsPage')
          return { Component: ChartsPage }
        }
      },
      {
        path: 'risk',
        lazy: async () => {
          const { RiskCalculatorPage } =
            await import('../features/risk/pages/RiskCalculatorPage')
          return { Component: RiskCalculatorPage }
        }
      },
      {
        path: 'activity',
        lazy: async () => {
          const { ActivityLogPage } =
            await import('../features/activity/pages/ActivityLogPage')
          return { Component: ActivityLogPage }
        }
      },
      {
        path: 'settings',
        lazy: async () => {
          const { SettingsPage } =
            await import('../features/settings/pages/SettingsPage')
          return { Component: SettingsPage }
        }
      },
      {
        path: 'aviator',
        lazy: async () => {
          const { AviatorPage } =
            await import('../features/aviator/pages/AviatorPage')
          return { Component: AviatorPage }
        }
      }
    ]
  }
])
