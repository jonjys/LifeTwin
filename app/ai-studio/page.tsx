import { Sparkles } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function AiStudioPage() {
  return (
    <ComingSoonPage
      title="AI Studio"
      icon={Sparkles}
      note="AI Offert & SMS Writer och AI Follow-up & Margin Optimizer byggs i Fas 3, ovanpå samma Claude-integration som Dashboardens Command Bar redan använder."
    />
  );
}
