import { Suspense } from "react";
import AIWorkHubApp from "@/components/AIWorkHubApp";
import { Providers } from "@/components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Page() {
  return (
    <Providers>
      <ErrorBoundary>
        <Suspense>
          <AIWorkHubApp />
        </Suspense>
      </ErrorBoundary>
    </Providers>
  );
}
