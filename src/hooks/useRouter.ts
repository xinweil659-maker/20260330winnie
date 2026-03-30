import { useState, useCallback, useMemo, useEffect } from 'react'

function getPathname(): string {
  return window.location.hash.slice(1) || '/'
}

function navigate(to: string) {
  window.history.pushState(null, '', `#${to}`)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useRouter() {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const onHashChange = () => setPathname(getPathname())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const go = useCallback((to: string) => {
    navigate(to)
    window.scrollTo(0, 0)
  }, [])

  return useMemo(() => ({
    pathname,
    navigate: go,
    push: go,
    back: () => window.history.back(),
  }), [pathname, go])
}

export function useLocation() {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const onHashChange = () => setPathname(getPathname())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return { pathname }
}

export function useNavigate() {
  const go = useCallback((to: string) => {
    navigate(to)
    window.scrollTo(0, 0)
  }, [])
  return go
}
