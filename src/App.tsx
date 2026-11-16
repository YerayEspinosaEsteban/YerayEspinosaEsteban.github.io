import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { CVMode } from './ui/CVMode'
import { Loader } from './ui/Loader'
import { Overlay } from './ui/Overlay'

const Experience = lazy(() => import('./scene/Experience'))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}


export default function App() {
  const env = useMemo(() => ({
    webgl: supportsWebGL(),
    mobile: window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches,
  }), [])
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  if (!env.webgl) return <CVMode standalone />

  return (
    <>
      <div className="no-print fixed inset-0">
        <Suspense fallback={null}>
          <Experience mobile={env.mobile} onReady={onReady} />
        </Suspense>
      </div>
      <div className="no-print">
        <Overlay />
        <Loader sceneReady={ready} />
      </div>
      <CVMode />
    </>
  )
}
