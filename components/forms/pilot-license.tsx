"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ResultMessage } from "@/components/ui/result-message"
import { executeStoredProcedure, executeQuery } from "@/lib/db"

export function PilotLicense() {
  const [formData, setFormData] = useState({
    personID: "",
    license: "",
  })

  const [pilots, setPilots] = useState<{ value: string; label: string }[]>([])
  const [licenses, setLicenses] = useState<{ value: string; label: string }[]>([])
  const [hasLicense, setHasLicense] = useState(false)
  const [result, setResult] = useState({
    success: false,
    message: "",
  })

  useEffect(() => {
    const loadPilots = async () => {
      const response = await executeQuery(
        "SELECT personID, CONCAT(first_name, ' ', last_name) as name FROM pilot JOIN person USING (personID)",
      )
      if (response.success && Array.isArray(response.data)) {
        setPilots(
          response.data.map((pilot: any) => ({
            value: pilot.personID,
            label: `${pilot.name} (${pilot.personID})`,
          })),
        )
      }
    }

    const loadLicenses = async () => {
      // Get unique licenses from the database or use predefined values
      setLicenses([
        { value: "Boeing", label: "Boeing" },
        { value: "Airbus", label: "Airbus" },
      ])
    }

    loadPilots()
    loadLicenses()
  }, [])

  useEffect(() => {
    const checkLicense = async () => {
      if (formData.personID && formData.license) {
        const response = await executeQuery("SELECT * FROM pilot_licenses WHERE personID = ? AND license = ?", [
          formData.personID,
          formData.license,
        ])
        if (response.success) {
          setHasLicense(Array.isArray(response.data) && response.data.length > 0)
        }
      } else {
        setHasLicense(false)
      }
    }

    checkLicense()
  }, [formData.personID, formData.license])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.personID || !formData.license) {
      setResult({
        success: false,
        message: "Please select a pilot and license",
      })
      return
    }

    const response = await executeStoredProcedure("grant_or_revoke_pilot_license", [
      formData.personID,
      formData.license,
    ])

    if (response.success) {
      setResult({
        success: true,
        message: hasLicense
          ? `License ${formData.license} revoked from pilot ${formData.personID}`
          : `License ${formData.license} granted to pilot ${formData.personID}`,
      })
      setHasLicense(!hasLicense)
    } else {
      setResult({
        success: false,
        message: response.error || "Failed to update pilot license",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="license"
              label="License"
              type="select"
              value={formData.license}
              onChange={(value) => handleChange("license", value)}
              options={licenses}
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
            <Button type="submit">{hasLicense ? "Revoke" : "Add"}</Button>
          </div>

          <ResultMessage success={result.success} message={result.message} />
        </CardContent>
      </Card>
    </form>
  )
}
