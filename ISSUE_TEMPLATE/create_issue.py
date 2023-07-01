from argparse import ArgumentParser
from datetime import date, timedelta
from tools import FepFile


import json
import requests

parser = ArgumentParser("Create tracking issue for FEP")
parser.add_argument("fep", help="slug of the FEP")
args = parser.parse_args()

fep_file = FepFile(args.fep)

fep_file.write()

if "discussionsTo" in fep_file.parsed_frontmatter:
    print("File already has discussionsTo")
    exit(1)

title = f"[TRACKING] FEP-{args.fep}: {fep_file.title}"

date_received = date.fromisoformat(fep_file.parsed_frontmatter["dateReceived"])

date1 = date_received.isoformat()
date2 = (date_received + timedelta(days=365)).isoformat()

body = f"""
The proposal has been received. Thank you!

This issue tracks discussions and updates to the proposal during the `DRAFT` period.

Please post links to relevant discussions as comment to this issue.

`dateReceived`: {date1}

If no further actions are taken, the proposal may be set by editors to `WITHDRAWN` on {date2} (in 1 year).
"""

with open("config.json") as f:
    config = json.loads(f)

response = requests.post(
    f"https://codeberg.org/api/v1/repos/{config['owner']}/{config['repo']}/issues",
    data={"title": title, "body": body},
    headers={"authorization": f"Bearer {config['token']}"},
)

issue_url = response.json()["url"]

fep_file.frontmatter.append(f"discussionsTo: {issue_url}")
fep_file.write()
