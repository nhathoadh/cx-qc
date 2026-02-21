import { Suspense } from 'react'
import DetailScoringInner from './DetailScoringInner'

export default function DetailScoringPage() {
    return (
        <Suspense fallback={<div className="loading-wrap"><div className="spinner" /></div>}>
            <DetailScoringInner />
        </Suspense>
    )
}
