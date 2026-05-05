# Requirements Document: tire-details-view

## Introduction

The tire-details-view feature provides users with a dedicated page to view comprehensive information about individual tires within a tire set. Users can navigate to this page from the vehicle details page by clicking an eye icon in the Tire Sets table. The page fetches tire set and tire data from the backend API and displays them in an organized, user-friendly interface with support for viewing detailed specifications for each tire.

## Glossary

- **Tire Set**: A collection of tires associated with a vehicle, typically containing 4 tires
- **Tire Details Page**: The dedicated page displaying comprehensive tire information for a specific tire set
- **Wheel Position**: The location of a tire on the vehicle (FL: Front Left, FR: Front Right, RL: Rear Left, RR: Rear Right)
- **Tread Condition**: The percentage or descriptive measure of tire tread depth remaining
- **Tire Status**: The health status of a tire (GOOD, FAIR, POOR, CRITICAL)
- **Season Type**: The seasonal classification of tires (SUMMER, WINTER, ALL_SEASON)
- **API**: The backend application programming interface providing tire set and tire data
- **Bearer Token**: The authentication token used to authorize API requests
- **Tire Set ID**: The unique identifier for a specific tire set
- **Vehicle ID**: The unique identifier for a specific vehicle
- **Customer ID**: The unique identifier for a specific customer

## Requirements

### Requirement 1: Navigate to Tire Details Page

**User Story:** As a user, I want to navigate to a tire details page by clicking an eye icon in the Tire Sets table, so that I can view comprehensive information about a specific tire set.

#### Acceptance Criteria

1. WHEN a user clicks the eye icon in a Tire Sets table row THEN the system SHALL navigate to the tire details page with the URL pattern `/dashboard/customers/{customerId}/vehicles/{vehicleId}/tire-sets/{tireSetId}`
2. WHEN the tire details page loads THEN the system SHALL extract the customerId, vehicleId, and tireSetId from the URL parameters
3. WHEN the tire details page is accessed with invalid URL parameters THEN the system SHALL display an error message and provide a back navigation button

### Requirement 2: Fetch Tire Set Details from API

**User Story:** As a system, I want to fetch tire set and tire details from the backend API, so that I can display accurate and current tire information to the user.

#### Acceptance Criteria

1. WHEN the tire details page loads with valid parameters THEN the system SHALL make a GET request to `/api/v1/dealerCustomers/{customerId}/vehicles/{vehicleId}/tire-sets` with a valid bearer token
2. WHEN the API request succeeds with status 200 THEN the system SHALL parse the response and extract the tire set matching the requested tireSetId
3. WHEN the API request fails with status 401 THEN the system SHALL display an authentication error message and redirect the user to the login page
4. WHEN the API request fails with status 403 THEN the system SHALL display an authorization error message indicating the user lacks permission to view this data
5. WHEN the API request fails with status 404 THEN the system SHALL display a not found error message indicating the tire set does not exist
6. WHEN the API request fails with a network error THEN the system SHALL display a connection error message with a retry button

### Requirement 3: Display Tire Set Header Information

**User Story:** As a user, I want to see tire set summary information at the top of the page, so that I can quickly understand which tire set I am viewing.

#### Acceptance Criteria

1. WHEN the tire set data is successfully loaded THEN the system SHALL display the tire set header containing brand, size, season type, tire count, and creation date
2. WHEN the tire set header is displayed THEN the system SHALL show the season type as a badge with appropriate styling (SUMMER, WINTER, ALL_SEASON)
3. WHEN the tire set header is displayed THEN the system SHALL include a back navigation button that returns the user to the vehicle details page
4. WHEN the user clicks the back button THEN the system SHALL navigate back to the vehicle details page

### Requirement 4: Display Individual Tires in Grid or List Format

**User Story:** As a user, I want to view individual tires in a grid or list layout, so that I can see all tires in the set at a glance.

#### Acceptance Criteria

1. WHEN tire data is successfully loaded THEN the system SHALL display all tires in a grid or list format with key information (position, brand, model, size, status)
2. WHEN displaying tires THEN the system SHALL show the wheel position (FL, FR, RL, RR) for each tire
3. WHEN displaying tires THEN the system SHALL show the tire status (GOOD, FAIR, POOR, CRITICAL) with color-coded badges (green for GOOD, yellow for FAIR, orange for POOR, red for CRITICAL)
4. WHEN displaying tires THEN the system SHALL show the tire brand and model name
5. WHEN displaying tires THEN the system SHALL show the tire size in the format "treadWidth/aspectRatioConstructionDiameter" (e.g., "225/45R17")

### Requirement 5: Display Tire Details Modal or Drawer

**User Story:** As a user, I want to click on a tire to view its complete specifications, so that I can access detailed information about that specific tire.

#### Acceptance Criteria

1. WHEN a user clicks on a tire card THEN the system SHALL open a modal or drawer displaying comprehensive tire specifications
2. WHEN the tire details modal is open THEN the system SHALL display all tire properties including tread condition, mileage, tread width, aspect ratio, construction, diameter, composition, and description
3. WHEN the tire details modal is open THEN the system SHALL display the tire's scan metadata if available
4. WHEN the tire details modal is open THEN the system SHALL display the tire's version number and update history
5. WHEN the user closes the modal or drawer THEN the system SHALL return to the tire grid/list view

### Requirement 6: Validate Tire Set Data Completeness

**User Story:** As a system, I want to validate that tire set data is complete and consistent, so that I can ensure data integrity.

#### Acceptance Criteria

1. WHEN tire set data is fetched THEN the system SHALL verify that the tire count matches the actual number of tires returned
2. WHEN tire data is fetched THEN the system SHALL verify that all tires have unique wheel positions (no duplicate positions in the same set)
3. WHEN tire data is fetched THEN the system SHALL verify that all tires belong to the requested tire set (tireSetId matches)
4. WHEN tire data is fetched THEN the system SHALL verify that all tires have valid status values (GOOD, FAIR, POOR, or CRITICAL)
5. WHEN tire data is invalid or incomplete THEN the system SHALL display an error message and provide a back navigation button

### Requirement 7: Handle Loading States

**User Story:** As a user, I want to see loading indicators while data is being fetched, so that I understand the page is working.

#### Acceptance Criteria

1. WHEN the tire details page is loading THEN the system SHALL display a loading spinner or skeleton screen
2. WHEN the tire details page is loading THEN the system SHALL prevent user interaction with the page content
3. WHEN the data finishes loading THEN the system SHALL remove the loading indicator and display the tire details

### Requirement 8: Format Tire Size Display

**User Story:** As a system, I want to format tire size information consistently, so that tire sizes are displayed in a standard, readable format.

#### Acceptance Criteria

1. WHEN displaying a tire size THEN the system SHALL combine treadWidth, aspectRatio, construction, and diameter into a single formatted string
2. WHEN formatting tire size THEN the system SHALL use the format "treadWidth/aspectRatioConstructionDiameter" (e.g., "225/45R17")
3. WHEN tire size components are missing or invalid THEN the system SHALL display the available components or a placeholder

### Requirement 9: Authenticate API Requests

**User Story:** As a system, I want to authenticate all API requests with a valid bearer token, so that only authorized users can access tire data.

#### Acceptance Criteria

1. WHEN making an API request to fetch tire details THEN the system SHALL include a valid bearer token in the Authorization header
2. WHEN the bearer token is invalid or expired THEN the system SHALL display an authentication error and redirect to the login page
3. WHEN the user is not authenticated THEN the system SHALL prevent access to the tire details page and redirect to the login page

### Requirement 10: Display Tire Mileage and Tread Condition

**User Story:** As a user, I want to see the mileage and tread condition for each tire, so that I can assess tire wear and condition.

#### Acceptance Criteria

1. WHEN displaying a tire in the grid or list THEN the system SHALL show the tire's mileage in kilometers
2. WHEN displaying a tire in the grid or list THEN the system SHALL show the tire's tread condition as a percentage or descriptive value
3. WHEN displaying tire details in the modal THEN the system SHALL show the complete tread condition information
4. WHEN displaying tire details in the modal THEN the system SHALL show the complete mileage information

### Requirement 11: Display Tire Metadata

**User Story:** As a user, I want to see additional tire metadata such as brand, model, and description, so that I have complete information about each tire.

#### Acceptance Criteria

1. WHEN displaying a tire THEN the system SHALL show the tire brand name
2. WHEN displaying a tire THEN the system SHALL show the tire model name
3. WHEN displaying a tire in the modal THEN the system SHALL show the tire description if available
4. WHEN displaying a tire in the modal THEN the system SHALL show the tire's unique identifier (tireUniqueId)
5. WHEN displaying a tire in the modal THEN the system SHALL show the tire's type, composition, and other technical specifications

### Requirement 12: Display Tire Dates

**User Story:** As a user, I want to see when tires were added and last updated, so that I can track tire history.

#### Acceptance Criteria

1. WHEN displaying a tire in the modal THEN the system SHALL show the date the tire was added to the system
2. WHEN displaying a tire in the modal THEN the system SHALL show the date the tire was last updated
3. WHEN displaying a tire in the modal THEN the system SHALL show the tire creation timestamp
4. WHEN displaying a tire in the modal THEN the system SHALL show the tire update timestamp

### Requirement 13: Validate URL Parameters

**User Story:** As a system, I want to validate all URL parameters before making API requests, so that I can prevent invalid requests and provide clear error messages.

#### Acceptance Criteria

1. WHEN the tire details page loads THEN the system SHALL validate that customerId is a non-empty string
2. WHEN the tire details page loads THEN the system SHALL validate that vehicleId is a non-empty string
3. WHEN the tire details page loads THEN the system SHALL validate that tireSetId is a non-empty string
4. WHEN any URL parameter is invalid or missing THEN the system SHALL display an error message and provide a back navigation button

### Requirement 14: Handle Empty Tire Set

**User Story:** As a system, I want to handle the case where a tire set has no tires, so that I can provide appropriate feedback to the user.

#### Acceptance Criteria

1. WHEN a tire set is fetched but contains no tires THEN the system SHALL display an error message indicating "No tires found for this set"
2. WHEN a tire set contains no tires THEN the system SHALL provide a back navigation button to return to the vehicle details page

### Requirement 15: Display Tire Set Creation Date

**User Story:** As a user, I want to see when a tire set was created, so that I can track tire set history.

#### Acceptance Criteria

1. WHEN the tire set header is displayed THEN the system SHALL show the tire set creation date in a readable format
2. WHEN displaying the creation date THEN the system SHALL format the date consistently with other dates in the application

