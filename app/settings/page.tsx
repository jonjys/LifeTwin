import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Inställningar"
      icon={Settings}
      note="Företagsprofil (org.nr, moms, bankgiro, standardtimpris/påslag) kopplas på när databasen är ansluten — modellen (Company) finns redan i prisma/schema.prisma."
    />
  );
}
