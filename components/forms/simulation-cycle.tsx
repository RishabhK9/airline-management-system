"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure } from "@/lib/db"

export function SimulationCycle() {
  const [result, setResult] = useState({
    success: false,
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await executeStoredProcedure("simulation_cycle", [])

    if (response.success) {
      setResult({
        success: true,
        message: "Simulation cycle executed successfully",
      })
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to execute simulation cycle",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Click the button below to execute the next step in the simulation cycle.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit">Next Step</Button>
          </div>

          <ResultMessage success={result.success} message={result.message} />
        </CardContent>
      </Card>
    </form>
  )
}
