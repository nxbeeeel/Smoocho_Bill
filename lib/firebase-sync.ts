import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db as firestoreDb } from './firebase'
import { db as localDb, Order, Product, User, Settings } from './database'

export class FirebaseSyncService {
  private isOnline = false
  private syncInProgress = false

  constructor() {
    this.checkOnlineStatus()
    this.setupOnlineListener()
  }

  private checkOnlineStatus() {
    this.isOnline = navigator.onLine
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🌐 Online - Starting sync...')
      this.syncAllData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📴 Offline - Queuing operations...')
    })
  }

  // Sync all data to Firebase
  async syncAllData() {
    if (!this.isOnline || this.syncInProgress) return

    this.syncInProgress = true
    console.log('🔄 Starting full sync to Firebase...')

    try {
      await Promise.all([
        this.syncProducts(),
        this.syncOrders(),
        this.syncUsers(),
        this.syncSettings()
      ])
      console.log('✅ Full sync completed successfully')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Sync products to Firebase
  async syncProducts() {
    try {
      const products = await localDb.products.toArray()
      console.log(`📦 Syncing ${products.length} products to Firebase...`)

      for (const product of products) {
        const productRef = doc(firestoreDb, 'products', product.id?.toString() || '')
        await setDoc(productRef, {
          ...product,
          syncedAt: serverTimestamp()
        })
      }
      console.log('✅ Products synced successfully')
    } catch (error) {
      console.error('❌ Failed to sync products:', error)
    }
  }

  // Sync orders to Firebase
  async syncOrders() {
    try {
      const orders = await localDb.orders.toArray()
      console.log(`📋 Syncing ${orders.length} orders to Firebase...`)

      for (const order of orders) {
        const orderRef = doc(firestoreDb, 'orders', order.id?.toString() || '')
        await setDoc(orderRef, {
          ...order,
          syncedAt: serverTimestamp()
        })
      }
      console.log('✅ Orders synced successfully')
    } catch (error) {
      console.error('❌ Failed to sync orders:', error)
    }
  }

  // Sync users to Firebase
  async syncUsers() {
    try {
      const users = await localDb.users.toArray()
      console.log(`👥 Syncing ${users.length} users to Firebase...`)

      for (const user of users) {
        const userRef = doc(firestoreDb, 'users', user.id?.toString() || '')
        await setDoc(userRef, {
          ...user,
          syncedAt: serverTimestamp()
        })
      }
      console.log('✅ Users synced successfully')
    } catch (error) {
      console.error('❌ Failed to sync users:', error)
    }
  }

  // Sync settings to Firebase
  async syncSettings() {
    try {
      const settings = await localDb.settings.toArray()
      console.log(`⚙️ Syncing ${settings.length} settings to Firebase...`)

      for (const setting of settings) {
        const settingRef = doc(firestoreDb, 'settings', setting.id?.toString() || '')
        await setDoc(settingRef, {
          ...setting,
          syncedAt: serverTimestamp()
        })
      }
      console.log('✅ Settings synced successfully')
    } catch (error) {
      console.error('❌ Failed to sync settings:', error)
    }
  }

  // Add new order to Firebase
  async addOrderToFirebase(order: Order) {
    if (!this.isOnline) {
      console.log('📴 Offline - Order will be synced when online')
      return
    }

    try {
      const orderRef = doc(firestoreDb, 'orders', order.id?.toString() || '')
      await setDoc(orderRef, {
        ...order,
        syncedAt: serverTimestamp()
      })
      console.log('✅ Order added to Firebase:', order.orderNumber)
    } catch (error) {
      console.error('❌ Failed to add order to Firebase:', error)
    }
  }

  // Listen to real-time updates from Firebase
  setupRealtimeListeners() {
    if (!this.isOnline) return

    // Listen to orders
    const ordersQuery = query(collection(firestoreDb, 'orders'), orderBy('createdAt', 'desc'))
    onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const orderData = change.doc.data()
          console.log('📥 New/Updated order from Firebase:', orderData.orderNumber)
          // You can add logic here to update local database if needed
        }
      })
    })

    // Listen to products
    const productsQuery = query(collection(firestoreDb, 'products'))
    onSnapshot(productsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const productData = change.doc.data()
          console.log('📥 New/Updated product from Firebase:', productData.name)
          // You can add logic here to update local database if needed
        }
      })
    })
  }
}

// Export singleton instance
export const firebaseSync = new FirebaseSyncService()
