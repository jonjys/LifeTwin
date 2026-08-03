import { Package } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function MaterialsPage() {
  return (
    <ComingSoonPage
      title="Materialbank"
      icon={Package}
      note="Leverantörspriser, kvittoavläsning och dynamisk prisindexering (MaterialBankItem + MaterialPriceHistory finns redan i schemat) byggs i Fas 1."
    />
  );
}
