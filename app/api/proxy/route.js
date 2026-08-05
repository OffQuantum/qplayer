import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  try {
    // Fetch the target URL using a generic video player User-Agent
    // This helps bypass 401/407 errors from IPTV providers that block web browsers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
        'Accept': '*/*'
      }
    });

    // Create a new headers object based on the original response
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    // Add CORS headers so our frontend can read the stream
    headers.set('access-control-allow-origin', '*');
    
    // Stream the response body directly to the client
    return new NextResponse(response.body, {
      status: response.status,
      headers: headers
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from target URL' }, { status: 500 });
  }
}
