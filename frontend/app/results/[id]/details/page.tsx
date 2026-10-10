import SavedResult from "@/components/saved-result";
export default function Details({ params }: { params: Promise<{ id: string }> }) {
  return <SavedResult params={params} details />;
}
