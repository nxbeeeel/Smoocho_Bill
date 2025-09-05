"use client"

import React, { useState, useEffect } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FirebaseTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testFirebaseConnection = async () => {
    setIsLoading(true)
    setTestResults([])
    addTestResult("🔄 Testing Firebase connection...")

    try {
      // Test 1: Add a test document
      addTestResult("📝 Adding test document...")
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Hello from Smoocho Bill!',
        timestamp: new Date(),
        testId: Math.random().toString(36).substr(2, 9)
      })
      addTestResult(`✅ Test document added with ID: ${testDoc.id}`)

      // Test 2: Read documents
      addTestResult("📖 Reading test documents...")
      const querySnapshot = await getDocs(collection(db, 'test'))
      addTestResult(`✅ Found ${querySnapshot.size} test documents`)

      // Test 3: Check if we can access orders collection
      addTestResult("📋 Checking orders collection...")
      const ordersSnapshot = await getDocs(collection(db, 'orders'))
      addTestResult(`✅ Orders collection accessible (${ordersSnapshot.size} orders found)`)

      setIsConnected(true)
      addTestResult("🎉 Firebase connection successful!")

    } catch (error) {
      setIsConnected(false)
      addTestResult(`❌ Firebase connection failed: ${error}`)
      console.error('Firebase test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Firebase Connection Test
          {isConnected ? (
            <span className="text-green-500">✅ Connected</span>
          ) : (
            <span className="text-red-500">❌ Not Connected</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testFirebaseConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Firebase Connection"}
        </Button>
        
        {testResults.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Tests connection to Firebase Firestore</li>
            <li>Creates a test document</li>
            <li>Reads documents from the database</li>
            <li>Checks if orders collection is accessible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
