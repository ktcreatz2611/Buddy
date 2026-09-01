import { useState, useEffect } from 'react'

interface TokenUsage {
  prompt: number
  completion: number
  cost?: number
}

interface StreamState {
  content: string
  status: 'idle' | 'streaming' | 'complete' | 'error' | 'stopped'
  error: Error | null
  tokenUsage: TokenUsage | null
}

export function useChatStream(messageId: string | null) {
  const [state, setState] = useState<StreamState>({
    content: '',
    status: 'idle',
    error: null,
    tokenUsage: null,
  })

  useEffect(() => {
    if (!messageId) {
      setState({ content: '', status: 'idle', error: null, tokenUsage: null })
      return
    }

    setState(prev => ({ ...prev, status: 'streaming', content: '', error: null }))
    
    // In a real application, this would use EventSource or fetch with stream reading
    // For now, this is a mock implementation
    
    let isMounted = true
    /* 
    const eventSource = new EventSource(`/api/messages/${messageId}/stream`)
    
    eventSource.onmessage = (event) => {
      if (!isMounted) return
      const data = JSON.parse(event.data)
      
      if (data.type === 'delta') {
        setState(prev => ({ ...prev, content: prev.content + data.text }))
      } else if (data.type === 'complete') {
        setState(prev => ({ 
          ...prev, 
          status: 'complete',
          tokenUsage: data.usage
        }))
        eventSource.close()
      } else if (data.type === 'error') {
        setState(prev => ({ ...prev, status: 'error', error: new Error(data.message) }))
        eventSource.close()
      }
    }
    
    eventSource.onerror = (error) => {
      if (isMounted) {
        setState(prev => ({ ...prev, status: 'error', error: new Error('Stream connection failed') }))
      }
      eventSource.close()
    }

    return () => {
      isMounted = false
      eventSource.close()
    }
    */
    
    return () => {
      isMounted = false
    }
  }, [messageId])

  return state
}
