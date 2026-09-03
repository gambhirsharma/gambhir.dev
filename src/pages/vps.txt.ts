import { vpsTxt } from '@/data/vps-txt'

export function GET() {
  return new Response(vpsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
