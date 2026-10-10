import SavedResult from "@/components/saved-result";
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <SavedResult params={params} />; }
