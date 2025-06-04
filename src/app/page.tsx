'use client'

import { useUser } from '../hooks/use-user'
import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import type { Message, Conversation } from '../lib/supabase'
import Link from 'next/link'
import { Offcanvas } from 'bootstrap'

export default function Home() {
  const { user, isLoading, isError } = useUser()
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'image'>('text')
  const [isSending, setIsSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // TRPC queries and mutations
  const conversationsQuery = api.chat.getConversations.useQuery(undefined, {
    enabled: !!user,
  })

  const messagesQuery = api.chat.getMessages.useQuery(
    { conversationId: currentConversation! },
    { enabled: !!currentConversation }
  )

  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversation(data.id)
      conversationsQuery.refetch()
    },
  })

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      messagesQuery.refetch()
      setMessage('')
      setIsSending(false)
    },
    onError: () => {
      setIsSending(false)
    },
  })

  const deleteConversationMutation = api.chat.deleteConversation.useMutation({
    onSuccess: () => {
      conversationsQuery.refetch()
      setCurrentConversation(null)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesQuery.data])

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversationsQuery.data && conversationsQuery.data.length > 0 && !currentConversation) {
      setCurrentConversation(conversationsQuery.data[0].id)
    }
  }, [conversationsQuery.data, currentConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    if (!currentConversation) {
      createConversationMutation.mutate({ title: message.slice(0, 50) + '...' })
      return
    }

    setIsSending(true)
    sendMessageMutation.mutate({
      conversationId: currentConversation,
      content: message.trim(),
      messageType,
    })
  }

  const handleNewChat = () => {
    createConversationMutation.mutate({})
    setShowSidebar(false)
  }

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate({ conversationId })
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {isError.message}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4">
          <h1 className="display-4 mb-4">ChatGPT Clone</h1>
          <p className="lead mb-4">Sign in to start chatting with AI</p>
          <Link href="/api/auth/login" className="btn btn-primary btn-lg w-100">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-light me-3"
            onClick={() => setShowSidebar(true)}
          >
            ☰
          </button>
          <h4 className="m-0">ChatGPT Clone</h4>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${messageType === 'text' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => setMessageType('text')}
          >
            💬 Text
          </button>
          <button
            className={`btn btn-sm ${messageType === 'image' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => setMessageType('image')}
          >
            🎨 Image
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-auto bg-light">
        {!currentConversation ? (
          <div className="text-center text-muted mt-5 p-4">
            <h3>Welcome to ChatGPT Clone</h3>
            <p>Start a new conversation to begin chatting</p>
          </div>
        ) : messagesQuery.isLoading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </div>
          </div>
        ) : messagesQuery.data && messagesQuery.data.length === 0 ? (
          <div className="text-center text-muted mt-5 p-4">
            <h4>New Conversation</h4>
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          <div className="p-3">
            {messagesQuery.data?.map((msg: Message) => (
              <div key={msg.id} className={`message mb-3 ${msg.role === 'user' ? 'text-end' : ''}`}>
                <div className={`d-inline-block p-3 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white'}`}>
                  {msg.content}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="Generated content" className="mt-2 img-fluid rounded" />
                  )}
                </div>
                <small className="text-muted d-block mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-top">
        <form onSubmit={handleSendMessage} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type a ${messageType === 'text' ? 'message' : 'prompt for image'}...`}
            disabled={isSending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <div
        className={`offcanvas offcanvas-start ${showSidebar ? 'show' : ''}`}
        tabIndex={-1}
        id="sidebar"
        ref={sidebarRef}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Conversations</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSidebar(false)}
          />
        </div>
        <div className="offcanvas-body">
          <button className="btn btn-success w-100 mb-3" onClick={handleNewChat}>
            + New Chat
          </button>

          <div className="conversation-list">
            {conversationsQuery.data?.map((conv: Conversation) => (
              <div
                key={conv.id}
                className={`conversation-item p-2 mb-2 rounded ${currentConversation === conv.id ? 'bg-primary text-white' : 'bg-light'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setCurrentConversation(conv.id)
                  setShowSidebar(false)
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-truncate">{conv.title}</small>
                  <button
                    className="btn btn-sm btn-outline-light ms-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConversation(conv.id)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-top">
            <div className="d-flex align-items-center mb-2">
              <img
                src={user.picture || ''}
                alt={user.name || ''}
                className="rounded-circle me-2"
                width="32"
                height="32"
              />
              <small className="text-truncate">{user.name}</small>
            </div>
            <Link href="/api/auth/logout" className="btn btn-outline-danger btn-sm w-100">
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}