"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddAirplane } from "@/components/forms/add-airplane"
import { AddAirport } from "@/components/forms/add-airport"
import { AddPerson } from "@/components/forms/add-person"
import { PilotLicense } from "@/components/forms/pilot-license"
import { OfferFlight } from "@/components/forms/offer-flight"
import { FlightLanding } from "@/components/forms/flight-landing"
import { FlightTakeoff } from "@/components/forms/flight-takeoff"
import { PassengersBoard } from "@/components/forms/passengers-board"
import { PassengersDisembark } from "@/components/forms/passengers-disembark"
import { AssignPilot } from "@/components/forms/assign-pilot"
import { RecycleCrew } from "@/components/forms/recycle-crew"
import { RetireFlight } from "@/components/forms/retire-flight"
import { SimulationCycle } from "@/components/forms/simulation-cycle"
import { FlightsInAir } from "@/components/views/flights-in-air"
import { FlightsOnGround } from "@/components/views/flights-on-ground"
import { PeopleInAir } from "@/components/views/people-in-air"
import { PeopleOnGround } from "@/components/views/people-on-the-ground"
import { RouteSummary } from "@/components/views/route-summary"
import { AlternativeAirports } from "@/components/views/alternative-airports"

export function AirlineManagementSystem() {
  const [activeTab, setActiveTab] = useState("procedures")
  const [activeForm, setActiveForm] = useState("add_airplane")

  const procedures = [
    { id: "add_airplane", name: "Add Airplane" },
    { id: "add_airport", name: "Add Airport" },
    { id: "add_person", name: "Add Person" },
    { id: "grant_or_revoke_pilot_license", name: "Grant or Revoke Pilot License" },
    { id: "offer_flight", name: "Offer Flight" },
    { id: "flight_landing", name: "Flight Landing" },
    { id: "flight_takeoff", name: "Flight Takeoff" },
    { id: "passengers_board", name: "Passengers Board" },
    { id: "passengers_disembark", name: "Passengers Disembark" },
    { id: "assign_pilot", name: "Assign Pilot" },
    { id: "recycle_crew", name: "Recycle Crew" },
    { id: "retire_flight", name: "Retire Flight" },
    { id: "simulation_cycle", name: "Simulation Cycle" },
  ]

  const views = [
    { id: "flights_in_the_air", name: "Flights in the Air" },
    { id: "flights_on_the_ground", name: "Flights on the Ground" },
    { id: "people_in_the_air", name: "People in the Air" },
    { id: "people_on_the_ground", name: "People on the Ground" },
    { id: "route_summary", name: "Route Summary" },
    { id: "alternative_airports", name: "Alternative Airports" },
  ]

  const renderForm = () => {
    switch (activeForm) {
      case "add_airplane":
        return <AddAirplane />
      case "add_airport":
        return <AddAirport />
      case "add_person":
        return <AddPerson />
      case "grant_or_revoke_pilot_license":
        return <PilotLicense />
      case "offer_flight":
        return <OfferFlight />
      case "flight_landing":
        return <FlightLanding />
      case "flight_takeoff":
        return <FlightTakeoff />
      case "passengers_board":
        return <PassengersBoard />
      case "passengers_disembark":
        return <PassengersDisembark />
      case "assign_pilot":
        return <AssignPilot />
      case "recycle_crew":
        return <RecycleCrew />
      case "retire_flight":
        return <RetireFlight />
      case "simulation_cycle":
        return <SimulationCycle />
      case "flights_in_the_air":
        return <FlightsInAir />
      case "flights_on_the_ground":
        return <FlightsOnGround />
      case "people_in_the_air":
        return <PeopleInAir />
      case "people_on_the_ground":
        return <PeopleOnGround />
      case "route_summary":
        return <RouteSummary />
      case "alternative_airports":
        return <AlternativeAirports />
      default:
        return <div>Select a procedure or view</div>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/40 px-6">
            <CardTitle className="text-lg font-semibold">Functions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-muted/40">
                <TabsTrigger value="procedures" className="rounded-none">Procedures</TabsTrigger>
                <TabsTrigger value="views" className="rounded-none">Views</TabsTrigger>
              </TabsList>
              <TabsContent value="procedures" className="m-0 border-0">
                <nav className="grid gap-1 p-2">
                  {procedures.map((proc) => (
                    <button
                      key={proc.id}
                      className={`w-full rounded-md px-3 py-2 text-sm font-medium text-left transition-colors ${
                        activeForm === proc.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveForm(proc.id)}
                    >
                      {proc.name}
                    </button>
                  ))}
                </nav>
              </TabsContent>
              <TabsContent value="views" className="m-0 border-0">
                <nav className="grid gap-1 p-2">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      className={`w-full rounded-md px-3 py-2 text-sm font-medium text-left transition-colors ${
                        activeForm === view.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveForm(view.id)}
                    >
                      {view.name}
                    </button>
                  ))}
                </nav>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/40 px-6">
            <CardTitle className="text-lg font-semibold">
              {procedures.find((p) => p.id === activeForm)?.name ||
                views.find((v) => v.id === activeForm)?.name ||
                "Select a function"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">{renderForm()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
