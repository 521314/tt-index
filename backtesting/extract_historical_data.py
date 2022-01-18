"""This script extracts the historical data of all listed projects using the
Token Terminal API, calculates the sales-to-price ratio, and saves the data in
`historical_data.csv`."""

import os

import numpy as np
import pandas as pd
from dotenv import load_dotenv

from api_wrapper import ApiWrapper

load_dotenv()

tt = ApiWrapper(os.getenv("TT_API_KEY"))

all_projects_summary = tt.get_all_projects()
project_ids = [i["project_id"] for i in all_projects_summary]

data = {}
for i, project_id in enumerate(project_ids):
    print(f"{i + 1}/{len(project_ids)} ({project_id})")
    resp = tt.get_historical_data(project_id)
    for obj in resp:
        obj["project_id"] = project_id
    data[project_id] = resp
df = pd.concat([pd.DataFrame(data[i]) for i in project_ids])

df["datetime"] = df["datetime"].str.slice(0, 10)  # Only keep the date

df.loc[df["pe"] <= 0, "pe"] = np.nan
df.loc[df["pe_circulating"] <= 0, "pe_circulating"] = np.nan
df.loc[df["ps"] <= 0, "ps"] = np.nan
df.loc[df["ps_circulating"] <= 0, "ps_circulating"] = np.nan

df["sp"] = 1 / df["ps"].astype(np.longdouble)
df["sp_circulating"] = 1 / df["ps_circulating"].astype(np.longdouble)

df.to_csv("historical_data.csv")
