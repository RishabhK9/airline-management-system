"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure } from "@/lib/db"
import { Card } from "@/components/ui/card"

export function AddAirplane() {
  const [formData, setFormData] = useState({
    airlineID: "",
    tail_num: "",
    seat_capacity: 0,
    speed: 0,
    locationID: "",
    plane_type: "",
    maintenanced: null as boolean | null,
    model: null as string | null,
    neo: null as boolean | null,
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
    if (
      !formData.airlineID ||
      !formData.tail_num ||
      !formData.seat_capacity ||
      !formData.speed ||
      !formData.locationID ||
      !formData.plane_type
    ) {
      setResult({
        success: false,
        message: "Please fill in all required fields",
      })
      return
    }

    // Validate plane type specific fields
    if (formData.plane_type === "Boeing") {
      if (formData.maintenanced === null || formData.model === null || formData.neo !== null) {
        setResult({
          success: false,
          message: "Boeing planes require maintenance status and model, but not neo status",
        })
        return
      }
    } else if (formData.plane_type === "Airbus") {
      if (formData.neo === null || formData.maintenanced !== null || formData.model !== null) {
        setResult({
          success: false,
          message: "Airbus planes require neo status, but not maintenance status or model",
        })
        return
      }
    }

    const response = await executeStoredProcedure("add_airplane", [
      formData.airlineID,
      formData.tail_num,
      formData.seat_capacity,
      formData.speed,
      formData.locationID,
      formData.plane_type,
      formData.maintenanced,
      formData.model,
      formData.neo,
    ])

    setResult({
      success: response.success,
      message: response.error || (response.success ? "Airplane added successfully" : "Failed to add airplane"),
    })

    if (response.success) {
      setFormData({
        airlineID: "",
        tail_num: "",
        seat_capacity: 0,
        speed: 0,
        locationID: "",
        plane_type: "",
        maintenanced: null,
        model: null,
        neo: null,
      })
    }
  }

  return (
    <Card className="w-full p-6 border rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <FormField
              id="speed"
              label="Speed"
              type="number"
              value={formData.speed}
              onChange={(value) => handleChange("speed", value)}
              required
              className="w-full"
            />
            <FormField
              id="airlineID"
              label="Airline ID"
              value={formData.airlineID}
              onChange={(value) => handleChange("airlineID", value)}
              required
              className="w-full"
            />
            <FormField
              id="tail_num"
              label="Tail Num"
              value={formData.tail_num}
              onChange={(value) => handleChange("tail_num", value)}
              required
              className="w-full"
            />
            <FormField
              id="model"
              label="Model"
              value={formData.model}
              onChange={(value) => handleChange("model", value)}
              allowNull={true}
              className="w-full"
            />
          </div>
          <div className="space-y-4">
            <div className="flex gap-x-4">
              <FormField
                id="maintenanced"
                label="Maintained"
                type="checkbox"
                value={formData.maintenanced}
                onChange={(value) => handleChange("maintenanced", value)}
                allowNull={true}
                className="flex-1"
              />
              <FormField
                id="neo"
                label="Neo"
                type="checkbox"
                value={formData.neo}
                onChange={(value) => handleChange("neo", value)}
                allowNull={true}
                className="flex-1"
              />
            </div>
            <FormField
              id="locationID"
              label="Location ID"
              value={formData.locationID}
              onChange={(value) => handleChange("locationID", value)}
              required
              className="w-full"
            />
            <FormField
              id="seat_capacity"
              label="Seat Cap"
              type="number"
              value={formData.seat_capacity}
              onChange={(value) => handleChange("seat_capacity", value)}
              required
              className="w-full"
            />
          </div>
        </div>
        <FormField
          id="plane_type"
          label="Plane Type"
          type="select"
          value={formData.plane_type}
          onChange={(value) => handleChange("plane_type", value)}
          options={[
            { value: "Boeing", label: "Boeing" },
            { value: "Airbus", label: "Airbus" },
          ]}
          required
          className="w-full"
        />
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </div>
        {result.message && <ResultMessage success={result.success} message={result.message} />}
      </form>
    </Card>
  )
}
