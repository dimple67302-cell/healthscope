import { Suspense } from "react";
import ResultsContent from "@/components/ResultsContent";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-brand-700/60">
          Loading hospitals…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
