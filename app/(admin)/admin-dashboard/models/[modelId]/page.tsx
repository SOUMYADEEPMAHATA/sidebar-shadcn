import { mockModels } from "@/lib/mock-db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default async function ModelDetailsPage({ params }: { params: Promise<{ modelId: string }> }) {
    const { modelId } = await params
    const model = mockModels.find(m => m.id === modelId)

    if (!model) {
        notFound()
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin-dashboard/models">
                    <Button variant="outline">
                        &larr; Back to Models
                    </Button>
                </Link>
            </div>
            
            <Card className="max-w-2xl bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-4xl">{model.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-lg mt-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-muted-foreground">Model ID:</span>
                        <span>{model.id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-muted-foreground">Context Window:</span>
                        <span>{model.contextWindow}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-muted-foreground">Size:</span>
                        <span>{model.size}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-muted-foreground">Active Endpoints:</span>
                        <span>{model.endpoints}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
