import { FirebaseTest } from '@/components/firebase-test'

export default function FirebaseTestPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔥 Firebase Integration Test
        </h1>
        
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">📋 Setup Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
            <li>Create a new project or select existing project</li>
            <li>Enable Firestore Database (start in test mode)</li>
            <li>Get your Firebase config from Project Settings → General → Your apps</li>
            <li>Update the config in <code className="bg-gray-200 px-1 rounded">lib/firebase.ts</code></li>
            <li>Click "Test Firebase Connection" button below</li>
          </ol>
        </div>

        <FirebaseTest />

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">✅ What happens when Firebase is working:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Orders will automatically sync to Firebase when created</li>
            <li>Real-time updates across multiple devices</li>
            <li>Data backup in the cloud</li>
            <li>Multi-location support</li>
            <li>Advanced analytics and reporting</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
