import { AirlineManagementSystem } from "@/components/airline-management-system"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Airline Management System</h1>
          <ThemeToggle />
        </div>
        <AirlineManagementSystem />
      </div>
    </main>
  )
}
