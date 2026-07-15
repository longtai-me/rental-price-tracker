import requests

API_KEY = "AIzaSyAZqSGmFJ3t0pKD1x7BPVFB5eJ6Bi1Kmyo"
url = f"https://maps.googleapis.com/maps/api/geocode/json?address=台中市西屯區福上巷&key={API_KEY}"

response = requests.get(url, verify=False)
data = response.json()
print("Status:", data['status'])
if data['status'] == 'OK':
    print(data['results'][0]['geometry']['location'])
