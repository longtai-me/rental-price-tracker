import json

with open('db_dump.json', 'r') as f:
    data = json.load(f)

print(f"Number of root elements: {len(data)}")
for i, item in enumerate(data):
    if 'results' in item:
        print(f"Element {i} 'results' count: {len(item['results'])}")
        if len(item['results']) > 0:
            print("First item sample:", list(item['results'][0].keys()))
