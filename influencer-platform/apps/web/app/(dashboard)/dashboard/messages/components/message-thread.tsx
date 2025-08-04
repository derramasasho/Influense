'use client'

import { Avatar, AvatarFallback, AvatarImage, Button } from '@influencer-platform/ui'
import { formatDistanceToNow } from 'date-fns'
import { Send, Paperclip, FileText, DollarSign, Info } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { DealProposalCard } from './deal-proposal-card'
import { MessageInput } from './message-input'
import { createClient } from '@/app/lib/supabase/client'

interface MessageThreadProps {
  conversation: any
  userType: 'brand' | 'influencer'
  userId: string
}

export function MessageThread({ conversation, userType, userId }: MessageThreadProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const otherParty = userType === 'brand' 
    ? conversation.influencer_profiles
    : conversation.brand_profiles

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        deal_proposals (*)
      `)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data || [])
    setIsLoading(false)

    // Mark messages as read
    await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversation.id,
      p_user_id: userId,
      p_user_type: userType
    })
  }, [conversation.id, userId, userType])

  // Set up real-time subscription
  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          // Fetch the complete message with relations
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              deal_proposals (*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => [...prev, data])
            
            // Mark as read if it's from the other party
            if (data.sender_type !== userType) {
              await supabase.rpc('mark_messages_as_read', {
                p_conversation_id: conversation.id,
                p_user_id: userId,
                p_user_type: userType
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, userId, userType, fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    const messageContent = messageText.trim()
    setMessageText('')

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: userId,
        sender_type: userType,
        message_type: 'text',
        content: messageContent,
      })

      if (error) throw error
    } catch (error: any) {
      toast.error('Failed to send message')
      setMessageText(messageContent) // Restore message on error
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage 
              src={userType === 'brand' 
                ? otherParty?.profile_image_url 
                : otherParty?.logo_url
              } 
            />
            <AvatarFallback>
              {userType === 'brand'
                ? otherParty?.full_name?.charAt(0)
                : otherParty?.company_name?.charAt(0)
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {userType === 'brand' 
                ? otherParty?.full_name
                : otherParty?.company_name
              }
            </h2>
            <p className="text-sm text-muted-foreground">
              {conversation.campaigns?.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <DollarSign className="h-4 w-4 mr-1" />
            Create Deal
          </Button>
          <Button size="sm" variant="ghost">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_type === userType
            const isSystem = message.sender_type === 'system'

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
                    {message.content}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Deal Proposal */}
                  {message.message_type === 'deal_proposal' && message.deal_proposals?.[0] && (
                    <DealProposalCard
                      conversationId={conversation.id}
                      isOwnProposal={isOwnMessage}
                      proposal={message.deal_proposals[0]}
                      userType={userType}
                    />
                  )}

                  {/* Text Message */}
                  {message.message_type === 'text' && (
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(new Date(message.created_at), { 
                      addSuffix: true 
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        conversationId={conversation.id}
        isSending={isSending}
        userType={userType}
        value={messageText}
        onChange={setMessageText}
        onSend={sendMessage}
      />
    </>
  )
}