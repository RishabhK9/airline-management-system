"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure, executeQuery } from "@/lib/db"

export function AssignPilot() {
  const [formData, setFormData] = useState({
    flightID: "",
    personID: "",
  })

  const [flights, setFlights] = useState<{ value: string; label: string }[]>([])
  const [pilots, setPilots] = useState<{ value: string; label: string }[]>([])
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

  useEffect(() => {
    const loadPilots = async () => {
      if (formData.flightID) {
        // Get available pilots who can fly this type of plane
        const response = await executeQuery(
          `
          SELECT p.personID, CONCAT(pe.first_name, ' ', pe.last_name) as name 
          FROM pilot p 
          JOIN person pe ON p.personID = pe.personID
          JOIN pilot_licenses pl ON p.personID = pl.personID
          WHERE p.commanding_flight IS NULL
          AND pl.license = (
            SELECT a.plane_type 
            FROM flight f 
            JOIN airplane a ON f.support_airline = a.airlineID AND f.support_tail = a.tail_num
            WHERE f.flightID = ?
          )
        `,
          [formData.flightID],
        )

        if (response.success && Array.isArray(response.data)) {
          setPilots(
            response.data.map((pilot: any) => ({
              value: pilot.personID,
              label: `${pilot.name} (${pilot.personID})`,
            })),
          )
        }
      } else {
        setPilots([])
      }
    }

    loadPilots()
  }, [formData.flightID])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.flightID || !formData.personID) {
      setResult({
        success: false,
        message: "Please select a flight and a pilot",
      })
      return
    }

    const response = await executeStoredProcedure("assign_pilot", [formData.flightID, formData.personID])

    if (response.success) {
      setResult({
        success: true,
        message: `Pilot ${formData.personID} has been assigned to flight ${formData.flightID} successfully`,
      })
      // Reset form
      setFormData({
        flightID: "",
        personID: "",
      })
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to assign pilot",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="flightID"
              label="Flight ID"
              type="select"
              value={formData.flightID}
              onChange={(value) => handleChange("flightID", value)}
              options={flights}
              required
            />
            <FormField
              id="personID"
              label="Person ID"
              type="select"
              value={formData.personID}
              onChange={(value) => handleChange("personID", value)}
              options={pilots}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit">Assign</Button>
          </div>

          <ResultMessage success={result.success} message={result.message} />
        </CardContent>
      </Card>
    </form>
  )
}
