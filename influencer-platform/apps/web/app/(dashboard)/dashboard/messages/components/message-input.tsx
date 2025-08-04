'use client'

import { useState } from 'react'
import { Button } from '@influencer-platform/ui'
import { Send, DollarSign, Paperclip } from 'lucide-react'
import { DealProposalModal } from './deal-proposal-modal'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (e: React.FormEvent) => void
  isSending: boolean
  conversationId: string
  userType: 'brand' | 'influencer'
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  isSending,
  conversationId,
  userType 
}: MessageInputProps) {
  const [showDealModal, setShowDealModal] = useState(false)

  return (
    <>
      <form onSubmit={onSend} className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSend(e)
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[52px] max-h-32"
              rows={1}
              disabled={isSending}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowDealModal(true)}
              title="Create deal proposal"
            >
              <DollarSign className="h-5 w-5" />
            </Button>
            
            <Button
              type="button"
              size="icon"
              variant="ghost"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || isSending}
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Deal Proposal Modal */}
      <DealProposalModal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        conversationId={conversationId}
        userType={userType}
      />
    </>
  )
}