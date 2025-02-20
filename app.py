# app.py
from flask import Flask, request, jsonify, send_from_directory
import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials


google_creds_json = '{"type": "service_account", "project_id": "fitbit-cron", "private_key_id": "1d208cb327816a15fa29c8eca441cf9adeb504c5", "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9O33MNmGfDXBS\\nZupUeTxameOigjsJWNqtqJmr6pu6oCZFDyCnSNreBtr1IqRsQY/Gpi1jOVuMBFDj\\neMzdTZU7t0m+7AIfWgDz+5cCHGl/l+f0K3YAn+Y+W4M8/Xcz89rklggTYH4K8EAn\\ngjVzMM77EYbw4V9waA9ynJUVkr6ewvDa9FvSkqhf6lrmNm7t9uDzjR3bnRZcqwbv\\nq7SmoHRR6B4kRy2pmKbwFPG1bp0JNhwPMN1YNgYiK3hdGl4DpBs/sLI+UqpiGF9l\\nRBN45eH7PfkXntAr0VYXt2iKTqkzKQxA4TSvdqr4YXmpu2d8CP8idPva/9P6Z6kW\\nFYm6HFMfAgMBAAECggEARsPEm2WKxCwGYQpTfxuHUmpSEieZZDlyLZbrQLsPWY8i\\nQJkToPtBvd3aa+l0i3dJCQSD3KNKdOX4SdiW4/trX1V/ooInmQnTaWogYo21dh2c\\nhFbsXfdt5svaHCi9NxRuOyVQB88B051coGm1C0qpXIKFb/cX9bU0cavUpKin2D5x\\ndc/RMovJDm7CJWQOBdm7I00j2tX/EXJQSYtzyBR3FsYcnUh1oUKwrYxbTDyQPoxR\\nHwhi1tsyXm7LV4g4ZZghj5wr/hPKxvdQyWw3L10OuS/XxrPkQwTionr9FZXxsw7w\\nzVRzXi/n25ZAmw/xqYkniDs5G8X7GetqtkyzzPI9gQKBgQDnuTqzNKcXXA89Aopi\\n2pFCI5J9JGz5+CLCXunoNNcVV7HpobupWmESr+6xewPt/bxH588ZMfk3UKt0BylK\\nd3NjIA67T2bLM6KI/ECXoNhFnRvhfHMeUxMtyLYl+oLPLsJd84yjsUSUrNFj76Kk\\nXfESMHrxnbloggPLRYYFboKEMQKBgQDRDqi/R6vaRytKeC9f/xflHwc2jAyeLJz5\\nRniKWYzhAwPn2IWNppSbpMAVmqSMFRR358YGLFu2xsqpz53DY+gcR0QVfpIyt5wS\\nJrHVuNbarvR/aJNovTJAzLX5D4jshCojyn84AsyeTUD9L+AOWhrsOG9EXnWv89SW\\npDxZHfQITwKBgALTOEr9Blh7j9f/ku5XmdPDmUKbUhTOGKZj/9gL5N9mvU2K4j3T\\nU0GmEXPqewbIxCXgRp8ZA9/PxPdaKv+0axy3RFa2RhuOGpou8R6oIFrg6nkaSlEB\\nVEeHnejin/ukp0v77ygDvkFNxhPA1SvJ1WmSW71cXelPRHqS82pXiZHRAoGBAJZZ\\noZj3lavFNWg4aXHzxx6cIxbiwAxd74MDYJu3ba9B+OQb/2jxXb1WTmL7Nc4dNvxJ\\nL0yvSEJ6U7SuwTqNtpfn1RpUTha1oEQZmhon9jWOT/71mdZhAyxBTbpSptna72eQ\\nMdB5iulqjAvLC6umt+gdakBUYvVpOgIhGdnJxgDXAoGBAIxFeaouk+dlRj8lRm1+\\nk6Yp1F0/pfIOEjL2sP+O0U0l/hOXn3ijxjUSov8HFb6NUmB5ndbI6VY1kjSaRGX8\\nY6e8KHBqo3s0o6oXd1GfCF0f7lrBkLNLs59uhAwhTHQwBDzYgV+yNIJ+HrCkdK/I\\nKECt+hLAJcqjB4wQUpxTFcOy\\n-----END PRIVATE KEY-----\\n", "client_email": "fishinggame@fitbit-cron.iam.gserviceaccount.com", "client_id": "113912439661137842972", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/fishinggame%40fitbit-cron.iam.gserviceaccount.com", "universe_domain": "googleapis.com"}'

if not google_creds_json:
    raise Exception("Missing GOOGLE_CREDENTIALS_JSON environment variable.")

# Parse the JSON credentials
creds_dict = json.loads(google_creds_json)

# Create credentials using oauth2client
scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
creds_dict = json.loads(google_creds_json)
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
client = gspread.authorize(creds)

# Open your spreadsheet (replace with your sheet's name)
spreadsheet = client.open("FishingGameRes")
worksheet = spreadsheet.worksheet("TrialData")

SPREADSHEET_NAME = "FishingGameRes"
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
