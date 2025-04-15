"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure, executeQuery } from "@/lib/db"

export function PassengersBoard() {
  const [formData, setFormData] = useState({
    flightID: "",
  })

  const [flights, setFlights] = useState<{ value: string; label: string }[]>([])
  const [result, setResult] = useState({
    success: false,
    message: "",
  })

  useEffect(() => {
    const loadFlights = async () => {
      const response = await executeQuery("SELECT flightID FROM flight WHERE airplane_status = 'on_ground'")
      if (response.success && Array.isArray(response.data)) {
        setFlights(
          response.data.map((flight: any) => ({
            value: flight.flightID,
            label: flight.flightID,
          })),
        )
      }
    }

    loadFlights()
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.flightID) {
      setResult({
        success: false,
        message: "Please select a flight",
      })
      return
    }

    const response = await executeStoredProcedure("passengers_board", [formData.flightID])

    if (response.success) {
      setResult({
        success: true,
        message: `Passengers have boarded flight ${formData.flightID} successfully`,
      })
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to board passengers",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="flightID"
              label="Flight ID"
              type="select"
              value={formData.flightID}
              onChange={(value) => handleChange("flightID", value)}
              options={flights}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit">Board</Button>
          </div>

          <ResultMessage success={result.success} message={result.message} />
        </CardContent>
      </Card>
    </form>
  )
}
