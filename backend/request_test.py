import requests
import json

response=requests.get('http://172.17.69.228:9006/Afiches-IA/predict')

if response.status_code == 200:
    try:
        # Call the .json() method to parse the JSON content
        predictions = response.json()
        
        print("\n--- JSON Response Data ---")
        # For pretty printing the JSON
        print(json.dumps(predictions, indent=2))
        print("--------------------------\n")
        
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from response.")
        print("Raw response content:")
        print(response.text)
else:
    print(f"Request failed with status code: {response.status_code}")
    print(f"Response text: {response.text}")