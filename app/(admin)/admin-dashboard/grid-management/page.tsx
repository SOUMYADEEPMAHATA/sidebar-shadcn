'use client';
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p> // Optional fallback
});

export default function gridManagement(){
    return(
    <>
    <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden m-2"  >
        <MapComponent />
    </div>
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 p-2">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Clusters List</h1>
            </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-2">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Endpoints per Cluster List</h1>
            </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-2">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Endpoints status </h1>
                <h2 className='text-2xl mb-4'>(GPU, CPU, RAM, Storage, Networking)</h2>
            </div>
        </div>
    </div>

    </>
    )
}