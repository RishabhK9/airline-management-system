-- Drop existing views if they exist
DROP VIEW IF EXISTS available_flights;
DROP VIEW IF EXISTS flights_in_the_air;
DROP VIEW IF EXISTS flights_on_the_ground;
DROP VIEW IF EXISTS people_in_the_air;
DROP VIEW IF EXISTS people_on_the_ground;
DROP VIEW IF EXISTS route_summary;
DROP VIEW IF EXISTS alternative_airports;

-- Create views
CREATE VIEW available_flights AS
SELECT 
    f.flightID,
    f.cost,
    f.scheduled_departure,
    f.scheduled_arrival,
    a1.airportID as departing_from,
    a1.city as departure_city,
    a2.airportID as arriving_at,
    a2.city as arrival_city
FROM flight f
JOIN route r ON f.routeID = r.routeID
JOIN airport a1 ON r.origin_airport = a1.airportID
JOIN airport a2 ON r.destination_airport = a2.airportID
WHERE f.actual_departure IS NULL;

CREATE VIEW flights_in_the_air AS
SELECT 
    a1.airportID as departing_from,
    a2.airportID as arriving_at,
    COUNT(*) as num_flights,
    GROUP_CONCAT(f.flightID) as flight_list,
    MIN(f.scheduled_arrival) as earliest_arrival,
    MAX(f.scheduled_arrival) as latest_arrival,
    GROUP_CONCAT(DISTINCT ap.airplaneID) as airplane_list
FROM flight f
JOIN route r ON f.routeID = r.routeID
JOIN airport a1 ON r.origin_airport = a1.airportID
JOIN airport a2 ON r.destination_airport = a2.airportID
JOIN airplane ap ON ap.locationID = f.flightID
WHERE f.actual_departure IS NOT NULL AND f.actual_arrival IS NULL
GROUP BY a1.airportID, a2.airportID;

CREATE VIEW flights_on_the_ground AS
SELECT 
    a.airportID,
    a.city,
    COUNT(*) as num_flights,
    GROUP_CONCAT(f.flightID) as flight_list,
    GROUP_CONCAT(DISTINCT ap.airplaneID) as airplane_list
FROM flight f
JOIN route r ON f.routeID = r.routeID
JOIN airport a ON r.origin_airport = a.airportID
JOIN airplane ap ON ap.locationID = f.flightID
WHERE f.actual_arrival IS NULL
GROUP BY a.airportID, a.city;

CREATE VIEW people_in_the_air AS
SELECT 
    p.personID,
    p.first_name,
    p.last_name,
    f.flightID,
    a1.airportID as departing_from,
    a2.airportID as arriving_at
FROM person p
JOIN passenger pa ON p.personID = pa.personID
JOIN flight f ON pa.flightID = f.flightID
JOIN route r ON f.routeID = r.routeID
JOIN airport a1 ON r.origin_airport = a1.airportID
JOIN airport a2 ON r.destination_airport = a2.airportID
WHERE f.actual_departure IS NOT NULL AND f.actual_arrival IS NULL;

CREATE VIEW people_on_the_ground AS
SELECT 
    p.personID,
    p.first_name,
    p.last_name,
    a.airportID,
    a.city
FROM person p
JOIN airport a ON p.locationID = a.locationID;

CREATE VIEW route_summary AS
SELECT 
    r.routeID,
    a1.airportID as origin_airport,
    a1.city as origin_city,
    a2.airportID as destination_airport,
    a2.city as destination_city,
    COUNT(DISTINCT f.flightID) as num_flights,
    AVG(f.cost) as avg_cost
FROM route r
JOIN airport a1 ON r.origin_airport = a1.airportID
JOIN airport a2 ON r.destination_airport = a2.airportID
LEFT JOIN flight f ON r.routeID = f.routeID
GROUP BY r.routeID, a1.airportID, a1.city, a2.airportID, a2.city;

CREATE VIEW alternative_airports AS
SELECT 
    a1.airportID as origin_airport,
    a1.city as origin_city,
    a2.airportID as alternative_airport,
    a2.city as alternative_city,
    COUNT(DISTINCT f.flightID) as num_flights
FROM airport a1
JOIN airport a2 ON a1.city = a2.city AND a1.airportID != a2.airportID
JOIN route r1 ON a1.airportID = r1.origin_airport
JOIN route r2 ON a2.airportID = r2.origin_airport
JOIN flight f ON r1.routeID = f.routeID
GROUP BY a1.airportID, a1.city, a2.airportID, a2.city; 