import React from 'react'
import { ToastContainer, Button, Spinner } from './components/UI';
import './App.css'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { NetworkProvider } from './context/NetworkContext'
import { StellarProvider } from './context/StellarContext'
import { NetworkSwitcher } from './components/NetworkSwitcher'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useWallet } from './hooks/useWallet'
import { truncateAddress, formatXLM } from './utils/formatting'
import { NavBar } from './components/NavBar'
import { Home } from './components/Home'
import { CreateToken } from './components/CreateToken'
import { MintForm } from './components/MintForm'
import { BurnForm } from './components/BurnForm'
import { Dashboard } from './components/Dashboard'
import { TokenDetail } from './components/TokenDetail'
import { isFactoryConfigured } from './config/env'
import ErrorBoundary from './components/ErrorBoundary'
import { TosProvider } from './context/TosContext'

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { wallet } = useWallet()
  if (!wallet.isConnected) return <Navigate to="/" replace />
  return children
}

function AppContent() {
  const { wallet, connect, disconnect, isConnecting, error, isInstalled } = useWallet()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const [showFriendbotBanner, setShowBanner] = React.useState(
    () => !!(wallet.isConnected && wallet.balance && parseFloat(wallet.balance) < 1)
  )

  const handleGetStarted = () => addToast(t('home.welcomeToast'), 'info')

  const handleConnect = async () => {
    try {
      await connect()
      if (!error) addToast(t('wallet.connected'), 'success')
    } catch {
      addToast(t('wallet.connectFailed'), 'error')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    addToast(t('wallet.disconnected'), 'info')
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        {t('app.skipToMain')}
      </a>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow" role="banner">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3">
              {/* Top row: title + wallet controls */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">{t('app.title')}</h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">{t('app.subtitle')}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <LanguageSwitcher />
                  <NetworkSwitcher />

                  {!isInstalled && (
                    <a
                      href="https://www.freighter.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline hidden sm:inline"
                    >
                      {t('wallet.installFreighter')}
                    </a>
                  )}

                  {wallet.isConnected ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-gray-900">
                          {wallet.address && truncateAddress(wallet.address)}
                        </div>
                        {wallet.balance && (
                          <div className="text-xs text-gray-600">{formatXLM(wallet.balance)}</div>
                        )}
                      </div>
                      <Button onClick={handleDisconnect} variant="secondary" size="sm">
                        {t('wallet.disconnect')}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleConnect} disabled={isConnecting} size="sm">
                      {isConnecting ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" />
                          <span className="hidden sm:inline">{t('wallet.connecting')}</span>
                        </span>
                      ) : (
                        t('wallet.connect')
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Wallet address on mobile when connected */}
              {wallet.isConnected && wallet.address && (
                <div className="sm:hidden text-xs text-gray-600 truncate">
                  {truncateAddress(wallet.address)}
                  {wallet.balance && <span className="ml-2">{formatXLM(wallet.balance)}</span>}
                </div>
              )}

              {/* Install Freighter link on mobile */}
              {!isInstalled && (
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {t('wallet.installFreighter')}
                </a>
              )}
            </div>

            <NavBar />
          </div>
        </header>

        {showFriendbotBanner && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 sm:p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="text-blue-800 text-xs sm:text-sm">
                Your testnet balance is low. Get free testnet XLM from{' '}
                <a
                  href={`https://friendbot.stellar.org/?addr=${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  Friendbot
                </a>.
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-blue-600 hover:text-blue-800 focus:outline-none flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Dismiss banner"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {!isFactoryConfigured() && (
          <div className="bg-yellow-50 border-b border-yellow-300 p-4" role="alert">
            <div className="max-w-7xl mx-auto text-yellow-800 text-sm font-medium">
              ⚠️ Factory contract not configured. Please set <code className="font-mono bg-yellow-100 px-1 rounded">VITE_FACTORY_CONTRACT_ID</code> in your <code className="font-mono bg-yellow-100 px-1 rounded">.env</code> file.
            </div>
          </div>
        )}

        <main id="main-content" className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-2 sm:py-4">
            {error && (
              <div
                className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
                role="alert"
              >
                <p className="font-medium">{t('errors.title')}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <Routes>
                <Route path="/" element={<ErrorBoundary><Home onGetStarted={handleGetStarted} /></ErrorBoundary>} />
                <Route path="/create" element={<ProtectedRoute><ErrorBoundary><CreateToken /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/mint" element={<ProtectedRoute><ErrorBoundary><MintForm /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/burn" element={<ProtectedRoute><ErrorBoundary><BurnForm /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/tokens" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/tokens/:address" element={<ProtectedRoute><ErrorBoundary><TokenDetail /></ErrorBoundary></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Dashboard />
          </div>
        </main>

        <ToastContainer />
      </div>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NetworkProvider>
          <StellarProvider>
            <WalletProvider>
              <ToastProvider>
                <TosProvider>
                  <AppContent />
                </TosProvider>
              </ToastProvider>
            </WalletProvider>
          </StellarProvider>
        </NetworkProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
