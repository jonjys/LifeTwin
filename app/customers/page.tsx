import { Users } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function CustomersPage() {
  return (
    <ComingSoonPage
      title="Kunder"
      icon={Users}
      note="CRM:et (kundregister, historik per kund, uppföljning) byggs i nästa fas — schemat finns redan i prisma/schema.prisma."
    />
  );
}
