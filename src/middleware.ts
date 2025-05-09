import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(({ request }, next) => {
  const host = request.headers.get('host') || ''
  const url = new URL(request.url)

  // If coming in on gambhir.xyz (and not already on the warning page)
  if (host.endsWith('gambhir.xyz') && url.pathname !== '/migration-warning') {
    // Server‐side redirect to your migration notice
    return new Response(null, {
      status: 302,
      headers: { Location: '/migration-warning' },
    })
  }

  // Otherwise continue to normal rendering
  return next()
})
