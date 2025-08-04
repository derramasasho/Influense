'use client'

import { Button } from '@influencer-platform/ui'
import { Send, DollarSign, Paperclip } from 'lucide-react'
import { useState } from 'react'
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
      <form className="p-4 border-t bg-background" onSubmit={onSend}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-4 py-3 pr-12 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[52px] max-h-32"
              disabled={isSending}
              placeholder="Type a message..."
              rows={1}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSend(e)
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              title="Create deal proposal"
              type="button"
              variant="ghost"
              onClick={() => setShowDealModal(true)}
            >
              <DollarSign className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              title="Attach file"
              type="button"
              variant="ghost"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button
              disabled={!value.trim() || isSending}
              size="icon"
              type="submit"
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
        conversationId={conversationId}
        isOpen={showDealModal}
        userType={userType}
        onClose={() => setShowDealModal(false)}
      />
    </>
  )
}