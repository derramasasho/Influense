import { MessageSquare } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
        <p className="text-sm text-muted-foreground">
          Choose a conversation from the list to start messaging
        </p>
      </div>
    </div>
  )
}