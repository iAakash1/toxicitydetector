import { ToxicityAssessment } from "@/components/toxicity-assessment"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <ToxicityAssessment />
    </div>
  )
}
