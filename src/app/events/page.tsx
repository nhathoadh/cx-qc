import { Suspense } from 'react'
import EventsInner from './EventsInner'

export default function EventsPage() {
    return (
        <Suspense fallback={<div className="loading-wrap"><div className="spinner" /></div>}>
            <EventsInner />
        </Suspense>
    )
}
