from flask import Flask, request, jsonify, send_from_directory
import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials


google_creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
print(google_creds_json)
if not google_creds_json:
    raise Exception("Missing GOOGLE_CREDENTIALS_JSON environment variable.")

creds_dict = json.loads(google_creds_json)

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
client = gspread.authorize(creds)

spreadsheet = client.open("FishingGameRes")
worksheet = spreadsheet.worksheet("TrialData")

SPREADSHEET_NAME = "FishingGameRes"
def append_to_sheet(sheet_name, row_data):
    try:
        sheet = client.open(SPREADSHEET_NAME).worksheet(sheet_name)
        sheet.append_row(row_data)
        return 0 
    except Exception as e:
        print("Error appending to sheet:", e)
        return 1  

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/insert_trial_data', methods=['POST'])
def insert_trial_data():
    data = request.form.to_dict()
    err = append_to_sheet('TrialData', list(data.values()))
    return jsonify({'ErrorNo': err})


@app.route('/insert_block_data', methods=['POST'])
def insert_block_data():
    data = request.form.to_dict()
    err = append_to_sheet('BlockData', list(data.values()))
    return jsonify({'ErrorNo': err})

@app.route('/insert_demog_data', methods=['POST'])
def insert_demog_data():
    data = request.form.to_dict()
    err = append_to_sheet('DemogData', list(data.values()))
    return jsonify({'ErrorNo': err})

@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)


if __name__ == '__main__':
    app.run(debug=True)
