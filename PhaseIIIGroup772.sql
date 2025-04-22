-- CS4400: Introduction to Database Systems: Monday, March 3, 2025
-- Simple Airline Management System Course Project Mechanics [TEMPLATE] (v0)
-- Views, Functions & Stored Procedures
-- Team 77
-- Caroline Betz (cbetz6)
-- Rishabh Kanodia (rkanodia3)
-- Nix Pham (tpham344)

/* This is a standard preamble for most of our scripts.  The intent is to establish
a consistent environment for the database behavior. */
set global transaction isolation level serializable;
set global SQL_MODE = 'ANSI,TRADITIONAL';
set names utf8mb4;
set SQL_SAFE_UPDATES = 0;

set @thisDatabase = 'flight_tracking';
use flight_tracking;
-- -----------------------------------------------------------------------------
-- stored procedures and views
-- -----------------------------------------------------------------------------
/* Standard Procedure: If one or more of the necessary conditions for a procedure to
be executed is false, then simply have the procedure halt execution without changing
the database state. Do NOT display any error messages, etc. */

-- [_] supporting functions, views and stored procedures
-- -----------------------------------------------------------------------------
/* Helpful library capabilities to simplify the implementation of the required
views and procedures. */
-- -----------------------------------------------------------------------------
drop function if exists leg_time;
delimiter //
create function leg_time (ip_distance integer, ip_speed integer)
	returns time reads sql data
begin
	declare total_time decimal(10,2);
    declare hours, minutes integer default 0;
    set total_time = ip_distance / ip_speed;
    set hours = truncate(total_time, 0);
    set minutes = truncate((total_time - hours) * 60, 0);
    return maketime(hours, minutes, 0);
end //
delimiter ;


-- get_plane_loc_id
create or replace view get_plane_loc_id as
select f.flightID, a.locationID as plane 
from airplane a join
flight f on (a.airlineID, a.tail_num) = (f.support_airline, f.support_tail);

-- [1] add_airplane()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airplane.  A new airplane must be sponsored
by an existing airline, and must have a unique tail number for that airline.
username.  An airplane must also have a non-zero seat capacity and speed. An airplane
might also have other factors depending on it's type, like the model and the engine.  
Finally, an airplane must have a new and database-wide unique location
since it will be used to carry passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_airplane;
delimiter //
create procedure add_airplane (in ip_airlineID varchar(50), in ip_tail_num varchar(50),
	in ip_seat_capacity integer, in ip_speed integer, in ip_locationID varchar(50),
    in ip_plane_type varchar(100), in ip_maintenanced varchar(50), in ip_model varchar(50),
    in ip_neo varchar(50))
sp_main: begin
	if ip_plane_type not in ('Boeing', 'Airbus') then
        leave sp_main;
	end if;
    
    if ip_maintenanced = 'Yes' then set ip_maintenanced = true; 
	elseif ip_maintenanced = 'No' then set ip_maintenanced = false; 
    elseif ip_maintenanced = 'n/a' then set ip_maintenanced = null; 
    end if;
    
    if ip_neo = 'Yes' then set ip_neo = true; 
	elseif ip_neo = 'No' then set ip_neo = false; 
    elseif ip_neo = 'n/a' then set ip_neo = null; 
    end if;
    
    if ip_model = 'n/a' then set ip_model = null; end if;

    
    if ip_locationID in (select locationID from location) then
		leave sp_main;
	end if;
    
    if ip_plane_type = 'Boeing' and ip_maintenanced is null then
		leave sp_main;
	elseif ip_plane_type = 'Boeing' and ip_neo is not null then
		leave sp_main;
	elseif ip_plane_type = 'Boeing' and ip_model is null then
		leave sp_main;
	elseif ip_plane_type = 'Airbus' and ip_neo is null then
		leave sp_main;
	elseif ip_plane_type = 'Airbus' and ip_maintenanced is not null then
		leave sp_main;
	elseif ip_plane_type = 'Airbus' and ip_model is not null then
		leave sp_main;
	end if;
    
    if (ip_tail_num , ip_locationID) in (select tail_num, locationID from airplane) then
        leave sp_main;
    end if;
    
    if ip_airlineID not in (select airlineID from airline) then
        leave sp_main;
    end if;
    
    if ip_seat_capacity <= 0 then
        leave sp_main;
    end if;
    
    if ip_speed <= 0 then
        leave sp_main;
    end if;
    
    insert into location values (ip_locationID);
    
    insert into airplane values (ip_airlineID, ip_tail_num, ip_seat_capacity, ip_speed, ip_locationID, 
    ip_plane_type, ip_maintenanced, ip_model, ip_neo);

end //
delimiter ;



-- [2] add_airport()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airport.  A new airport must have a unique
identifier along with a new and database-wide unique location if it will be used
to support airplane takeoffs and landings.  An airport may have a longer, more
descriptive name.  An airport must also have a city, state, and country designation. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_airport;
delimiter //
create procedure add_airport (in ip_airportID char(3), in ip_airport_name varchar(200),
    in ip_city varchar(100), in ip_state varchar(100), in ip_country char(3), in ip_locationID varchar(50))
sp_main: begin
	-- checking other requirements
    if ip_airportID is null then leave sp_main; end if;
    if ip_city is null then leave sp_main; end if;
    if ip_state is null then leave sp_main; end if;
    if ip_country is null then leave sp_main; end if;
	if ip_locationID is null then leave sp_main; end if;
	-- Ensure that the airport and location values are new and unique
    if ip_airportID in (select airportID from airport) then leave sp_main; end if;
    if ip_airport_name in (select airport_name from airport) then leave sp_main; end if;
    if ip_locationID in (select locationID from airport) then leave sp_main; end if;
    if ip_locationID in (select locationID from location) then leave sp_main; end if;
    -- Add airport and location into respective tables
    insert into location values (ip_locationID);
    insert into airport values (ip_airportID, ip_airport_name, ip_city, ip_state, ip_country, ip_locationID);

end //
delimiter ;

-- [3] add_person()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new person.  A new person must reference a unique
identifier along with a database-wide unique location used to determine where the
person is currently located: either at an airport, or on an airplane, at any given
time.  A person must have a first name, and might also have a last name.

A person can hold a pilot role or a passenger role (exclusively).  As a pilot,
a person must have a tax identifier to receive pay, and an experience level.  As a
passenger, a person will have some amount of frequent flyer miles, along with a
certain amount of funds needed to purchase tickets for flights. */
-- -----------------------------------------------------------------------------drop procedure if exists add_person;
drop procedure if exists add_person;
delimiter //
create procedure add_person (in ip_personID varchar(50), in ip_first_name varchar(100),
    in ip_last_name varchar(100), in ip_locationID varchar(50), in ip_taxID varchar(50),
    in ip_experience varchar(50), in ip_miles varchar(50), in ip_funds varchar(50))
sp_main: begin
	declare experience_int int;
    declare miles_int int;
    declare funds_int int;
	-- check requirements
    if ip_last_name = 'n/a' then set ip_last_name = null; end if;
    if ip_taxID = 'n/a' then set ip_taxID = null; end if;
    if ip_experience = 'n/a' then set ip_experience = null; end if;
    if ip_miles = 'n/a' then set ip_miles = null; end if;
    if ip_funds = 'n/a' then set ip_funds = null; end if;
    
    if ip_first_name is null then leave sp_main; end if;
	-- Ensure that the location is valid
    if ip_locationID not in (select locationID from location) then leave sp_main; end if;
    -- Ensure that the persion ID is unique
    if ip_personID in (select personID from person) then leave sp_main; end if;
	
    
    if ip_personID in (select personID from passenger) then leave sp_main; end if;
    if ip_personID in (select personID from pilot) then leave sp_main; end if;
    if (ip_taxID is not null) and (ip_taxID in (select taxID from pilot)) then leave sp_main; end if;
    -- Ensure that the person is a pilot or passenger
    if (ip_taxID is null) and (ip_experience is null) and (ip_miles is null) and (ip_funds is null) then leave sp_main; end if;
	if (ip_taxID is not null) and (ip_experience is not null) and (ip_miles is not null) and (ip_funds is not null) then leave sp_main; end if;
    if (ip_taxID is null) and (ip_experience is not null) then leave sp_main; end if;
    if (ip_taxID is not null) and (ip_experience is null) then leave sp_main; end if;
    if (ip_miles is null) and (ip_funds is not null) then leave sp_main; end if;
    if (ip_miles is not null) and (ip_funds is null) then leave sp_main; end if;
    if (ip_taxID is not null or ip_experience is not null) and (ip_miles is not null or ip_funds is not null) then leave sp_main; end if;
    
    -- Add them to the person table as well as the table of their respective role
    insert into person values (ip_personID, ip_first_name, ip_last_name, ip_locationID);
    if (ip_miles is null) and (ip_funds is null) then 
		set experience_int = cast(ip_experience as unsigned);
		insert into pilot (personID, taxID, experience) values (ip_personID, ip_taxID, ip_experience);
    elseif (ip_taxID is null) and (ip_experience is null) then 
    set miles_int = cast(ip_miles as unsigned);
    set funds_int = cast(ip_funds as unsigned);
	insert into passenger values(ip_personID, ip_miles, ip_funds);
    end if;

end //
delimiter ;

-- [4] grant_or_revoke_pilot_license()
-- -----------------------------------------------------------------------------
/* This stored procedure inverts the status of a pilot license.  If the license
doesn't exist, it must be created; and, if it aready exists, then it must be removed. */
-- -----------------------------------------------------------------------------
drop procedure if exists grant_or_revoke_pilot_license;
delimiter //
create procedure grant_or_revoke_pilot_license (in ip_personID varchar(50), in ip_license varchar(100))
sp_main: begin

	-- Ensure that the person is a valid pilot
    if ip_personID is null then leave sp_main; end if;
    if ip_license is null then leave sp_main; end if;
    if ip_personID not in (select personID from pilot) then leave sp_main; end if;
    if ip_personID not in (select personID from person) then leave sp_main; end if;
    if ip_personID in (select personID from passenger) then leave sp_main; end if;
    -- If license exists, delete it, otherwise add the license
    if (ip_personID, ip_license) in (select personID, license from pilot_licenses) then 
		delete from pilot_licenses where (personID, license) = (ip_personID, ip_license);
	elseif (ip_personID, ip_license) not in (select personID, license from pilot_licenses) then
		insert into pilot_licenses (personID, license) values (ip_personID, ip_license); end if;

end //
delimiter ;


-- route_length()
-- this stored view displayes the total length of all the legs included on a route
create or replace view route_length (routeID, length) as
select r.routeID, sum(l.distance) from leg l join route_path r on r.legID = l.legID group by routeID;


-- [5] offer_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new flight.  The flight can be defined before
an airplane has been assigned for support, but it must have a valid route.  And
the airplane, if designated, must not be in use by another flight.  The flight
can be started at any valid location along the route except for the final stop,
and it will begin on the ground.  You must also include when the flight will
takeoff along with its cost. */
-- -----------------------------------------------------------------------------
drop procedure if exists offer_flight;
delimiter //
create procedure offer_flight (in ip_flightID varchar(50), in ip_routeID varchar(50),
    in ip_support_airline varchar(50), in ip_support_tail varchar(50), in ip_progress integer,
    in ip_next_time time, in ip_cost integer)
sp_main: begin

	if ip_support_airline = 'n/a' then set ip_support_airline = null; end if;
	if ip_support_tail = 'n/a' then set ip_support_tail = null; end if;

	-- other constraints
    if ip_routeID is null then leave sp_main; end if;
    if (ip_support_tail is not null) and ((ip_support_airline, ip_support_tail) in (select support_airline, support_tail from flight)) then leave sp_main; end if;
    if ip_progress >= (select max(sequence) from route_path where routeID like ip_routeID group by routeID) then leave sp_main; end if;
	-- Ensure that the airplane exists
    if ((ip_support_airline, ip_support_tail) not in (select airlineID, tail_num from airplane)) and (ip_support_tail is not null) then leave sp_main; end if;
    -- Ensure that the route exists
    if ip_routeID not in (select routeID from route) then leave sp_main; end if;
    if ip_routeID not in (select routeID from route_path) then leave sp_main; end if;
    -- Ensure that the progress is less than the length of the route
    if (ip_progress > (select length from route_length where routeID like ip_routeID)) then leave sp_main; end if;
    -- Create the flight with the airplane starting in on the ground
	insert into flight values (ip_flightID, ip_routeID, ip_support_airline, ip_support_tail, ip_progress, 'on_ground', ip_next_time, ip_cost);


end //
delimiter ;


-- get_current_legs()
-- returns leg ID for flight based on flight and progress
create or replace view get_current_legs as 
select f.flightID, l.legID, l.distance from leg l join route_path r on l.legID = r.legID
join flight f on r.routeID = f.routeID
where r.sequence = f.progress;

-- [6] flight_landing()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight landing at the next airport
along it's route.  The time for the flight should be moved one hour into the future
to allow for the flight to be checked, refueled, restocked, etc. for the next leg
of travel.  Also, the pilots of the flight should receive increased experience, and
the passengers should have their frequent flyer miles updated. */
-- -----------------------------------------------------------------------------
drop procedure if exists flight_landing;
delimiter //
create procedure flight_landing (in ip_flightID varchar(50))
sp_main: begin

	-- Ensure that the flight exists
    if ip_flightID is null then leave sp_main; end if;
    if ip_flightID not in (select flightID from flight) then leave sp_main; end if;
    -- Ensure that the flight is in the air
    if ip_flightID not in (select flightID from flight where airplane_status like 'in_flight') then leave sp_main; end if;
    -- Increment the pilot's experience by 1
    update pilot
    set experience = experience + 1
    where commanding_flight like ip_flightID;
    -- Increment the frequent flyer miles of all passengers on the plane
    update passenger
    set miles = miles + (select distance from get_current_legs where flightID like ip_flightID)
    where personID in (select personID from person where locationID like (select p.locationID from airplane p join flight f on (p.airlineID, p.tail_num) = (f.support_airline, f.support_tail) where flightID like ip_flightID));
    -- Update the status of the flight and increment the next time to 1 hour later
		-- Hint: use addtime()
	update flight 
    set next_time = addtime(next_time, '1:0:0')
    where flightID like ip_flightID;
    
    update flight 
    set airplane_status = 'on_ground'
    where flightID like ip_flightID;


end //
delimiter ;


-- get_next_legs()
-- returns leg ID for flight based on flight and progress
create or replace view get_next_legs as 
select f.flightID, l.legID as next_leg from leg l join route_path r on l.legID = r.legID
join flight f on r.routeID = f.routeID
where r.sequence = f.progress + 1;


-- flight_time()
-- calculates flight time based on airplane speed and leg distance
create or replace view flight_time as
select g.flightID, g.legID, (g.distance / (select speed from airplane where tail_num like 
(select  support_tail from flight where flightID like g.flightID) 
and airlineID like (select  support_airline from flight where flightID like g.flightID))) as f_time
from get_current_legs g;


-- num_pilots()
-- displays number of availible pilots for each plane type
create or replace view num_pilots as
select pl.license, count(pl.personID) as num_pilots from pilot_licenses pl join pilot p on pl.personID = p.personID
where commanding_flight is null
group by pl.license;



-- [7] flight_takeoff()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight taking off from its current
airport towards the next airport along it's route.  The time for the next leg of
the flight must be calculated based on the distance and the speed of the airplane.
And we must also ensure that Airbus and general planes have at least one pilot
assigned, while Boeing must have a minimum of two pilots. If the flight cannot take
off because of a pilot shortage, then the flight must be delayed for 30 minutes. */
-- -----------------------------------------------------------------------------
drop procedure if exists flight_takeoff;
delimiter //

create procedure flight_takeoff (in ip_flightID varchar(50))
sp_main: begin
    if ip_flightID not in (select flightID from flight) then
        leave sp_main;
    end if;

    if (select airplane_status from flight where flightID = ip_flightID) != 'on_ground' then
        leave sp_main;
    end if;

    if (select progress from flight where flightID = ip_flightID) >= 
       (select max(sequence) from route_path natural join flight where flightID = ip_flightID) then
        leave sp_main;
    end if;

    if (select plane_type from flight left join airplane on support_tail = tail_num 
        where flightID = ip_flightID) = 'Airbus'
        and  (select count(*) from pilot where commanding_flight = ip_flightID) < 1 then
        update flight 
        set next_time = addtime(next_time, '00:30:00') where flightID = ip_flightID;
        leave sp_main;
    end if;

    if (select plane_type from flight 
        left join airplane on support_tail = tail_num 
        where flightID = ip_flightID) is null
        and (select count(*) from pilot where commanding_flight = ip_flightID) < 1 THEN
        update flight 
        set next_time = addtime(next_time, '00:30:00') where flightID = ip_flightID;
        leave sp_main;
    end if;

	if (select plane_type from flight left join airplane on support_tail = tail_num 
        where flightID = ip_flightID) = 'Boeing'
        and  (select count(*) from pilot where commanding_flight = ip_flightID) < 2 then
        update flight 
        set next_time = addtime(next_time, '00:30:00') where flightID = ip_flightID;
        leave sp_main;
    end if;

    update flight set progress = progress + 1, airplane_status = 'in_flight'
    WHERE flightID = ip_flightID;

    update flight
    join (select flight.flightID, distance / speed * 3600 AS travel_seconds from flight
        natural join route_path
        natural join leg
        left join airplane on support_tail = tail_num
        where flight.flightID = ip_flightID)
        as travel_time on flight.flightID = travel_time.flightID
    set flight.next_time = addtime(flight.next_time, sec_to_time(travel_time.travel_seconds));

end //
delimiter ;






-- [8] passengers_board()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting on a flight at
its current airport.  The passengers must be at the same airport as the flight,
and the flight must be heading towards that passenger's desired destination.
Also, each passenger must have enough funds to cover the flight.  Finally, there
must be enough seats to accommodate all boarding passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists passengers_board;
delimiter //
create procedure passengers_board (in ip_flightID varchar(50))
sp_main: begin
	declare v_current_loc varchar(100);
    declare v_next_airport char(3);
    declare v_cost int;
    declare v_seat_capacity int;
    declare v_eligible_count int;
    declare num_attempt_board int;
    declare plane_id varchar(100);
    declare current_pax_count int;
    
    if ip_flightID is null then leave sp_main; end if;
	-- Ensure the flight exists
    if ip_flightID not in (select flightID from flight) then leave sp_main; end if;
    -- Ensure that the flight is on the ground
    if ip_flightID not in (select flightID from flight where airplane_status like 'on_ground') then leave sp_main; end if;
    -- Ensure that the flight has further legs to be flown
    if ip_flightID not in (select flightID from get_next_legs) then leave sp_main; end if;
    -- Determine the number of passengers attempting to board the flight
    -- Use the following to check:
		-- The airport the airplane is currently located at
        -- The passengers are located at that airport
        -- The passenger's immediate next destination matches that of the flight
        -- The passenger has enough funds to afford the flight
	set v_current_loc = (select locationID from airport where airportID like (
     select  l.departure from get_next_legs g join leg l on g.next_leg = l.legID 
		where g.flightID = ip_flightID));
	set plane_id = (select plane from get_plane_loc_id where flightID like ip_flightID);
    set current_pax_count = (select count(pa.personID) from passenger pa join person p on pa.personID = p.personID where p.locationID like plane_id);
    set v_cost = (select cost from flight where flightID = ip_flightID);
    set v_seat_capacity = (select seat_capacity from airplane a join flight f on (a.airlineID, a.tail_num) = (f.support_airline, f.support_tail)
    where f.flightID = ip_flightID);
    set v_next_airport = (select l.arrival from get_next_legs g join leg l on g.next_leg = l.legID 
		where g.flightID = ip_flightID);
        
	set v_eligible_count = (select count(*) from person p join passenger pa on p.personID = pa.personID
		where p.locationID = v_current_loc and pa.funds >= v_cost and exists (select 1 from passenger_vacations pv
		where pv.personID = p.personID and pv.airportID = v_next_airport and 
        pv.sequence = (select min(sequence) from passenger_vacations where personID = p.personID)));
        
	-- Check if there enough seats for all the passengers
		-- If not, do not add board any passengers
        -- If there are, board them and deduct their funds
	if v_eligible_count > (v_seat_capacity - current_pax_count) then leave sp_main; end if;
    
	update passenger pa
    join person p on pa.personID = p.personID 
    set pa.funds = pa.funds - v_cost, p.locationID = plane_id 
	where p.locationID like v_current_loc and pa.funds >= v_cost and exists (
        select 1 from passenger_vacations pv where pv.personID like p.personID and pv.airportID like v_next_airport
		and pv.sequence = (select min(sequence) from passenger_vacations where personID = p.personID));
        
end //
delimiter ;




-- [9] passengers_disembark()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting off of a flight
at its current airport.  The passengers must be on that flight, and the flight must
be located at the destination airport as referenced by the ticket. */
-- -----------------------------------------------------------------------------
drop procedure if exists passengers_disembark;
delimiter //
create procedure passengers_disembark (in ip_flightID varchar(50))
sp_main: begin
declare dest char(3);
declare dest_location varchar(50);

if ip_flightID is null then
	leave sp_main;
end if;

if ip_flightID not in (select flightID from flight) then
	leave sp_main;
end if;
if (select airplane_status from flight where flightID = ip_flightID) != 'on_ground' then
	leave sp_main;
end if;

set dest = (select leg.arrival from leg join route_path on leg.legID = route_path.legID
         join flight on route_path.routeID = flight.routeID
         where flight.flightID = ip_flightID and route_path.sequence = flight.progress limit 1);
    if dest is null then 
    leave sp_main;
    end if;
    
    set dest_location = (select locationID from airport where airportID = dest limit 1);
    if dest_location is null then
    leave sp_main;
    end if;

	update person p set p.locationID = dest_location where p.locationID =
    (select locationID from airplane a join flight f on a.airlineID = 
    f.support_airline and a.tail_num = f.support_tail where f.flightID = ip_flightID)
    and exists (select 1 from passenger_vacations pv where pv.personID = p.personID
    and pv.airportID = dest and pv.sequence = (select min(sequence) from
    passenger_vacations where personID = p.personID));

	update passenger_vacations as pv set pv.airportID = dest where pv.personID
    in (select p.personID from person p where p.locationID = dest);
    update passenger_vacations as pv set sequence = sequence + 1 where pv.personID
    in (select p.personID from person p where p.locationID = dest);
    
end //
delimiter ;



-- [10] assign_pilot()
-- -----------------------------------------------------------------------------
/* This stored procedure assigns a pilot as part of the flight crew for a given
flight.  The pilot being assigned must have a license for that type of airplane,
and must be at the same location as the flight.  Also, a pilot can only support
one flight (i.e. one airplane) at a time.  The pilot must be assigned to the flight
and have their location updated for the appropriate airplane. */
-- -----------------------------------------------------------------------------
drop procedure if exists assign_pilot;
delimiter //
create procedure assign_pilot (in ip_flightID varchar(50), ip_personID varchar(50))
sp_main: begin
	if ip_flightID is null then leave sp_main; end if;
    if ip_personID is null then leave sp_main; end if;
	-- Ensure the flight exists
	if ip_flightID not in (select flightID from flight) then leave sp_main; end if;
    -- Ensure that the flight is on the ground
	if ip_flightID not in (select flightID from flight where airplane_status like 'on_ground') then leave sp_main; end if;
    -- Ensure that the flight has further legs to be flown
	if ip_flightID not in (select flightID from get_next_legs) then leave sp_main; end if;
    -- Ensure that the pilot exists and is not already assigned
    if ip_personID not in (select personID from person) then leave sp_main; end if;
	if ip_personID not in (select personID from pilot) then leave sp_main; end if;
    if ip_personID not in (select personID from pilot where commanding_flight is null) then leave sp_main; end if;
    
	-- Ensure that the pilot has the appropriate license
    if (select p.plane_type
          from airplane p 
          join flight f on p.airlineID = f.support_airline and p.tail_num = f.support_tail
          where f.flightID = ip_flightID) 
	not in (select license from pilot_licenses where personID = ip_personID) 
    then leave sp_main;
    end if;
    
    if (select commanding_flight from pilot where personID like ip_personID) is not null then leave sp_main; end if;
    
    -- Get airportID from matching person location to airport location, then use this to check flight 
    -- to get legID and check route_path to see location of airplane
    -- Ensure the pilot is located at the airport of the plane that is supporting the flight
    if (select airportID from airport a join person p on a.locationID = p.locationID where personID like ip_personID)
       <> (select l.departure from flight f
			join route_path rp on f.routeID = rp.routeID join leg l on rp.legID  = l.legID
     where f.flightID = ip_flightID and rp.sequence = f.progress limit 1) 
     then leave sp_main;
    end if;
    
    -- Assign the pilot to the flight and update their location to be on the plane
	update pilot
    set commanding_flight = ip_flightID
    where personID like ip_personID;
    
    update person
      set locationID = (
            select a.locationID
            from airplane a 
            join flight f on a.airlineID = f.support_airline and a.tail_num = f.support_tail
            where f.flightID = ip_flightID
          )
      where personID = ip_personID;

end //
delimiter ;


-- [11] recycle_crew()
-- -----------------------------------------------------------------------------
/* This stored procedure releases the assignments for a given flight crew.  The
flight must have ended, and all passengers must have disembarked. */
-- -----------------------------------------------------------------------------
drop procedure if exists recycle_crew;
delimiter //
create procedure recycle_crew (in ip_flightID varchar(50))
sp_main: begin
	declare v_arrival_location varchar(50);
    if ip_flightID is null then leave sp_main; end if;
	-- Ensure that the flight is on the ground
    if ip_flightID not in (select flightID from flight where airplane_status like 'on_ground') then leave sp_main; end if;
    -- Ensure that the flight does not have any more legs
    if ip_flightID in (select flightID from get_next_legs) then leave sp_main; end if;
    -- Ensure that the flight is empty of passengers
    if (select count(p.personID) from airplane a join flight f on a.airlineID = f.support_airline 
		and a.tail_num = f.support_tail join person p on p.locationID = a.locationID join passenger pa on p.personID = pa.personID 
        where f.flightID = ip_flightID) > 0 then leave sp_main; end if;
    
    -- Determine the final arrival location for the flight
    select a.locationID into v_arrival_location from airport a join leg l on a.airportID = l.arrival
    where l.legID = (select legID from route_path where routeID = (select routeID from flight where flightID = ip_flightID)
	order by sequence desc limit 1);
    if v_arrival_location is null then leave sp_main; end if;
    
     -- Move all pilots to the airport the plane of the flight is located at
    update person
    set locationID = v_arrival_location
    where personID like (select personID from pilot where commanding_flight like ip_flightID);
    
    -- Update assignements of all pilots
    update pilot
    set commanding_flight = null
    where commanding_flight like ip_flightID;


end //
delimiter ;


-- [12] retire_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure removes a flight that has ended from the system.  The
flight must be on the ground, and either be at the start its route, or at the
end of its route.  And the flight must be empty - no pilots or passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists retire_flight;
delimiter //
create procedure retire_flight (in ip_flightID varchar(50))
sp_main: begin
	if ip_flightID is null then leave sp_main; end if;
	-- Ensure that the flight is on the ground
    if ip_flightID not in (select flightID from flight where airplane_status like 'on_ground') then leave sp_main; end if;
    -- Ensure that the flight does not have any more legs
    if ip_flightID in (select flightID from get_next_legs) then leave sp_main; end if;
    -- Ensure that there are no more people on the plane supporting the flight
    if (select count(personID) from person group by locationID having locationID like 
    (select locationID from airplane a join flight f on 
    (a.airlineID, a.tail_num) = (f.support_airline, f.support_tail) where f.flightID like ip_flightID)) > 0
    then leave sp_main; end if;
    -- Remove the flight from the system
    delete from flight where flightID like ip_flightID;

end //
delimiter ;


-- [13] simulation_cycle()
-- -----------------------------------------------------------------------------
/* This stored procedure executes the next step in the simulation cycle.  The flight
with the smallest next time in chronological order must be identified and selected.
If multiple flights have the same time, then flights that are landing should be
preferred over flights that are taking off.  Similarly, flights with the lowest
identifier in alphabetical order should also be preferred.

If an airplane is in flight and waiting to land, then the flight should be allowed
to land, passengers allowed to disembark, and the time advanced by one hour until
the next takeoff to allow for preparations.

If an airplane is on the ground and waiting to takeoff, then the passengers should
be allowed to board, and the time should be advanced to represent when the airplane
will land at its next location based on the leg distance and airplane speed.

If an airplane is on the ground and has reached the end of its route, then the
flight crew should be recycled to allow rest, and the flight itself should be
retired from the system. */
-- -----------------------------------------------------------------------------
drop procedure if exists simulation_cycle;
delimiter //
create procedure simulation_cycle (ip_call bool)
sp_main: begin
	declare next_flight text;
    declare next_flight_status text;
	-- Identify the next flight to be processed
    set next_flight = (select flightID from flight order by next_time asc, airplane_status asc, flightID asc limit 1);
    set next_flight_status = (select airplane_status from flight where flightID like next_flight);
    -- If the flight is in the air:
		-- Land the flight and disembark passengers
        -- If it has reached the end:
			-- Recycle crew and retire flight
	-- if flight in air 
	if next_flight_status like 'in_flight' then call flight_landing(next_flight); end if; 
	if next_flight_status like 'in_flight' then call passengers_disembark(next_flight); end if; 
--     if next_flight_status like 'in_air' then
-- 	end if;
    -- if flight in air and does not have another leg
    if (next_flight not in (select flightID from get_next_legs)) and (next_flight_status like 'in_flight') then call recycle_crew(next_flight); end if;
    if (next_flight not in (select flightID from get_next_legs)) and (next_flight_status like 'in_flight') then call retire_flight(next_flight); end if;
	-- If the flight is on the ground:
		-- Board passengers and have the plane takeoff
	-- if flight on ground
	if next_flight_status like 'on_ground' then call passengers_board(next_flight); end if; 
    if next_flight_status like 'on_ground' then call flight_takeoff(next_flight); end if;
    -- if flight on ground and has no further legs
	if (next_flight_status like 'on_ground') and (next_flight not in (select commanding_flight from pilot)) then call assign_pilot(next_flight); end if;
    if (next_flight_status like 'on_ground') and (next_flight not in (select flightID from get_next_legs)) then call retire_flight(next_flight); end if;
	-- Hint: use the previously created procedures

end //
delimiter ;

-- adding for implenetation purposes
drop procedure if exists simulation_cycle2;
delimiter //
create procedure simulation_cycle2 (ip_call bool)
sp_main: begin
call simulation_cycle();
end //
delimiter ;

-- get_current_dept_and_arrival_in_air
-- shows current airport and arrival airport for flights that are on the ground
create or replace view get_current_dept_and_arrival_in_air as
select gc.flightID, gc.legID, l.arrival, l.departure
from get_current_legs gc join leg l
on gc.legID = l.legID
join flight f
on gc.flightID = f.flightID
where f.airplane_status like 'in_flight';

-- flights_on_leg_in_air
create or replace view flights_on_leg_in_air as
select distinct f.flightID, l.departure, l.arrival, g.legID, f.routeID, f.next_time, f.support_airline, f.support_tail as plane
from leg l
join route_path r on l.legID = r.legID
join flight f on f.routeID = r.routeID
join get_current_legs g on g.legID = l.legID
where f.airplane_status like 'in_flight'
and (f.flightID, g.legID) in (select flightID, legID from get_current_legs);


-- num_flights_on_leg_in_air
create or replace view num_flights_on_leg_in_air as
select legID, count(flightID) as count_flights
from flights_on_leg_in_air 
group by legID;

-- flights_on_leg_list_in_air
create or replace view flights_on_leg_list_in_air as
select legID, group_concat(flightID order by flightID asc) as flight_list
from flights_on_leg_in_air
group by legID;

-- get_plane_loc_id_in_air
create or replace view get_plane_loc_id_in_air as
select f.flightID, a.locationID as plane 
from airplane a join
flight f on (a.airlineID, a.tail_num) = (f.support_airline, f.support_tail);

-- planes_on_leg_list_in_air
create or replace view planes_on_leg_list_in_air as 
select f.legID, group_concat(p.plane order by f.flightID asc) as airplane_list
from flights_on_leg_in_air f 
join get_plane_loc_id_in_air p on f.flightID = p.flightID 
group by f.legID;


-- earliest_arrival_in_air
create or replace view earliest_arrival_in_air as
select min(f.next_time) as early_time, fl.legID
from flights_on_leg_in_air fl join flight f on f.flightID = fl.flightID
group by fl.legID;

-- latest_arrival_in_air
create or replace view latest_arrival_in_air as
select max(f.next_time) as late_time, fl.legID
from flights_on_leg_in_air fl join flight f on f.flightID = fl.flightID
group by fl.legID;


-- [14] flights_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where flights that are currently airborne are located. 
We need to display what airports these flights are departing from, what airports 
they are arriving at, the number of flights that are flying between the 
departure and arrival airport, the list of those flights (ordered by their 
flight IDs), the earliest and latest arrival times for the destinations and the 
list of planes (by their respective flight IDs) flying these flights. */
-- -----------------------------------------------------------------------------
create or replace view flights_in_the_air (departing_from, arriving_at, num_flights,
	flight_list, earliest_arrival, latest_arrival, airplane_list) as
select distinct l.departure, l.arrival, n.count_flights, fl.flight_list, e.early_time, la.late_time, p.airplane_list
from leg l
join route_path r on l.legID = r.legID
join flight f on f.routeID = r.routeID
join num_flights_on_leg_in_air n on n.legID = l.legID
join flights_on_leg_list_in_air fl on fl.legID = l.legID
join planes_on_leg_list_in_air p on p.legID = l.legID
join earliest_arrival_in_air e on e.legID = l.legID
join latest_arrival_in_air la on la.legID = l.legID
where f.airplane_status like 'in_flight';



-- get_current_legs_on_zero
-- returns leg ID for flight based on flight and progress
create or replace view get_current_legs_on_zero as 
select f.flightID, l.legID, l.distance 
from leg l join route_path r on l.legID = r.legID
join flight f on r.routeID = f.routeID
where f.progress = 0
and r.sequence = 1;

-- get_current_legs_all
create or replace view get_current_legs_all as
select * from get_current_legs union select * from get_current_legs_on_zero;


-- get_total_legs
create or replace view get_total_legs as
select fl.flightID, max(r.sequence) as max_prog from route_path r join flight fl on fl.routeID = r.routeID group by fl.flightID;

-- get_flight_location_on_ground
create or replace view get_flight_location_on_ground as
select distinct f.flightID, a.airportID, a.locationID, f.airplane_status, f.progress, r.sequence
from flight f join 
route_path r on f.routeID = r.routeID
join leg l on r.legID = l.legID
join airport a on airportID = l.departure
where f.airplane_status like 'on_ground'
and r.sequence = 1
and f.progress = 0
and f.progress < (select max_prog from get_total_legs where flightID like f.flightID)
and f.flightID not in 

(select distinct f.flightID
from flight f join 
route_path r on f.routeID = r.routeID
join leg l on r.legID = l.legID
join airport a on airportID = l.arrival
where f.airplane_status like 'on_ground'
and (r.sequence = f.progress) 
and f.progress in (select max_prog from get_total_legs where flightID like f.flightID))

union

select distinct f.flightID, a.airportID, a.locationID, f.airplane_status, f.progress, r.sequence
from flight f join 
route_path r on f.routeID = r.routeID
join leg l on r.legID = l.legID
join airport a on airportID = l.arrival
where f.airplane_status like 'on_ground'
and r.sequence = f.progress 
and f.progress < (select max_prog from get_total_legs where flightID like f.flightID)
and f.flightID not in 

(select distinct f.flightID
from flight f join 
route_path r on f.routeID = r.routeID
join leg l on r.legID = l.legID
join airport a on airportID = l.arrival
where f.airplane_status like 'on_ground'
and (r.sequence = f.progress) 
and f.progress in (select max_prog from get_total_legs where flightID like f.flightID)) 

union

select distinct f.flightID, a.airportID, a.locationID, f.airplane_status, f.progress, r.sequence
from flight f join 
route_path r on f.routeID = r.routeID
join leg l on r.legID = l.legID
join airport a on airportID = l.arrival
where f.airplane_status like 'on_ground'
and (r.sequence = f.progress) 
and f.progress in (select max_prog from get_total_legs where flightID like f.flightID);



-- count_flights_at_airport
create or replace view count_flights_at_airport as 
select airportID, count(flightID) as num_flights
from get_flight_location_on_ground
group by airportID
having airportID in (select airportID from airport);

-- get_on_ground_flight_list 
create or replace view get_on_ground_flight_list as 
select airportID, group_concat(flightID) as flights
from get_flight_location_on_ground
group by airportID
having airportID in (select airportID from airport);

-- get_time
create or replace view get_time as
select g.airportID, g.flightID, f.next_time
from get_flight_location_on_ground g
join flight f on f.flightID = g.flightID
where airportID in (select airportID from airport);

-- get_earlier_time
create or replace view get_earlier_time as 
select airportID, min(next_time) as early_time
from get_time
group by airportID;

-- get_later_time
create or replace view get_later_time as 
select airportID, max(next_time) as late_time
from get_time
group by airportID;

-- planes_at_airport
create or replace view planes_at_airport as
select g.airportID, group_concat(plane) as planes
from get_flight_location_on_ground g
join get_plane_loc_id l on g.flightID = l.flightID
group by g.airportID;


-- [15] flights_on_the_ground()
-- ------------------------------------------------------------------------------
/* This view describes where flights that are currently on the ground are 
located. We need to display what airports these flights are departing from, how 
many flights are departing from each airport, the list of flights departing from 
each airport (ordered by their flight IDs), the earliest and latest arrival time 
amongst all of these flights at each airport, and the list of planes (by their 
respective flight IDs) that are departing from each airport.*/
-- ------------------------------------------------------------------------------
create or replace view flights_on_the_ground (departing_from, num_flights,
	flight_list, earliest_arrival, latest_arrival, airplane_list) as 
select distinct l.airportID, c.num_flights, g.flights, ge.early_time, gl.late_time, p.planes
from get_flight_location_on_ground l
join flight f on l.flightID = f.flightID
join count_flights_at_airport c on l.airportID = c.airportID
join get_on_ground_flight_list g on g.airportID = c.airportID
join get_earlier_time ge on ge.airportID = l.airportID
join get_later_time gl on gl.airportID = l.airportID
join planes_at_airport p on p.airportID = l.airportID
where f.airplane_status like 'on_ground';


-- [16] people_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently airborne are located. We 
need to display what airports these people are departing from, what airports 
they are arriving at, the list of planes (by the location id) flying these 
people, the list of flights these people are on (by flight ID), the earliest 
and latest arrival times of these people, the number of these people that are 
pilots, the number of these people that are passengers, the total number of 
people on the airplane, and the list of these people by their person id. */
-- -----------------------------------------------------------------------------
create or replace view people_in_the_air (departing_from, arriving_at, num_airplanes,
	airplane_list, flight_list, earliest_arrival, latest_arrival, num_pilots,
	num_passengers, joint_pilots_passengers, person_list) as
select 
    d.departure as departing_from, 
    d.arrival as arriving_at, 
    count(distinct a.locationID) as num_airplanes, 
    group_concat(distinct a.locationID order by a.locationID asc) as airplane_list, 
    group_concat(distinct f.flightID order by f.flightID asc) as flight_list, 
    min(f.next_time) as earliest_arrival, 
    max(f.next_time) as latest_arrival, 
    sum(case when pil.personID is not null then 1 else 0 end) as num_pilots, 
    sum(case when pas.personID is not null then 1 else 0 end) as num_passengers, 
    count(distinct p.personID) as joint_pilots_passengers, 
    group_concat(distinct p.personID order by p.personID asc) as person_list
from flight f
join airplane a on f.support_airline = a.airlineID and f.support_tail = a.tail_num
join get_current_dept_and_arrival_in_air d on d.flightID = f.flightID
join person p on p.locationID = a.locationID
left join pilot pil on p.personID = pil.personID
left join passenger pas on p.personID = pas.personID
where f.airplane_status = 'in_flight'
group by d.departure, d.arrival;



-- passengers_at_airport_num
create or replace view passengers_at_airport_num as
select locationID, count(personID) as pax_count
from person 
where personID in (select personID from passenger)
group by locationID

union 

select locationID, 0
from location where locationID not in (select locationID from person 
where personID in (select personID from passenger));

-- pilots_at_airport_num
create or replace view pilots_at_airport_num as
select locationID, count(personID) as pilot_count
from person 
where personID in (select personID from pilot)
group by locationID

union 

select locationID, 0
from location where locationID not in (select locationID from person 
where personID in (select personID from pilot));

-- people_at_airport_list
create or replace view people_at_airport_list as
select locationID, group_concat(personID) as people
from person
group by locationID

union

select locationID, ''
from location where locationID not in (select locationID from person );

-- [17] people_on_the_ground()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently on the ground and in an 
airport are located. We need to display what airports these people are departing 
from by airport id, location id, and airport name, the city and state of these 
airports, the number of these people that are pilots, the number of these people 
that are passengers, the total number people at the airport, and the list of 
these people by their person id. */
-- -----------------------------------------------------------------------------
create or replace view people_on_the_ground (departing_from, airport, airport_name,
	city, state, country, num_pilots, num_passengers, joint_pilots_passengers, person_list) as
select distinct a.airportID, a.locationID, a.airport_name, a.city, a.state, a.country, pi.pilot_count, 
pa.pax_count, pa.pax_count + pi.pilot_count, ap.people
from airport a
join person p on a.locationID = p.locationID
left join passengers_at_airport_num pa on pa.locationID = a.locationID
left join pilots_at_airport_num pi on pi.locationID = a.locationID
left join people_at_airport_list ap on ap.locationID = a.locationID;



-- legs_in_order
create or replace view legs_in_order as
select routeID, group_concat(legID) as legs
from route_path
group by routeID;

-- num_legs
create or replace view num_legs as
select r.routeID, max(r.sequence) as num_legs
from route_path r
group by r.routeID;

-- airport_list
create or replace view airport_list as
select r.routeID, group_concat(l.departure, '->', l.arrival) as airport_list
from route_path r
join leg l on r.legID = l.legID
group by r.routeID;

-- route_length_2
create or replace view route_length_2 as
select distinct r.routeID, sum(l.distance) as distance
from route_path r 
join leg l on l.legID = r.legID
group by r.routeID;

-- num_flights_on_route
create or replace view num_flights_on_route as
select routeID, count(flightID) as count_flights
from flight 
group by routeID

union

select routeID, 0 as count_flights
from route 
where routeID not in
(select routeID from flight);


-- flights_on_ground
create or replace view flights_on_ground as
select routeID, group_concat(flightID) as list_flights
from flight 
group by routeID;

-- [18] route_summary()
-- -----------------------------------------------------------------------------
/* This view will give a summary of every route. This will include the routeID, 
the number of legs per route, the legs of the route in sequence, the total 
distance of the route, the number of flights on this route, the flightIDs of 
those flights by flight ID, and the sequence of airports visited by the route. */
-- -----------------------------------------------------------------------------
create or replace view route_summary (route, num_legs, leg_sequence, route_length,
	num_flights, flight_list, airport_sequence) as
select n.routeID, n.num_legs,l.legs, d.distance, nu.count_flights, f.list_flights, a.airport_list
from num_flights_on_route nu
join num_legs n on nu.routeID = n.routeID
join legs_in_order l on n.routeID = l.routeID
join route_length_2 d on d.routeID = l.routeID
left join flights_on_ground f on f.routeID = l.routeID
join airport_list a on a.routeID = l.routeID;


-- num_airports
-- displays number of airports in city, state combo 
-- helper for below view
create or replace view num_airports as
select concat(city, state) as city_state, count(airportID) as count_a from airport
group by city_state;

-- multiple_airports_num
-- displays city-state combo for places with multiple airports
create or replace view multiple_airports_num as
select city_state as location, count_a from num_airports where count_a >= 2;

-- multiple_airports
create or replace view multiple_airports as
select m.location, group_concat(a.airportID) as ids, group_concat(a.airport_name) as names_list from multiple_airports_num m
join airport a on concat(a.city, a.state) = m.location
group by m.location;



-- [19] alternative_airports()
-- -----------------------------------------------------------------------------
/* This view displays airports that share the same city and state. It should 
specify the city, state, the number of airports shared, and the lists of the 
airport codes and airport names that are shared both by airport ID. */
-- -----------------------------------------------------------------------------
create or replace view alternative_airports (city, state, country, num_airports,
	airport_code_list, airport_name_list) as
select distinct a.city, a.state, a.country, m.count_a, i.ids, i.names_list
from airport a
join multiple_airports_num m
on concat(a.city, a.state) = m.location
join multiple_airports i on
i.location = m.location;



