# TransitOps System Sequence Diagram

## Purpose

This document presents the system sequence diagram representing the end-to-end execution of creating and dispatching a transport trip. It illustrates the primary runtime interaction of TransitOps, tracing the request from the initial user action through the backend modules, database persistence, and external email notification.

The sequence demonstrates how the system enforces strict business rules across different modules—specifically validating vehicle and driver availability before allowing a trip to be dispatched and subsequently notifying the relevant stakeholders.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor FM as Fleet Manager
    participant FE as Frontend Application
    participant BE as FastAPI Backend
    participant Auth as User Authentication
    participant Trip as Trip Lifecycle Management
    participant Veh as Vehicle Registry
    participant Drv as Driver Management
    participant Route as Route Optimization
    participant DB as PostgreSQL
    participant Email as Brevo Email Service

    FM->>FE: Logs in
    activate FE
    FE->>BE: Submit credentials
    activate BE
    BE->>Auth: Validate credentials
    activate Auth
    Auth->>DB: Query user record
    activate DB
    
    alt Database error
        DB-->>Auth: Connection failed
        Auth-->>BE: System error
        BE-->>FE: 500 Internal Error
    else Query successful
        DB-->>Auth: User record returned
    end
    deactivate DB
    
    alt Authentication failure
        Auth-->>BE: Invalid credentials
        BE-->>FE: 401 Unauthorized
        FE-->>FM: Display login error
    else Authentication success
        Auth-->>BE: JWT token returned
        deactivate Auth
        BE-->>FE: Authentication success
    end
    deactivate BE
    
    FM->>FE: Creates and dispatches trip
    FE->>BE: Submit trip request
    activate BE
    BE->>Trip: Process trip dispatch
    activate Trip
    
    Trip->>Veh: Check vehicle availability
    activate Veh
    Veh->>DB: Query vehicle status
    activate DB
    DB-->>Veh: Status returned
    deactivate DB
    
    alt Vehicle unavailable
        Veh-->>Trip: Vehicle not available
        Trip-->>BE: Validation failed
        BE-->>FE: 409 Conflict
        FE-->>FM: Display vehicle error
    else Vehicle available
        Veh-->>Trip: Availability validation
        deactivate Veh
        
        Trip->>Drv: Check driver availability
        activate Drv
        Drv->>DB: Query driver status
        activate DB
        DB-->>Drv: Status returned
        deactivate DB
        
        alt Driver unavailable
            Drv-->>Trip: Driver not eligible
            Trip-->>BE: Validation failed
            BE-->>FE: 409 Conflict
            FE-->>FM: Display driver error
        else Driver available
            Drv-->>Trip: Availability validation
            deactivate Drv
            
            Trip->>Route: Request route details
            activate Route
            alt Route suggestion unavailable (trip still continues)
                Route-->>Trip: No known route
            else Route suggestion successful
                Route-->>Trip: Route suggestion
            end
            deactivate Route
            
            Trip->>DB: Persist trip record
            activate DB
            DB-->>Trip: Database save
            
            Trip->>DB: Update status to "Dispatched"
            DB-->>Trip: Database save
            deactivate DB
            
            Trip->>Email: Trigger dispatch confirmation
            activate Email
            Email-->>Trip: Email notification
            deactivate Email
            
            Trip-->>BE: Process completed
            deactivate Trip
            
            BE-->>FE: HTTP success response
            deactivate BE
            
            FE-->>FM: Display confirmation
        end
    end
    deactivate FE
```

## Sequence Explanation

1. The Fleet Manager initiates the process by logging into the Frontend Application.
2. The FastAPI Backend routes the request to the User Authentication module, which queries PostgreSQL to verify the credentials.
3. Upon successful authentication, a JWT token is returned to the Frontend Application, granting access to the system.
4. The Fleet Manager submits the trip details to create and dispatch a new trip.
5. The Trip Lifecycle Management module orchestrates the validation process.
6. The Vehicle Registry is called to query PostgreSQL and confirm the selected vehicle is available for operation.
7. The Driver Management module is called to query PostgreSQL and confirm the selected driver is available and holds a valid license.
8. The Route Optimization module processes the source and destination to provide an optimized route suggestion, though the trip proceeds even if a route is not found.
9. With all business rules satisfied, Trip Lifecycle Management persists the new trip data into PostgreSQL.
10. The trip status is updated to "Dispatched" in the database, locking the vehicle and driver from other assignments.
11. The Brevo Email Service is invoked to send a dispatch confirmation to the required stakeholders.
12. The FastAPI Backend returns a successful HTTP success response to the Frontend Application, which then displays a success confirmation to the Fleet Manager.

## Business Rules

- Only authenticated users may dispatch trips.
- Only available vehicles may be assigned.
- Only available drivers may be assigned.
- Route suggestions are optional.
- Successful dispatch updates operational records.

## Key Takeaways

- The architecture correctly isolates domain logic while allowing cross-module orchestration through the Trip Lifecycle Management module.
- Strict availability validation prevents double-booking of physical assets.
- External dependencies, such as the Brevo Email Service and Route Optimization, are handled gracefully to prevent third-party failures from halting core business operations.
- Security is enforced at the entry point via the User Authentication module issuing JWT tokens.
- PostgreSQL acts as the single source of truth for all state transitions, utilizing transactional integrity to maintain operational consistency.
