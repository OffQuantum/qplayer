let lastSyncTime = 0;

async function syncProgressToBackend(progressData) {
  try {
    await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'progress', data: progressData })
    });
  } catch (e) {
    console.error('Progress sync failed', e);
  }
}

export function saveProgress(streamId, type, time, duration, metadata) {
  if (time < 10) return; // Don't save if watched less than 10 seconds
  
  // Calculate percentage
  let percentage = 0;
  if (duration > 0) {
    percentage = (time / duration) * 100;
  }
  
  // If watched more than 95%, we can remove it from continue watching
  if (percentage > 95) {
    removeProgress(streamId);
    return;
  }

  const progressData = {
    streamId,
    type,
    time,
    duration,
    percentage,
    metadata, // { name, cover, etc. }
    updatedAt: Date.now()
  };

  const allProgress = getAllProgress();
  allProgress[streamId] = progressData;
  localStorage.setItem('xtream_progress', JSON.stringify(allProgress));
  
  const now = Date.now();
  if (now - lastSyncTime > 30000) { // Her 30 saniyede bir arkadan senkronize et
    lastSyncTime = now;
    syncProgressToBackend(allProgress);
  }
}

export function getProgress(streamId) {
  const allProgress = getAllProgress();
  return allProgress[streamId] || null;
}

export function getAllProgress() {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('xtream_progress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }
  return {};
}

export function removeProgress(streamId) {
  if (typeof window === 'undefined') return;
  const allProgress = getAllProgress();
  if (allProgress[streamId]) {
    delete allProgress[streamId];
    localStorage.setItem('xtream_progress', JSON.stringify(allProgress));
    syncProgressToBackend(allProgress);
  }
}
