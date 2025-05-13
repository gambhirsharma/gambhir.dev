import { defineMiddleware } from 'astro/middleware'

export const onRequest = defineMiddleware((context, next) => {
  // console.log(`Middleware is working`)
  const host = context.request.headers.get('host') || ''

  if (host.includes('gambhir.xyz')) {
    // console.log(`The host is: ${host}`)
    return Response.redirect(
      new URL('/migration-warning', context?.url),
      302,
    )
  }
  return next()
})
