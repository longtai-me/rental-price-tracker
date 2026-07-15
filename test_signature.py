import urllib.parse
import hmac
import hashlib
import base64
import requests

API_KEY = "AIzaSyAZqSGmFJ3t0pKD1x7BPVFB5eJ6Bi1Kmyo"
SECRET = "FAfZgvsLdGkNjzOnvoEmoYBzQUo="

def sign_url(input_url, secret):
    url = urllib.parse.urlparse(input_url)
    url_to_sign = url.path + "?" + url.query
    
    # Check if padding is needed for base64 decode
    secret_str = secret.replace('-', '+').replace('_', '/')
    missing_padding = len(secret_str) % 4
    if missing_padding:
        secret_str += '=' * (4 - missing_padding)
        
    try:
        decoded_key = base64.urlsafe_b64decode(secret_str)
    except Exception as e:
        print("Decode error:", e)
        return input_url
        
    signature = hmac.new(decoded_key, url_to_sign.encode(), hashlib.sha1)
    
    encoded_signature = base64.urlsafe_b64encode(signature.digest())
    original_url = url.scheme + "://" + url.netloc + url.path + "?" + url.query
    return original_url + "&signature=" + encoded_signature.decode()

url = f"https://maps.googleapis.com/maps/api/geocode/json?address=台中市西屯區福上巷&client=gme-rental"
# Wait, signature is usually used with client ID (gme-...) or API keys for some Premium APIs.
# Let's test with just key and signature.
url = f"https://maps.googleapis.com/maps/api/geocode/json?address=台中市西屯區福上巷&key={API_KEY}"
signed_url = sign_url(url, SECRET)
print(signed_url)

response = requests.get(signed_url, verify=False)
print(response.text)
