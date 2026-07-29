# Voyage - AI Trip Planner

Voyage is an AI-powered trip planning application that converts a natural language travel request into a structured, interactive day-by-day itinerary.

The goal of the project was not just to display an AI response, but to turn the generated data into a useful interface. Users can modify their itinerary by editing, replacing, removing, and reordering activities, and can save journeys for later use.

## Features

- Generate a complete trip itinerary from a free-form text prompt
- Day-by-day itinerary with time, location, duration and estimated cost
- Edit individual activities
- Replace an activity with a new AI-generated suggestion
- Remove activities from the itinerary
- Drag and reorder activities
- Save and reload journeys
- Light and dark themes
- Responsive layout
- Loading and error states
- Handles invalid or incomplete AI responses
- Prevents older AI requests from overwriting newer results

## Tech Stack

**Frontend**
- React 19
- Vite
- JavaScript
- CSS
- Lucide React

**Backend**
- Node.js
- Express

**AI**
- Google Gemini API (`gemini-2.5-flash`)

## How It Works

The user describes a trip in natural language, for example:

```text
Plan a 4-day trip to Hyderabad for 3 friends with a budget of ₹20,000 per person.
We love local food, history, cafés and photography.
```

The frontend sends the request to the Express backend.

The backend sends a structured prompt to Gemini and requests a JSON response containing the trip information, days and activities.

The response is parsed and normalized before being returned to the frontend. React then renders the data as interactive itinerary components instead of displaying the raw AI response.

## Project Structure

```text
Voyage-AI-Trip-Planner/
├── server/
│   └── server.js
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── DayCard.jsx
│   │   ├── Itinerary.jsx
│   │   ├── StopCard.jsx
│   │   └── TripForm.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/SumanthVH/Voyage-AI-Trip-Planner.git
cd Voyage-AI-Trip-Planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Gemini API key

Create a `.env` file in the project root.

You can use `.env.example` as a reference:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Do not commit the `.env` file or your actual API key.

### 4. Start the application

```bash
npm start
```

This starts both the React frontend and Express backend.

The frontend will normally be available at:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## AI Response Handling

One of the main challenges in this project was handling AI output reliably.

Gemini is instructed to return structured JSON rather than normal conversational text. On the backend, the response is cleaned, parsed and normalized before being sent to the frontend.

The application also handles cases such as:

- malformed or invalid JSON
- missing itinerary fields
- empty AI responses
- API rate limits
- temporary Gemini service failures
- API configuration errors
- network failures

Default values are added where appropriate so that incomplete fields do not cause the UI to crash.

The frontend also cancels an older generation request when a new one is started. This prevents a slower, older response from replacing the user's latest itinerary.

## Itinerary Interaction

After an itinerary is generated, it is stored as React state rather than treated as static AI output.

Users can:

- edit an activity
- remove an activity
- ask the AI to replace an activity
- drag activities to reorder them
- save the complete journey

Saved journeys and the selected theme are stored using browser localStorage.

## API Key Security

The Gemini API is called from the Express backend instead of directly from React.

The API key is stored in an environment variable and is not exposed in the frontend source code.

The `.env` file is excluded through `.gitignore`.

## AI Tools Used During Development

I used AI tools during development for implementation suggestions, debugging, prompt refinement and UI feedback.



## Known Limitations

- Generated recommendations depend on the accuracy and availability of the Gemini model.
- Estimated prices and travel information may not always reflect real-time conditions.
- Saved journeys currently use browser localStorage and are therefore limited to the user's current browser.
- There is no user authentication or cloud synchronization.
- The application does not currently use live maps, traffic, hotel, flight or weather APIs.

## What I Would Improve Next

Given more development time, I would add:

- Google Maps integration for locations and routes
- live travel-time calculations between activities
- weather information
- cloud-based saved journeys
- shareable itinerary links
- calendar export
- more detailed accessibility and keyboard navigation
- automated tests for AI response validation and itinerary interactions

## Time Spent

Approximately 8 hours of development time.

