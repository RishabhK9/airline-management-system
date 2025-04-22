DELIMITER //

-- Add a new airport
CREATE PROCEDURE add_airport(
    IN ip_airportID VARCHAR(3),
    IN ip_airport_name VARCHAR(100),
    IN ip_city VARCHAR(100),
    IN ip_state VARCHAR(100),
    IN ip_country VARCHAR(100),
    IN ip_locationID VARCHAR(100)
)
BEGIN
    INSERT INTO airport (airportID, airport_name, city, state, country, locationID)
    VALUES (ip_airportID, ip_airport_name, ip_city, ip_state, ip_country, ip_locationID);
END //

-- Add a new airplane
CREATE PROCEDURE add_airplane(
    IN ip_airplaneID VARCHAR(100),
    IN ip_airplane_type VARCHAR(100),
    IN ip_locationID VARCHAR(100)
)
BEGIN
    INSERT INTO airplane (airplaneID, airplane_type, locationID)
    VALUES (ip_airplaneID, ip_airplane_type, ip_locationID);
END //

-- Add a new person
CREATE PROCEDURE add_person(
    IN ip_personID VARCHAR(100),
    IN ip_first_name VARCHAR(100),
    IN ip_last_name VARCHAR(100),
    IN ip_locationID VARCHAR(100)
)
BEGIN
    INSERT INTO person (personID, first_name, last_name, locationID)
    VALUES (ip_personID, ip_first_name, ip_last_name, ip_locationID);
END //

-- Grant or revoke a pilot license
CREATE PROCEDURE grant_or_revoke_pilot_license(
    IN ip_personID VARCHAR(100),
    IN ip_license_type VARCHAR(100),
    IN ip_grant_or_revoke VARCHAR(10)
)
BEGIN
    IF ip_grant_or_revoke = 'grant' THEN
        INSERT INTO pilot_license (personID, license_type)
        VALUES (ip_personID, ip_license_type);
    ELSEIF ip_grant_or_revoke = 'revoke' THEN
        DELETE FROM pilot_license
        WHERE personID = ip_personID AND license_type = ip_license_type;
    END IF;
END //

-- Offer a new flight
CREATE PROCEDURE offer_flight(
    IN ip_flightID VARCHAR(100),
    IN ip_routeID VARCHAR(100),
    IN ip_cost DECIMAL(10,2),
    IN ip_scheduled_departure DATETIME,
    IN ip_scheduled_arrival DATETIME
)
BEGIN
    INSERT INTO flight (flightID, routeID, cost, scheduled_departure, scheduled_arrival)
    VALUES (ip_flightID, ip_routeID, ip_cost, ip_scheduled_departure, ip_scheduled_arrival);
END //

-- Record flight takeoff
CREATE PROCEDURE flight_takeoff(
    IN ip_flightID VARCHAR(100)
)
BEGIN
    UPDATE flight
    SET actual_departure = NOW()
    WHERE flightID = ip_flightID AND actual_departure IS NULL;
END //

-- Record flight landing
CREATE PROCEDURE flight_landing(
    IN ip_flightID VARCHAR(100)
)
BEGIN
    UPDATE flight
    SET actual_arrival = NOW()
    WHERE flightID = ip_flightID AND actual_departure IS NOT NULL AND actual_arrival IS NULL;
END //

-- Record passenger boarding
CREATE PROCEDURE passengers_board(
    IN ip_flightID VARCHAR(100),
    IN ip_personID VARCHAR(100)
)
BEGIN
    INSERT INTO passenger (flightID, personID)
    VALUES (ip_flightID, ip_personID);
END //

-- Record passenger disembarking
CREATE PROCEDURE passengers_disembark(
    IN ip_flightID VARCHAR(100),
    IN ip_personID VARCHAR(100)
)
BEGIN
    DELETE FROM passenger
    WHERE flightID = ip_flightID AND personID = ip_personID;
END //

-- Assign pilot to flight
CREATE PROCEDURE assign_pilot(
    IN ip_flightID VARCHAR(100),
    IN ip_personID VARCHAR(100)
)
BEGIN
    INSERT INTO flight_crew (flightID, personID)
    VALUES (ip_flightID, ip_personID);
END //

-- Recycle crew for a flight
CREATE PROCEDURE recycle_crew(
    IN ip_flightID VARCHAR(100)
)
BEGIN
    DELETE FROM flight_crew
    WHERE flightID = ip_flightID;
END //

-- Retire a flight
CREATE PROCEDURE retire_flight(
    IN ip_flightID VARCHAR(100)
)
BEGIN
    DELETE FROM flight
    WHERE flightID = ip_flightID;
END //

-- Simulation cycle
CREATE PROCEDURE simulation_cycle2(
    IN ip_call BOOLEAN
)
BEGIN
    -- This is a placeholder for simulation logic
    -- In a real implementation, this would handle various simulation tasks
    SELECT 'Simulation cycle completed' as message;
END //

DELIMITER ; 