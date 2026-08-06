import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Create a minimal M3U playlist content
  const m3uContent = `#EXTM3U\n#EXTINF:-1,Xtream Player Stream\n${url}\n`;

  // Return it as an M3U file download
  return new NextResponse(m3uContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Content-Disposition': 'attachment; filename="play.m3u"',
    },
  });
}
