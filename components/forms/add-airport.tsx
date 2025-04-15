"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure } from "@/lib/db"

export function AddAirport() {
  const [formData, setFormData] = useState({
    airportID: "",
    airport_name: "",
    city: "",
    state: "",
    country: "",
    locationID: "",
  })

  const [result, setResult] = useState({
    success: false,
    message: "",
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.airportID || !formData.city || !formData.state || !formData.country || !formData.locationID) {
      setResult({
        success: false,
        message: "Please fill in all required fields",
      })
      return
    }

    const response = await executeStoredProcedure("add_airport", [
      formData.airportID,
      formData.airport_name,
      formData.city,
      formData.state,
      formData.country,
      formData.locationID,
    ])

    if (response.success) {
      setResult({
        success: true,
        message: "Airport added successfully",
      })
      // Reset form
      setFormData({
        airportID: "",
        airport_name: "",
        city: "",
        state: "",
        country: "",
        locationID: "",
      })
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to add airport",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="state"
              label="State"
              value={formData.state}
              onChange={(value) => handleChange("state", value)}
              required
            />
            <FormField
              id="airportID"
              label="Airport ID"
              value={formData.airportID}
              onChange={(value) => handleChange("airportID", value)}
              required
            />
            <FormField
              id="airport_name"
              label="Airport name"
              value={formData.airport_name}
              onChange={(value) => handleChange("airport_name", value)}
            />
            <FormField
              id="country"
              label="Country"
              value={formData.country}
              onChange={(value) => handleChange("country", value)}
              required
            />
            <FormField
              id="city"
              label="City"
              value={formData.city}
              onChange={(value) => handleChange("city", value)}
              required
            />
            <FormField
              id="locationID"
              label="Location ID"
              value={formData.locationID}
              onChange={(value) => handleChange("locationID", value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>

          <ResultMessage success={result.success} message={result.message} />
        </CardContent>
      </Card>
    </form>
  )
}
