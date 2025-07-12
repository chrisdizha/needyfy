import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { Download, Trash2 } from 'lucide-react'

export const GDPRExport = () => {
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleExportData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gdpr-export', {
        body: { action: 'export' }
      })

      if (error) {
        throw error
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `needyfy-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gdpr-export', {
        body: { action: 'delete' }
      })

      if (error) {
        throw error
      }

      toast.success('Account and all data deleted successfully')
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete account')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Privacy (GDPR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={handleExportData}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export My Data'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Download all your personal data in JSON format.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
            className="w-full"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Profile information</li>
                  <li>Booking history</li>
                  <li>Messages and communications</li>
                  <li>Equipment documents</li>
                  <li>Reports and disputes</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? 'Deleting...' : 'Yes, delete my account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}