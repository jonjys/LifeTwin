import { Receipt } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function OffersPage() {
  return (
    <ComingSoonPage
      title="Offerter"
      icon={Receipt}
      note="Offert-wizarden (välj kund → beskriv jobbet → AI föreslår material & tid → justera → skicka) byggs i nästa fas, ovanpå kalkylatorerna som redan finns."
    />
  );
}
