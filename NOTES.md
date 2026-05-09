# 📑 Engineering Implementation Notes

## 🧠 Core Logic & Architectural Decisions

### 1. Booking Convention (Inclusive-Exclusive)
I have implemented the industry-standard "Hotel Stay" logic to ensure data accuracy:
*   **The Logic**: A room is considered occupied from the night of check-in until the night *before* check-out. 
*   **The Problem it Solves**: This prevents overlapping errors where a room appears occupied on the day a guest is leaving, which is actually when the room becomes available for the next guest.
*   **Data Integrity**: I implemented a strict filter to exclude `cancelled` bookings from both the heatmap visualization and the financial metrics.

### 2. High-Performance Data Mapping
To handle 200+ bookings without causing UI lag during month transitions:
*   **Hash Map Optimization**: Instead of nested loops (O(N × M)), I pre-process the JSON data into a Date-Keyed Hash Map (occupancyMap). This allows for O(1) lookup time when rendering each calendar cell.
*   **Strategic Memoization**: I utilized React's `useMemo` hook for all heavy calculations (Occupancy Map, Statistics, and Filtering). This ensures that calculations only run when the source data changes, keeping the frame rate stable.

### 3. Native Interaction (Zero-Library Drag)
I built the date-range selection tool using native DOM events to demonstrate deep knowledge of the Event Loop:
*   **Event Handling**: Used a combination of `onMouseDown`, `onMouseEnter`, and `onMouseUp`.
*   **Bi-directional Logic**: The system automatically calculates the range correctly even if a user drags "backward" from a later date to an earlier one.

## 📊 Business Intelligence (Open-Scope Features)

*   **Real-time Metrics**: I added a stats engine that calculates **Total Revenue**, **Occupancy Percentage**, and **Average Stay Duration** dynamically based on the currently viewed month.
*   **Global Search Sync**: The search functionality is integrated with the calendar. Searching for a guest name instantly highlights their specific stay periods in the reservation list.
*   **CSV Reporting**: I implemented a utility to export the filtered dataset into a CSV file, facilitating administrative reporting and data portability.

## 🛠️ Technical Trade-offs

*   **Monolithic State Management**: For the scope of this assignment, I maintained state in a central `App.jsx`. This guarantees 100% synchronization between the Heatmap, Search, and Stats without the overhead of Redux or Context API.
*   **Native Date API**: I purposefully avoided libraries like Moment.js to keep the bundle size minimal and prove proficiency in native JavaScript date manipulation.

 