"use client"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { useRouter } from "next/navigation"
import { mockModels } from "@/lib/mock-db"

export default function ModelsPage() {
    const router = useRouter()
    return(
    <>
    <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="aspect-video rounded-xl bg-muted/50 overflow-auto" >
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-5xl mb-4">Models list</h1>
                
                <div className="flex-1 overflow-auto space-y-2 mb-4">
                    {mockModels.map((model) => (
                        <div
                            key={model.id}
                            className="flex justify-between items-center p-3 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border"
                            onClick={() => router.push(`/admin-dashboard/models/${model.id}`)}
                        >
                            <span className="text-xl font-semibold">{model.name}</span>
                            <span className="text-muted-foreground">{model.endpoints} endpoints</span>
                        </div>
                    ))}
                </div>
                
                {/*<div>
                    <ShimmerButton
                        className="h-11 gap-2 shadow-2xl"
                        onClick={() => router.push("/admin-dashboard")}
                    >
                        <span className="text-sm font-medium">Admin Dashboard</span>
                    </ShimmerButton>
                </div>*/}
            </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 overflow-auto" >
            <div className="m-8 p-2 ">
                <h1 className="text-5xl mb-4">Models Usage</h1>
                <span className="m-3 p-3 block"><h2 className="text-2xl text-justify text-muted-foreground">Models | Tokens consumed | Billing</h2></span>
            </div>
        </div>
    </div>
    <div className="grid auto-rows-min gap-4 md:grid-cols-3 mt-4">
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Time To First Token</h1>
            </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Time Per Output Token</h1>
            </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50" >
        <div className="aspect-video rounded-xl bg-muted/50">
            <div className="m-2 p-2 flex flex-col h-full">
                <h1 className="text-3xl mb-4">Requests Running </h1>
            </div>
        </div>
        </div>
    </div>
    </>
    )
}
