import { Hero } from "../components/landing/hero"
import { StatsStrip } from "../components/landing/stats-strip"
import { HowItWorks } from "../components/landing/how-it-works"
import { FeatureGrid } from "../components/landing/feature-grid"
import { DemoPreview } from "../components/landing/demo-preview"
import { Testimonials } from "../components/landing/testimonials"
import { Pricing } from "../components/landing/pricing"
import { Footer } from "../components/landing/footer"

export const metadata = {
  title: 'HireFlip - AI Hiring Bias Auditor',
  description: 'Detect and eliminate bias in your hiring process with AI-powered analysis',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <FeatureGrid />
      <DemoPreview />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  )
}
