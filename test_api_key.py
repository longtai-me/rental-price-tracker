import requests
import sys

API_KEY = "AIzaSyAnrQt0LTUggmOxxjU6x_kDEPsMYdi7Q6Q"
url = f"https://maps.googleapis.com/maps/api/geocode/json?address=台中市西屯區福上巷&key={API_KEY}"

response = requests.get(url, verify=False)
data = response.json()
print("Status:", data['status'])
if data['status'] != 'OK':
    print(data)
