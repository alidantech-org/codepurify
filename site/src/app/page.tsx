import type { NextPage } from "next";
import type { Metadata } from "next";
import { NavBar } from "@/components/layout/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pipeline } from "@/components/landing/Pipeline";
import { Examples } from "@/components/landing/Examples";
import { UseCases } from "@/components/landing/UseCases";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/layout/Footer";

import { FEATURES } from "@/data/features";
import { PIPELINE_STEPS } from "@/data/pipeline";
import { USE_CASES } from "@/data/use-cases";
import { ENTITY_CODE, TEMPLATE_CODE, OUTPUT_CODE } from "@/data/code-examples";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata();

// ─── Page ─────────────────────────────────────────────────────────────────────

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid" />

      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-20 bg-glow-blue"
          style={{
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full opacity-15 bg-glow-purple"
          style={{
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-24 left-1/3 h-[400px] w-[400px] rounded-full opacity-10 bg-glow-teal"
          style={{
            filter: "blur(80px)",
          }}
        />
      </div>

      <NavBar />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6">
        <Hero />
        <Features features={FEATURES} />
        <Pipeline steps={PIPELINE_STEPS} />
        <Examples
          entityCode={ENTITY_CODE}
          templateCode={TEMPLATE_CODE}
          outputCode={OUTPUT_CODE}
        />
        <UseCases useCases={USE_CASES} />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
