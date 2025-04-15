"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure, executeQuery } from "@/lib/db"

export function OfferFlight() {
  const [formData, setFormData] = useState({
    flightID: "",
    routeID: "",
    support_airline: "",
    support_tail: "",
    progress: 0,
    next_time: "",
    cost: 0,
  })

  const [routes, setRoutes] = useState<{ value: string; label: string }[]>([])
  const [airlines, setAirlines] = useState<{ value: string; label: string }[]>([])
  const [airplanes, setAirplanes] = useState<{ value: string; label: string }[]>([])
  const [result, setResult] = useState({
    success: false,
    message: "",
  })

  useEffect(() => {
    const loadRoutes = async () => {
      const response = await executeQuery("SELECT routeID FROM route")
      if (response.success && Array.isArray(response.data)) {
        setRoutes(
          response.data.map((route: any) => ({
            value: route.routeID,
            label: route.routeID,
          })),
        )
      }
    }

    const loadAirlines = async () => {
      const response = await executeQuery("SELECT airlineID FROM airline")
      if (response.success && Array.isArray(response.data)) {
        setAirlines(
          response.data.map((airline: any) => ({
            value: airline.airlineID,
            label: airline.airlineID,
          })),
        )
      }
    }

    loadRoutes()
    loadAirlines()
  }, [])

  useEffect(() => {
    const loadAirplanes = async () => {
      if (formData.support_airline) {
        const response = await executeQuery(
          "SELECT tail_num FROM airplane WHERE airlineID = ? AND tail_num NOT IN (SELECT support_tail FROM flight WHERE support_airline = ?)",
          [formData.support_airline, formData.support_airline],
        )
        if (response.success && Array.isArray(response.data)) {
          setAirplanes(
            response.data.map((airplane: any) => ({
              value: airplane.tail_num,
              label: airplane.tail_num,
            })),
          )
        }
      } else {
        setAirplanes([])
      }
    }

    loadAirplanes()
  }, [formData.support_airline])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.flightID || !formData.routeID || !formData.next_time || formData.cost <= 0) {
      setResult({
        success: false,
        message: "Please fill in all required fields",
      })
      return
    }

    // Convert time string to proper format if needed
    let timeValue = formData.next_time
    if (!timeValue.includes(":")) {
      // If user entered just hours, add minutes and seconds
      timeValue = `${timeValue}:00:00`
    } else if (timeValue.split(":").length === 2) {
      // If user entered hours and minutes, add seconds
      timeValue = `${timeValue}:00`
    }

    const response = await executeStoredProcedure("offer_flight", [
      formData.flightID,
      formData.routeID,
      formData.support_airline || null,
      formData.support_tail || null,
      formData.progress,
      timeValue,
      formData.cost,
    ])

    if (response.success) {
      setResult({
        success: true,
        message: "Flight offered successfully",
      })
      // Reset form
      setFormData({
        flightID: "",
        routeID: "",
        support_airline: "",
        support_tail: "",
        progress: 0,
        next_time: "",
        cost: 0,
      })
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to offer flight",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="progress"
              label="Progress"
              type="number"
              value={formData.progress}
              onChange={(value) => handleChange("progress", value)}
              required
            />
            <FormField
              id="cost"
              label="Cost"
              type="number"
              value={formData.cost}
              onChange={(value) => handleChange("cost", value)}
              required
            />
            <FormField
              id="flightID"
              label="Flight ID"
              value={formData.flightID}
              onChange={(value) => handleChange("flightID", value)}
              required
            />
            <FormField
              id="routeID"
              label="Route ID"
              type="select"
              value={formData.routeID}
              onChange={(value) => handleChange("routeID", value)}
              options={routes}
              required
            />
            <FormField
              id="next_time"
              label="Next Time"
              value={formData.next_time}
              onChange={(value) => handleChange("next_time", value)}
              placeholder="HH:MM:SS"
              required
            />
            <FormField
              id="support_airline"
              label="Support Airline"
              type="select"
              value={formData.support_airline}
              onChange={(value) => handleChange("support_airline", value)}
              options={airlines}
              allowNull={true}
            />
            <FormField
              id="support_tail"
              label="Support Tail"
              type="select"
              value={formData.support_tail}
              onChange={(value) => handleChange("support_tail", value)}
              options={airplanes}
              allowNull={true}
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
