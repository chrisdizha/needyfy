import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/OptimizedAuthContext'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

export const SessionTimeout = () => {
  const { session, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!session || !session.expires_at) return

    const checkSession = () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at!
      const timeUntilExpiry = expiresAt - now

      // Show warning if session expires in 5 minutes (300 seconds)
      if (timeUntilExpiry <= 300 && timeUntilExpiry > 0) {
        setTimeLeft(timeUntilExpiry)
        setShowWarning(true)
      } else if (timeUntilExpiry <= 0) {
        // Session expired
        setShowWarning(false)
        signOut()
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSession()

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [session, signOut])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleExtendSession = () => {
    // Refresh the page to get a new session token
    window.location.reload()
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTime(timeLeft)}. 
            You will be automatically signed out for security reasons.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out Now
          </Button>
          <AlertDialogAction onClick={handleExtendSession}>
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}