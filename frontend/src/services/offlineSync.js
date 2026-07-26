// IndexedDB Offline Sync Manager for Haut-Atlas Enclave Douars
// Provides offline storage for consultations & voice recordings, syncing auto on reconnect.

const DB_NAME = 'dar_omoma_offline_db'
const DB_VERSION = 1
const STORE_CONSULTATIONS = 'pending_consultations'
const STORE_VOICES = 'pending_voices'

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_CONSULTATIONS)) {
        db.createObjectStore(STORE_CONSULTATIONS, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(STORE_VOICES)) {
        db.createObjectStore(STORE_VOICES, { keyPath: 'id', autoIncrement: true })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineConsultation(consultationId, data) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_CONSULTATIONS, 'readwrite')
    const store = tx.objectStore(STORE_CONSULTATIONS)
    await store.add({
      consultationId,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    })
    console.log('[OfflineSync] Saved consultation offline in IndexedDB:', consultationId)
    return true
  } catch (err) {
    console.error('[OfflineSync] Failed to save offline consultation:', err)
    return false
  }
}

export async function saveOfflineVoice(consultationId, audioBlob, textFallback = '') {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_VOICES, 'readwrite')
    const store = tx.objectStore(STORE_VOICES)
    await store.add({
      consultationId,
      audioBlob,
      textFallback,
      timestamp: new Date().toISOString(),
      synced: false
    })
    console.log('[OfflineSync] Saved voice recording offline in IndexedDB for consultation:', consultationId)
    return true
  } catch (err) {
    console.error('[OfflineSync] Failed to save offline voice:', err)
    return false
  }
}

export async function getPendingOfflineItems() {
  try {
    const db = await openDB()
    const txConsultations = db.transaction(STORE_CONSULTATIONS, 'readonly')
    const storeC = txConsultations.objectStore(STORE_CONSULTATIONS)
    
    const consultations = await new Promise((res) => {
      const req = storeC.getAll()
      req.onsuccess = () => res(req.result || [])
    })

    const txVoices = db.transaction(STORE_VOICES, 'readonly')
    const storeV = txVoices.objectStore(STORE_VOICES)
    
    const voices = await new Promise((res) => {
      const req = storeV.getAll()
      req.onsuccess = () => res(req.result || [])
    })

    return { consultations, voices }
  } catch (err) {
    console.error('[OfflineSync] Error reading offline items:', err)
    return { consultations: [], voices: [] }
  }
}

export async function syncPendingItems(apiClient) {
  if (!navigator.onLine) return { success: false, syncedCount: 0 }

  const { consultations, voices } = await getPendingOfflineItems()
  let syncedCount = 0

  if (consultations.length === 0 && voices.length === 0) {
    return { success: true, syncedCount: 0 }
  }

  const db = await openDB()

  // Sync consultations
  for (const item of consultations) {
    try {
      await apiClient.post(`/consultations/${item.consultationId}/message`, item.data)
      const tx = db.transaction(STORE_CONSULTATIONS, 'readwrite')
      tx.objectStore(STORE_CONSULTATIONS).delete(item.id)
      syncedCount++
    } catch (err) {
      console.warn('[OfflineSync] Sync consultation item failed:', err)
    }
  }

  // Sync voice recordings
  for (const item of voices) {
    try {
      const formData = new FormData()
      formData.append('file', item.audioBlob, 'offline_voice.webm')
      await apiClient.post('/consultations/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const tx = db.transaction(STORE_VOICES, 'readwrite')
      tx.objectStore(STORE_VOICES).delete(item.id)
      syncedCount++
    } catch (err) {
      console.warn('[OfflineSync] Sync voice item failed:', err)
    }
  }

  console.log(`[OfflineSync] Successfully synced ${syncedCount} items with server.`)
  return { success: true, syncedCount }
}
