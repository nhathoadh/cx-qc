import { Suspense } from 'react'
import FeedbackInner from './FeedbackInner'

export default function FeedbackPage() {
    return (
        <Suspense fallback={<div className="loading-wrap"><div className="spinner" /></div>}>
            <FeedbackInner />
        </Suspense>
    )
}
