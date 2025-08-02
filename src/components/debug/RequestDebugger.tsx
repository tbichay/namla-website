'use client'

import { useEffect, useState } from 'react'

interface RequestInfo {
  timestamp: string
  url: string
  method: string
  stackTrace: string
}

export default function RequestDebugger() {
  const [requests, setRequests] = useState<RequestInfo[]>([])

  useEffect(() => {
    // Intercept fetch calls
    const originalFetch = window.fetch
    
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString()
      
      // Only log media endpoint calls
      if (url.includes('/api/admin/projects/') && url.includes('/media/')) {
        const stackTrace = new Error().stack || 'No stack trace available'
        
        console.log('🚨 FETCH INTERCEPTED:', {
          url,
          method: init?.method || 'GET',
          timestamp: new Date().toISOString(),
          stackTrace
        })
        
        setRequests(prev => [...prev, {
          timestamp: new Date().toISOString(),
          url,
          method: init?.method || 'GET',
          stackTrace
        }])
      }
      
      return originalFetch.call(this, input, init)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  if (requests.length === 0) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
        <strong className="font-bold">Debug Mode Active</strong>
        <span className="block sm:inline"> - No media requests detected yet</span>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md max-h-96 overflow-y-auto">
      <strong className="font-bold">🚨 Media Requests Detected ({requests.length})</strong>
      {requests.slice(-3).map((req, index) => (
        <div key={index} className="mt-2 text-xs">
          <div><strong>Time:</strong> {req.timestamp}</div>
          <div><strong>URL:</strong> {req.url}</div>
          <div><strong>Method:</strong> {req.method}</div>
          <details className="mt-1">
            <summary className="cursor-pointer">Stack Trace</summary>
            <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto">
              {req.stackTrace}
            </pre>
          </details>
        </div>
      ))}
    </div>
  )
}