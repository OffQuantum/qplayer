export async function fetchXtream(server, username, password, action = '', params = {}) {
  const baseUrl = server.endsWith('/') ? server.slice(0, -1) : server;
  
  const targetUrl = new URL(`${baseUrl}/player_api.php`);
  targetUrl.searchParams.append('username', username);
  targetUrl.searchParams.append('password', password);
  
  if (action) {
    targetUrl.searchParams.append('action', action);
  }
  
  for (const [key, value] of Object.entries(params)) {
    targetUrl.searchParams.append(key, value);
  }

  const encodedUrl = encodeURIComponent(targetUrl.toString());
  // Use a public CORS proxy instead of Vercel API
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodedUrl}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch data from Xtream API');
  }
  
  return await response.json();
}

export function getStreamUrl(server, username, password, type, streamId, extension = '') {
  const baseUrl = server.endsWith('/') ? server.slice(0, -1) : server;
  
  if (type === 'live') {
    const url = extension === 'm3u8' 
      ? `${baseUrl}/live/${username}/${password}/${streamId}.m3u8`
      : `${baseUrl}/${username}/${password}/${streamId}`;
    
    // Proxy the live stream to bypass CORS/401/407 provider blocking
    if (typeof window !== 'undefined') {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    return url;
  } else if (type === 'movie') {
    return `${baseUrl}/movie/${username}/${password}/${streamId}.${extension || 'mp4'}`;
  } else if (type === 'series') {
    return `${baseUrl}/series/${username}/${password}/${streamId}.${extension || 'mp4'}`;
  }
  return '';
}
