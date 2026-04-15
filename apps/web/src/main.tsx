import "./index.css"

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
const router = createRouter({
  routeTree, context: {
    queryClient
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}



// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>

        <RouterProvider router={router} />
      </QueryClientProvider>

    </StrictMode>,
  )
}
