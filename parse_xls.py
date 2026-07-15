import pandas as pd
import sys

filename = sys.argv[1]
try:
    # Skip the first row which is the title
    df = pd.read_excel(filename, skiprows=1)
    print("Columns:", df.columns.tolist())
    # print first 2 rows
    for i in range(2):
        row = df.iloc[i].to_dict()
        print(f"Row {i}:", row)
except Exception as e:
    print(e)
