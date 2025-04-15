"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure, fetchOptions } from "@/lib/db"

export function AddPerson() {
  const [formData, setFormData] = useState({
    personID: "",
    first_name: "",
    last_name: "",
    locationID: "",
    taxID: null as string | null,
    experience: null as number | null,
    miles: null as number | null,
    funds: null as number | null,
  })

  const [locations, setLocations] = useState<{ value: string; label: string }[]>([])
  const [result, setResult] = useState({
    success: false,
    message: "",
  })
  const [personType, setPersonType] = useState<"pilot" | "passenger" | null>(null)

  useEffect(() => {
    const loadLocations = async () => {
      const response = await fetchOptions("location", "locationID")
      if (response.success && Array.isArray(response.data)) {
        setLocations(
          response.data.map((loc: any) => ({
            value: loc.locationID,
            label: loc.locationID,
          })),
        )
      }
    }

    loadLocations()
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePersonTypeChange = (type: "pilot" | "passenger") => {
    setPersonType(type)
    if (type === "pilot") {
      setFormData((prev) => ({
        ...prev,
        taxID: "",
        experience: 0,
        miles: null,
        funds: null,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        taxID: null,
        experience: null,
        miles: 0,
        funds: 0,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.personID || !formData.first_name || !formData.locationID || !personType) {
      setResult({
        success: false,
        message: "Please fill in all required fields and select a person type",
      })
      return
    }

    // Validate person type specific fields
    if (personType === "pilot" && (formData.taxID === null || formData.experience === null)) {
      setResult({
        success: false,
        message: "Pilots require tax ID and experience",
      })
      return
    }

    if (personType === "passenger" && (formData.miles === null || formData.funds === null)) {
      setResult({
        success: false,
        message: "Passengers require miles and funds",
      })
      return
    }

    const response = await executeStoredProcedure("add_person", [
      formData.personID,
      formData.first_name,
      formData.last_name,
      formData.locationID,
      formData.taxID,
      formData.experience,
      formData.miles,
      formData.funds,
    ])

    if (response.success) {
      setResult({
        success: true,
        message: "Person added successfully",
      })
      // Reset form
      setFormData({
        personID: "",
        first_name: "",
        last_name: "",
        locationID: "",
        taxID: null,
        experience: null,
        miles: null,
        funds: null,
      })
      setPersonType(null)
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to add person",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <Button
                type="button"
                variant={personType === "pilot" ? "default" : "outline"}
                onClick={() => handlePersonTypeChange("pilot")}
              >
                Pilot
              </Button>
              <Button
                type="button"
                variant={personType === "passenger" ? "default" : "outline"}
                onClick={() => handlePersonTypeChange("passenger")}
              >
                Passenger
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="locationID"
              label="Location ID"
              type="select"
              value={formData.locationID}
              onChange={(value) => handleChange("locationID", value)}
              options={locations}
              required
            />
            <FormField
              id="personID"
              label="Person ID"
              value={formData.personID}
              onChange={(value) => handleChange("personID", value)}
              required
            />
            <FormField
              id="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={(value) => handleChange("first_name", value)}
              required
            />
            <FormField
              id="miles"
              label="Miles"
              type="number"
              value={formData.miles}
              onChange={(value) => handleChange("miles", value)}
              allowNull={true}
              required={personType === "passenger"}
            />
            <FormField
              id="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={(value) => handleChange("last_name", value)}
            />
            <FormField
              id="funds"
              label="Funds"
              type="number"
              value={formData.funds}
              onChange={(value) => handleChange("funds", value)}
              allowNull={true}
              required={personType === "passenger"}
            />
            <FormField
              id="taxID"
              label="Tax ID"
              value={formData.taxID}
              onChange={(value) => handleChange("taxID", value)}
              allowNull={true}
              required={personType === "pilot"}
            />
            <FormField
              id="experience"
              label="Experience"
              type="number"
              value={formData.experience}
              onChange={(value) => handleChange("experience", value)}
              allowNull={true}
              required={personType === "pilot"}
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
