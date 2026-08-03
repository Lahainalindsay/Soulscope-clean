import { Disclosure } from "../ui/Disclosure";
import { MetadataRow } from "../ui/MetadataRow";

export function EvidenceDisclosure() {
  return (
    <Disclosure title="Evidence and uncertainty disclosure">
      <MetadataRow
        items={[
          { label: "Source type", value: "Demonstration fixture" },
          { label: "Prompts represented", value: "3" },
          { label: "Reference type", value: "Within-session demonstration" },
          { label: "Confidence", value: "Not calculated" },
          { label: "Missingness", value: "Not calculated" },
          { label: "Scientific interpretation", value: "Unavailable in this visual foundation" },
        ]}
      />
    </Disclosure>
  );
}
