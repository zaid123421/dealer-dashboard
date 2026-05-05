# Tire Sets Page Implementation Plan

## Task: Display tire sets in the tire-sets page

## Information Gathered:
1. **Existing Hooks:**
   - `useDealerCustomersInfinite` - fetches customers list
   - `useCustomerVehicles` - fetches vehicles for a customer
   - `useVehicleTireSets` - fetches tire sets for a vehicle

2. **Existing Components:**
   - `TireSetHeader` - displays tire set header info
   - `TireGrid` - displays tires in grid/list view
   - `TireCard` - displays individual tire card

3. **Pattern:**
   - Similar to customers page: left (list) → right (details)

## Plan:

### 1. Update `src/app/dashboard/tire-sets/page.tsx`:
- Make it a client component ("use client")
- Implement selection flow:
  - Step 1: Select customer
  - Step 2: Select vehicle (for selected customer)
  - Step 3: Display tire sets (for selected vehicle)

### 2. Implementation Details:
- Use existing hooks and components
- Follow same UI pattern as customers page
- Use proper translations

## Status: Ready to implement
