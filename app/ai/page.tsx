'use client'

import React, { useState } from 'react'
import { Bot, Send, Mic, MicOff, Sparkles, MessageSquare } from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant for Smoocho POS. I can help you with sales analysis, inventory management, customer insights, and business optimization. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('sales') || lowerInput.includes('revenue')) {
      return 'Based on your current sales data, I can see that your revenue has increased by 15% this month. Your top-selling items are desserts and beverages. Would you like me to provide a detailed sales analysis or suggest ways to optimize your menu pricing?'
    }
    
    if (lowerInput.includes('inventory') || lowerInput.includes('stock')) {
      return 'I\'ve analyzed your inventory levels. You have 3 items running low: Vanilla Ice Cream (5 units left), Chocolate Sauce (2 bottles), and Paper Cups (50 remaining). I recommend restocking these items soon. Would you like me to generate a purchase order?'
    }
    
    if (lowerInput.includes('customer') || lowerInput.includes('feedback')) {
      return 'Your customer satisfaction rate is 4.7/5 based on recent feedback. Customers particularly love your Kunafa and specialty beverages. I notice peak hours are 2-4 PM and 7-9 PM. Would you like suggestions for managing rush hours better?'
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return 'I can help you with:\n• Sales analysis and forecasting\n• Inventory management and alerts\n• Customer behavior insights\n• Menu optimization suggestions\n• Staff scheduling recommendations\n• Financial reporting\n• Marketing campaign ideas\n\nWhat would you like to explore?'
    }
    
    return 'I understand you\'re asking about "' + input + '". Let me analyze your business data to provide relevant insights. Based on your POS system data, I can offer personalized recommendations for your dessert shop operations. Could you be more specific about what aspect you\'d like help with?'
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input functionality would be implemented here
  }

  const quickActions = [
    { label: 'Sales Analysis', action: () => setInputMessage('Show me today\'s sales analysis') },
    { label: 'Inventory Check', action: () => setInputMessage('Check my inventory levels') },
    { label: 'Customer Insights', action: () => setInputMessage('What are customer trends?') },
    { label: 'Menu Optimization', action: () => setInputMessage('How can I optimize my menu?') }
  ]

  return (
    <ResponsiveLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Your intelligent business companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Powered by AI</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={action.title || `action-${index}`}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your business..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={toggleVoiceInput}
                variant="outline"
                size="sm"
                className={isListening ? 'bg-red-50 border-red-200' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
