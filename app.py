# app.py
from flask import Flask, request, jsonify, send_from_directory
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Define the scope
scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]

SPREADSHEET_NAME = "FishingGameRes"
# Authenticate using the credentials.json file
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

# Open your spreadsheet (replace with your sheet's name)
spreadsheet = client.open("FishingGameRes")
worksheet = spreadsheet.worksheet("TrialData")

# Append a row to the sheet
def append_to_sheet(sheet_name, row_data):
    try:
        # Open the spreadsheet
        sheet = client.open(SPREADSHEET_NAME).worksheet(sheet_name)
        # Append the row (gspread uses append_row)
        sheet.append_row(row_data)
        return 0  # 0 for no error
    except Exception as e:
        print("Error appending to sheet:", e)
        return 1  # Return non-zero error code

app = Flask(__name__, static_folder='static', template_folder='templates')

# Route for the home page; if you want to serve index.html as your main page:
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Example API endpoint to receive trial data (replacing InsertTrialData.php)
@app.route('/insert_trial_data', methods=['POST'])
def insert_trial_data():
    # Get data from AJAX POST (make sure your JS sends JSON or form data)
    data = request.form.to_dict()
    # You can also use request.get_json() if sending JSON payloads
    # Example expected keys: ID, TrialNum, Choice, Side, Lake, Reward, RT, Time, BlockNum
    # Now pass the data to your Google Sheets helper (see Step 4 below)
    err = append_to_sheet('TrialData', list(data.values()))
    # Return a JSON response
    return jsonify({'ErrorNo': err})

# Add more endpoints for demographics, questionnaires, etc.
# For instance:
@app.route('/insert_demog_data', methods=['POST'])
def insert_demog_data():
    data = request.form.to_dict()
    err = append_to_sheet('DemogData', list(data.values()))
    return jsonify({'ErrorNo': err})

# Similarly, create endpoints for InsertQuestData, CheckSubCode, FinishCode, etc.
@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)


if __name__ == '__main__':
    app.run(debug=True)
