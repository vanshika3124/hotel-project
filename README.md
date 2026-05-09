# 🏨 Guestara Hotel Booking Heatmap

An interactive, high-performance occupancy visualization tool designed for hotel front-desk operations. This dashboard provides immediate insights into room availability, booking trends, and monthly performance metrics.

**Live Demo:** [https://hotelheat.netlify.app/](https://hotelheat.netlify.app/)

## 🚀 Key Features

*   **Occupancy Heatmap**: Dynamic 7-column calendar grid with color-coded density mapping based on a 10-room capacity.
*   **Drag-to-Select**: Native bi-directional range selection (Forward & Backward) across month boundaries.
*   **Live Metrics Dashboard**: Real-time calculation of Monthly Revenue, Avg Occupancy, and Avg Stay Duration.
*   **Advanced Filtering**: Instant search by Guest Name or Room Number that syncs with the calendar view.
*   **Data Portability**: Integrated CSV Export functionality for administrative reporting.
*   **Premium UI**: Custom dark-mode aesthetic designed for high-stress operational environments.

## 🛠️ Technical Stack

*   **Frontend**: React.js (Vite)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Date Logic**: Native JavaScript `Date` API (Zero external dependencies)
*   **Deployment**: Netlify

## 🏁 Installation & Setup

1. Clone the repository.
2. Install dependencies:
   npm install
3. Start the development server:
   npm run dev