# Implementation Plan: tire-details-view

## Overview

This implementation plan breaks down the tire-details-view feature into discrete, incremental coding tasks. The feature adds a dedicated page for viewing comprehensive tire information, accessible from the vehicle details page. Each task builds on previous steps, starting with project structure and core interfaces, then implementing data fetching, UI components, and validation logic.

## Tasks

- [ ] 1. Set up project structure and core interfaces
  - Create the tire details page directory structure at `src/app/dashboard/customers/[customerId]/vehicles/[vehicleId]/tire-sets/[tireSetId]/`
  - Define TypeScript interfaces for `TireSetDetail` and `TireDetail` models
  - Create types file at `src/modules/tire-sets/types.ts`
  - Set up testing framework and test utilities
  - _Requirements: 1.1, 1.2, 13.1, 13.2, 13.3_

- [ ] 2. Implement URL parameter validation and extraction
  - [ ] 2.1 Create URL parameter validation utility
    - Write validation function to check customerId, vehicleId, and tireSetId are non-empty strings
    - Implement error handling for invalid or missing parameters
    - _Requirements: 1.2, 13.1, 13.2, 13.3_
  
  - [ ]* 2.2 Write property test for URL parameter extraction
    - **Property 6: URL Parameter Extraction**
    - **Validates: Requirements 1.2, 13.1, 13.2, 13.3**

- [ ] 3. Implement API service for fetching tire set details
  - [ ] 3.1 Create tire set service with API integration
    - Write `getTireSetDetailsService()` function to fetch tire set and tire data from API
    - Implement bearer token authentication in request headers
    - Handle HTTP status codes (200, 401, 403, 404, network errors)
    - Parse and return tire set and tires array
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.2_
  
  - [ ]* 3.2 Write property test for tire set retrieval correctness
    - **Property 1: Tire Set Retrieval Correctness**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 3.3 Write property test for data consistency
    - **Property 5: Data Consistency**
    - **Validates: Requirements 2.2, 6.3**

- [ ] 4. Implement data validation and schema parsing
  - [ ] 4.1 Create validation schemas for tire set and tire data
    - Define Zod schemas to validate tire set structure and tire array
    - Implement validation for tire count, status values, and wheel positions
    - Create error messages for validation failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 4.2 Write property test for tire set completeness
    - **Property 2: Tire Set Completeness**
    - **Validates: Requirements 6.1**
  
  - [ ]* 4.3 Write property test for tire position uniqueness
    - **Property 3: Tire Position Uniqueness**
    - **Validates: Requirements 6.2**
  
  - [ ]* 4.4 Write property test for status validity
    - **Property 4: Status Validity**
    - **Validates: Requirements 4.3, 6.4**

- [ ] 5. Implement custom hook for tire details data fetching
  - [ ] 5.1 Create `useTireSetDetails()` hook
    - Implement hook to fetch tire set and tire data using the service
    - Handle loading, error, and success states
    - Manage authentication errors and redirect to login
    - Implement error handling for 401, 403, 404, and network errors
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 9.2, 9.3_
  
  - [ ]* 5.2 Write unit tests for hook error handling
    - Test 401 authentication error handling
    - Test 403 authorization error handling
    - Test 404 not found error handling
    - Test network error handling
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [ ] 6. Implement tire size formatting utility
  - [ ] 6.1 Create tire size formatting function
    - Write `formatTireSize()` function to combine treadWidth, aspectRatio, construction, and diameter
    - Format output as "treadWidth/aspectRatioConstructionDiameter" (e.g., "225/45R17")
    - Handle missing or invalid components gracefully
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 6.2 Write property test for tire size formatting
    - **Property 7: Tire Size Formatting**
    - **Validates: Requirements 4.5, 8.1, 8.2**

- [ ] 7. Implement Tire Set Header component
  - [ ] 7.1 Create TireSetHeader component
    - Display tire set brand, size, season type, tire count, and creation date
    - Show season type as a badge with appropriate styling (SUMMER, WINTER, ALL_SEASON)
    - Include back navigation button that returns to vehicle details page
    - Format creation date in readable format
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 15.1, 15.2_
  
  - [ ]* 7.2 Write unit tests for TireSetHeader component
    - Test rendering of all tire set information
    - Test season type badge styling
    - Test back button navigation
    - Test date formatting
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 15.1, 15.2_

- [ ] 8. Implement Tire Card component
  - [ ] 8.1 Create TireCard component for grid/list display
    - Display wheel position (FL, FR, RL, RR)
    - Display tire brand and model name
    - Display tire size in formatted string
    - Display tire status with color-coded badge (green for GOOD, yellow for FAIR, orange for POOR, red for CRITICAL)
    - Display mileage in kilometers
    - Display tread condition as percentage or descriptive value
    - Implement click handler for tire selection
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2, 11.1, 11.2_
  
  - [ ]* 8.2 Write unit tests for TireCard component
    - Test rendering of all tire information
    - Test status badge color coding
    - Test tire selection click handler
    - Test mileage and tread condition display
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2_

- [ ] 9. Implement Tire Grid/List component
  - [ ] 9.1 Create TireGrid component
    - Render all tires in grid or list format
    - Use TireCard component for each tire
    - Pass tire selection handler to TireCard
    - Handle empty tire set case with appropriate message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 14.1, 14.2_
  
  - [ ]* 9.2 Write unit tests for TireGrid component
    - Test rendering of multiple tires
    - Test empty tire set message
    - Test tire selection propagation
    - _Requirements: 4.1, 14.1, 14.2_

- [ ] 10. Implement Tire Details Modal/Drawer component
  - [ ] 10.1 Create TireDetailsModal component
    - Display comprehensive tire specifications (tread condition, mileage, tread width, aspect ratio, construction, diameter, composition, description)
    - Display tire scan metadata if available
    - Display tire version number and update history
    - Display tire dates (added date, updated date, created at, updated at)
    - Display tire unique identifier and technical specifications
    - Implement close handler to return to tire grid view
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.3, 10.4, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 10.2 Write unit tests for TireDetailsModal component
    - Test rendering of all tire specifications
    - Test scan metadata display
    - Test version and update history display
    - Test date formatting
    - Test close button functionality
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 10.3, 10.4, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4_

- [ ] 11. Implement Tire Details Page component
  - [ ] 11.1 Create main tire details page component
    - Extract customerId, vehicleId, and tireSetId from URL parameters
    - Validate URL parameters before making API requests
    - Use `useTireSetDetails()` hook to fetch tire data
    - Display loading spinner while data is loading
    - Display error message with back button if data fetch fails
    - Render TireSetHeader, TireGrid, and TireDetailsModal components
    - Manage tire selection state for modal display
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 13.1, 13.2, 13.3, 13.4, 14.1, 14.2_
  
  - [ ]* 11.2 Write unit tests for tire details page
    - Test URL parameter extraction and validation
    - Test loading state display
    - Test error state display with back button
    - Test successful data display
    - Test tire selection and modal opening
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 13.1, 13.2, 13.3, 13.4_

- [ ] 12. Implement tire information completeness validation
  - [ ] 12.1 Create validation for tire grid/list display completeness
    - Verify all required tire information is present before rendering
    - Implement fallback values for missing optional fields
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 12.2 Write property test for tire information completeness
    - **Property 8: Tire Information Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.4, 10.1, 10.2, 11.1, 11.2**
  
  - [ ]* 12.3 Write property test for tire modal information completeness
    - **Property 9: Tire Modal Information Completeness**
    - **Validates: Requirements 5.2, 5.3, 5.4, 10.3, 10.4, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4**
  
  - [ ]* 12.4 Write property test for tire set header information completeness
    - **Property 10: Tire Set Header Information Completeness**
    - **Validates: Requirements 3.1, 3.2, 15.1, 15.2**

- [ ] 13. Implement bearer token authentication validation
  - [ ] 13.1 Create authentication header utility
    - Implement function to include bearer token in API request headers
    - Verify token is valid before making requests
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 13.2 Write property test for bearer token inclusion
    - **Property 11: Bearer Token Inclusion**
    - **Validates: Requirements 2.1, 9.1**

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all unit tests and property tests pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [ ] 15. Integration testing and end-to-end flow
  - [ ] 15.1 Write integration tests for complete flow
    - Test navigation from vehicle details to tire details page
    - Test tire set data fetching and display
    - Test tire selection and modal opening
    - Test back navigation to vehicle details
    - Test error handling for all error scenarios
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 14.1, 14.2_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all integration tests pass
  - Verify all requirements are covered by implementation
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows and component interactions
- All code should follow TypeScript best practices and the project's existing code style
- Use the existing API client from `src/lib/api.ts` for HTTP requests
- Leverage existing UI components from `src/components/ui/` where applicable
