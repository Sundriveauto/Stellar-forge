import { Button } from './UI';

type HomeProps = {
  onGetStarted: () => void
}

export const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  return (
    <div className="space-y-4">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Nova Launch</h2>
        <p className="text-gray-600 mb-8">Deploy your custom tokens on Stellar blockchain</p>
        <Button onClick={onGetStarted}>Get Started</Button>
      </div>
      <p className="text-sm text-gray-500">Use the nav above to go to Create, Mint, Burn, or Tokens.</p>
    </div>
  )
}
