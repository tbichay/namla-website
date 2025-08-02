'use client'

import { useState, useCallback, useRef } from 'react'

interface HistoryState {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  exposure: number
  highlights: number
  shadows: number
  rotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  scale: number
  cropArea: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

interface HistoryEntry {
  id: string
  state: HistoryState
  timestamp: number
  action: string
  description: string
}

interface UseEditHistoryOptions {
  maxHistorySize?: number
  initialState: HistoryState
}

export function useEditHistory({
  maxHistorySize = 50,
  initialState
}: UseEditHistoryOptions) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'initial',
      state: initialState,
      timestamp: Date.now(),
      action: 'initialize',
      description: 'Initial state'
    }
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isUpdatingFromHistory = useRef(false)

  // Get current state
  const currentState = history[currentIndex]?.state || initialState

  // Check if we can undo/redo
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  // Add a new state to history
  const addToHistory = useCallback((
    newState: HistoryState,
    action: string,
    description: string
  ) => {
    // Don't add to history if we're updating from history
    if (isUpdatingFromHistory.current) {
      return
    }

    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const truncatedHistory = prevHistory.slice(0, currentIndex + 1)
      
      // Create new entry
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        state: { ...newState },
        timestamp: Date.now(),
        action,
        description
      }

      // Add new entry and limit size
      let newHistory = [...truncatedHistory, newEntry]
      
      // Keep only the most recent entries if we exceed max size
      if (newHistory.length > maxHistorySize) {
        newHistory = newHistory.slice(-maxHistorySize)
      }
      
      // Update currentIndex to point to the new last entry
      setCurrentIndex(newHistory.length - 1)
      
      return newHistory
    })
  }, [currentIndex, maxHistorySize])

  // Undo last action
  const undo = useCallback(() => {
    if (canUndo) {
      isUpdatingFromHistory.current = true
      setCurrentIndex(prev => prev - 1)
      
      // Reset the flag after a brief delay
      setTimeout(() => {
        isUpdatingFromHistory.current = false
      }, 100)
    }
  }, [canUndo])

  // Redo next action
  const redo = useCallback(() => {
    if (canRedo) {
      isUpdatingFromHistory.current = true
      setCurrentIndex(prev => prev + 1)
      
      // Reset the flag after a brief delay
      setTimeout(() => {
        isUpdatingFromHistory.current = false
      }, 100)
    }
  }, [canRedo])

  // Jump to specific history entry
  const jumpToEntry = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      isUpdatingFromHistory.current = true
      setCurrentIndex(index)
      
      // Reset the flag after a brief delay
      setTimeout(() => {
        isUpdatingFromHistory.current = false
      }, 100)
    }
  }, [history.length])

  // Clear history and reset to initial state
  const clearHistory = useCallback(() => {
    setHistory([
      {
        id: 'reset',
        state: initialState,
        timestamp: Date.now(),
        action: 'reset',
        description: 'Reset to initial state'
      }
    ])
    setCurrentIndex(0)
  }, [initialState])

  // Get history summary for display
  const getHistorySummary = useCallback(() => {
    return history.map((entry, index) => ({
      ...entry,
      isCurrent: index === currentIndex,
      canRevert: index < currentIndex
    }))
  }, [history, currentIndex])

  return {
    currentState,
    history,
    currentIndex,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    jumpToEntry,
    clearHistory,
    getHistorySummary,
    isUpdatingFromHistory: isUpdatingFromHistory.current
  }
}