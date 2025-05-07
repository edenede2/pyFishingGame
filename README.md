# PyFishingGame

A web-based fishing game experiment built with Flask, JavaScript, and Google Sheets integration for data collection.

## Overview

PyFishingGame is an interactive web experiment that simulates fishing activities. It's designed to collect user interaction data for research or educational purposes. The application presents users with surveys and interactive fishing tasks, recording their choices and behaviors in a Google Sheets database.

## Features

- Interactive fishing game interface
- Survey integration using Survey.js
- Demographic data collection
- Real-time data storage in Google Sheets
- Mobile-responsive design
- Support for various question types and experimental conditions

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript, jQuery
- **Data Storage**: Google Sheets via gspread
- **Authentication**: OAuth2 for Google API
- **Deployment**: Gunicorn (ready for Heroku deployment)

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd pyFishingGame
   ```

2. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up Google Sheets API credentials:
   - Create a service account in Google Cloud Platform
   - Generate and download JSON credentials
   - Set the credentials as an environment variable:
     ```
     export GOOGLE_CREDENTIALS_JSON='{"your":"credentials"}'
     ```
   - Share your Google Sheet with the service account email

## Running the Application

### Local Development
```
python app.py
```

### Production Deployment
The repository includes a Procfile for easy deployment to Heroku or similar platforms.

## Application Structure

- `/static/` - Contains all frontend assets
  - `FishingGame.js` - Main game logic
  - `FishingGame.css` - Styling for the game
  - `index.html` - Main HTML entry point
  - `/jsons/` - JSON configuration files for surveys
- `app.py` - Flask application with API endpoints
- `requirements.txt` - Python dependencies
- `Procfile` - Deployment configuration

## Data Collection

The application collects three types of data:
- Trial data (individual actions)
- Block data (aggregated session data)
- Demographic information

All data is securely sent to Google Sheets for analysis.

## Customization

The game behavior can be customized by modifying the JSON configuration files:
- `DemogJson.json` - Demographic survey questions
- `JsonQuest.json` - Main questionnaire
- `CompJson.json` - Completion and feedback forms