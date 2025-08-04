import { ConversationList } from './components/conversation-list'
import { EmptyState } from './components/empty-state'
import { MessageThread } from './components/message-thread'
import { getUserProfile } from '@/app/lib/auth/utils'
import { createClient } from '@/app/lib/supabase/server'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { conversation?: string }
}) {
  const supabase = createClient()
  const profile = await getUserProfile()
  const selectedConversationId = searchParams.conversation

  // Determine user type and get profile
  const isBrand = profile.role === 'brand'
  const profileTable = isBrand ? 'brand_profiles' : 'influencer_profiles'
  const profileField = isBrand ? 'brand_id' : 'influencer_id'
  
  const { data: userProfile } = await supabase
    .from(profileTable)
    .select('id')
    .eq('user_id', profile.id)
    .single()

  if (!userProfile) {
    return <div>Profile not found</div>
  }

  // Fetch conversations
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      campaigns (
        id,
        title,
        status
      ),
      brand_profiles (
        id,
        company_name,
        logo_url
      ),
      influencer_profiles (
        id,
        user_id,
        full_name,
        profile_image_url
      ),
      messages (
        id,
        content,
        created_at,
        sender_type
      )
    `)
    .eq(profileField, userProfile.id)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
  }

  const allConversations = conversations || []

  // Get selected conversation details
  let selectedConversation = null
  if (selectedConversationId) {
    selectedConversation = allConversations.find(c => c.id === selectedConversationId)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-full md:w-96 border-r bg-background">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-display font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBrand ? 'Chat with creators' : 'Chat with brands'}
          </p>
        </div>
        <ConversationList
          conversations={allConversations}
          selectedId={selectedConversationId}
          userId={userProfile.id}
          userType={profile.role}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            userId={userProfile.id}
            userType={profile.role}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}