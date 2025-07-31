import './App.css'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center'>
      <Button className='text-red-500'>Click me</Button>
      <XIcon className='size-4' />
    </div>
  )
}

export default App
