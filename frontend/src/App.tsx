import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { WalletProvider } from './context/WalletContext'
import { useWallet } from './hooks/useWallet'
import { Button } from './components/UI/Button'
import { Spinner } from './components/UI/Spinner'
import { truncateAddress, formatXLM } from './utils/formatting'
import { NavBar } from './components/NavBar'
import { Home } from './components/Home'
import { CreateToken } from './components/CreateToken'
import { MintForm } from './components/MintForm'
import { BurnForm } from './components/BurnForm'
import { TokenDashboard } from './components/Dashboard'
import { TokenDetail } from './components/TokenDetail'

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { wallet } = useWallet()

  if (!wallet.isConnected) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  const [toast, setToast] = useState<string | null>(null)
  const { wallet, connect, disconnect, isConnecting, error, isInstalled } = useWallet()

  const handleGetStarted = () => {
    setToast("Welcome! Let's deploy your token.")
    setTimeout(() => setToast(null), 4000)
  }

  const handleConnect = async () => {
    await connect()
  }

  const handleDisconnect = () => {
    disconnect()
    setToast('Wallet disconnected')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow" role="banner">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">StellarForge</h1>
                <p className="mt-2 text-sm text-gray-600">Stellar Token Deployer</p>
              </div>

              <div className="flex items-center gap-4">
                {!isInstalled && (
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Install Freighter
                  </a>
                )}

                {wallet.isConnected ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {wallet.address && truncateAddress(wallet.address)}
                      </div>
                      {wallet.balance && (
                        <div className="text-xs text-gray-600">{formatXLM(wallet.balance)}</div>
                      )}
                    </div>
                    <Button onClick={handleDisconnect} variant="secondary" size="sm">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleConnect} disabled={isConnecting} size="sm">
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Connecting...
                      </span>
                    ) : (
                      'Connect Wallet'
                    )}
                  </Button>
                )}
              </div>
            </div>

            <NavBar />
          </div>
        </header>

        <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div
                className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
                role="alert"
              >
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Routes>
                <Route path="/" element={<Home onGetStarted={handleGetStarted} />} />
                <Route path="/create" element={<ProtectedRoute><CreateToken /></ProtectedRoute>} />
                <Route path="/mint" element={<ProtectedRoute><MintForm /></ProtectedRoute>} />
                <Route path="/burn" element={<ProtectedRoute><BurnForm /></ProtectedRoute>} />
                <Route path="/tokens" element={<ProtectedRoute><TokenDashboard /></ProtectedRoute>} />
                <Route path="/tokens/:address" element={<ProtectedRoute><TokenDetail /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-4 right-4 z-50"
        >
          {toast && (
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
              {toast}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App
