'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@influencer-platform/ui'
import { Badge } from '@radix-ui/themes'

interface ConversationListProps {
  conversations: any[]
  selectedId?: string
  userType: 'brand' | 'influencer'
  userId: string
}

export function ConversationList({ 
  conversations, 
  selectedId,
  userType,
  userId 
}: ConversationListProps) {
  const router = useRouter()

  const handleSelect = (conversationId: string) => {
    router.push(`/dashboard/messages?conversation=${conversationId}`)
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">
          {userType === 'brand' 
            ? 'Accept applications to start chatting with creators'
            : 'Get your applications accepted to start chatting with brands'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => {
        const otherParty = userType === 'brand' 
          ? conversation.influencer_profiles
          : conversation.brand_profiles
        
        const unreadCount = userType === 'brand'
          ? conversation.brand_unread_count
          : conversation.influencer_unread_count

        const isSelected = conversation.id === selectedId

        return (
          <button
            key={conversation.id}
            onClick={() => handleSelect(conversation.id)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b ${
              isSelected ? 'bg-muted/50' : ''
            }`}
          >
            {/* Avatar */}
            <Avatar className="flex-shrink-0">
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

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium truncate">
                  {userType === 'brand' 
                    ? otherParty?.full_name
                    : otherParty?.company_name
                  }
                </h3>
                {conversation.last_message_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { 
                      addSuffix: true 
                    })}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground truncate mb-1">
                {conversation.campaigns?.title}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-sm truncate flex-1">
                  {conversation.last_message_preview || 'Start a conversation'}
                </p>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}