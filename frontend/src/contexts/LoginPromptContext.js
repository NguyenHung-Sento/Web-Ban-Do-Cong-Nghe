"use client"

import { createContext, useState, useContext } from "react"
import LoginPromptModal from "../components/ui/LoginPromptModal"

// Create context
const LoginPromptContext = createContext()

// Provider component
export const LoginPromptProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")

  const showLoginPrompt = (url) => {
    setRedirectUrl(url || window.location.pathname)
    setIsOpen(true)
  }

  const hideLoginPrompt = () => {
    setIsOpen(false)
  }

  return (
    <LoginPromptContext.Provider value={{ showLoginPrompt, hideLoginPrompt }}>
      {children}
      <LoginPromptModal isOpen={isOpen} onClose={hideLoginPrompt} redirectUrl={redirectUrl} />
    </LoginPromptContext.Provider>
  )
}

// Custom hook to use the context
export const useLoginPrompt = () => {
  const context = useContext(LoginPromptContext)
  if (!context) {
    throw new Error("useLoginPrompt must be used within a LoginPromptProvider")
  }
  return context
}

