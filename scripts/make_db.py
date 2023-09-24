from tools import FepFile, get_fep_ids
import glob, os, re, requests, sqlite3, subprocess, sys, yaml

# Idea:
#
# Provide a database of FEPs that can provide answers like this:
#
# List all FEPs and their topics based on the author
# SELECT DISTINCT fep FROM feps_authors WHERE email like 'silverpill%';
#
# Implementation:
#
# The FEP front matter and content is parsed from this repository
# for structured information, supplemented with discussion urls found
# on the socialhub.activitypub.rocks website, and with hand-coded data
# entered into a YAML file.
#
# TODO:
#
# Indicate "breaking" sections of AS / AP specifications.
# See "breaking" key in topics.yml file for an example.

## Support functions

## These could be added as methods of class FepFile

def author_data(fep_file):
    authors = fep_file.parsed_frontmatter["authors"]
    result = []
    for m in [re.match(r"([^<]+)<(.+)>", x.strip()) for x in authors.split(",")]:
        if m is None:
            print("No match!")
        else:
            result.append((m.group(2), m.group(1).strip(), ))
    return result

def copyright(fep_file):
    is_copyright = False
    for x in fep_file.content:
        if is_copyright:
            if x.startswith("##"):
                return None
            if x != "":
                return x
        elif x == "## Copyright":
            is_copyright = True
    return None

def fep_references(fep_file, topic_data=None):
    result = []

    # refs in yml file
    fep_id = id(fep_file)
    if topic_data and fep_id in topic_data:
        for ref in topic_data[fep_id].get("references", []):
            result.append(ref)

    # refs in FEP front matter
    ref_list = fep_file.parsed_frontmatter.get("relatedFeps")
    if ref_list:
        for ref in [x.strip().replace("FEP-", "") for x in ref_list.strip().split(",")]:
            result.append(ref)

    # refs in FEP content
    is_references = False
    for x in fep_file.content:
        if is_references:
            if x.startswith("##"):
                break
            m = re.search(r"\[FEP-([a-f0-9]{4})\]", x)
            if m:
                result.append(m.group(1))
        elif x == "## References":
            is_references = True
    return set(result)

def date_updated(fep_file):
    command = ["git", "log", "-1", '--pretty=%cs', fep_file.filename]
    updated = subprocess.run(command, stdout=subprocess.PIPE).stdout.decode('utf-8')
    return updated

def provides_feature(fep_file):
    dir = os.path.dirname(fep_file.filename)
    for file in glob.glob(os.path.join(dir, "*.feature")):
        return 1
    return 0

def provides_ld_context(fep_file):
    dir = os.path.dirname(fep_file.filename)
    for file in glob.glob(os.path.join(dir, "*.jsonld")):
        return 1
    return 0

## Parsing the topics.yml data file

def topics(fep_id, topic_data):
    result = []
    if fep_id in topic_data:
        for topic in topic_data[fep_id].get("topics", []):
            if isinstance(topic, dict):
                for k, v in topic.items():
                    if isinstance(v, list):
                        for t in v:
                            result.append((k, t, ))
                    else:
                        result.append((k, v, ))
            else:
                result.append(("general", topic, ))
    return result

def implementations(fep_id, topic_data):
    result = []
    if fep_id in topic_data:
        for imp in topic_data[fep_id].get("implementations", []):
            if isinstance(imp, dict):
                for k, v in imp.items():
                    if isinstance(v, dict):
                        result.append((k, v["url"], v.get("comment")))
                    else:
                        result.append((k, None, None))
            else:
                result.append((imp, None, None))
    return result

## From parsed activitypub.rocks FEP discussion page

def discussion_url(fep_id, discussion_urls, topic_data):
    if fep_id in discussion_urls:
        return discussion_urls[fep_id]
    if fep_id in topic_data:
        return topic_data[fep_id].get("discussion_url")
    return None

# These are the fields listed in FEP-a4ed
#
# Note: "discussionsTo" points to the repository's issue tracker
# The actual discussions are customarily on the socialhub.activitypub.rocks
# website.
def frontmatter_fields():
    return [
        "slug",
        "authors",
        "status",
        "dateReceived",
        "dateFinalized",
        "dateWithdrawn",
        "discussionsTo",
        "relatedFeps",
        "replaces",
        "replacedBy"
    ]

# Main script begins here
# Initialize db

conn = sqlite3.connect("data/feps.db")
cur = conn.cursor()

try:
    cur.execute("SELECT id FROM feps")
except sqlite3.OperationalError:
    cur.execute(
        """
        CREATE TABLE feps (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            summary TEXT,
            copyright TEXT,
            status TEXT NOT NULL,
            provides_feature INTEGER,
            provides_ld_context INTEGER,
            date_received TEXT NOT NULL,
            date_updated TEXT NOT NULL,
            date_finalized TEXT,
            date_withdrawn TEXT,
            tracking_url TEXT,
            discussion_url TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE authors (
            email TEXT PRIMARY KEY,
            display_name TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE feps_authors (
            fep TEXT NOT NULL,
            email TEXT NOT NULL,
            PRIMARY KEY(fep, email)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE feps_references (
            fep TEXT NOT NULL,
            reference TEXT NOT NULL,
            PRIMARY KEY(fep, reference)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE feps_topics (
            fep TEXT NOT NULL,
            category TEXT NOT NULL,
            topic TEXT NOT NULL,
            PRIMARY KEY(fep, category, topic)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE feps_implementations (
            fep TEXT NOT NULL,
            name TEXT NOT NULL,
            url TEXT,
            comment TEXT,
            PRIMARY KEY(fep, name)
        )
        """
    )

# Parse FEPs

fep_files = [FepFile(fep) for fep in get_fep_ids()]
fep_files = reversed(fep_files)
fep_files = sorted(fep_files, key=lambda x: x.parsed_frontmatter["dateReceived"])

# Parse the topics.yml data file

topic_file = open("data/topics.yml", "r")
topic_data = yaml.load(topic_file, Loader=yaml.SafeLoader)

# Get the socialhub.activitypub.rocks discussion URLs from the FEP tag page.

discussion_urls = {}

# Just a simple parsing of page, relies on strict format of linked discussion URLs:
# e.g: <a href='https://socialhub.activitypub.rocks/t/fep-a4ed-the-fediverse-enhancement-proposal-process/1171/21'...
pat = re.compile(r"(https\:\/\/socialhub\.activitypub\.rocks\/t\/fep-([a-f0-9]+)-[^'\"]+)")

r = requests.get('https://socialhub.activitypub.rocks/tag/fep')
body = r.content.decode('utf-8')
for m in re.finditer(pat, body):
    discussion_urls[m.group(2)] = m.group(1)

# Note: Without resorting to heavier lifting (selenium library)
# the static webpage on socialhub.activitypub.rocks will only
# return the "Latest" discussions.

# To find the missing ones, which are added manually in the topics.yml file:
#
# all_feps = set([x.fep for x in fep_files])
# found_urls = set(discussion_urls.keys())
# missing_urls = sorted(all_feps.difference(found_urls))
# print(" ".join(missing_urls))
# 0ea0 2100 2e40 400e 4adb 7888 8c3f 8fcf c118 cb76 fb2a fffd

## Loop through found FEPs and update database

for fep_file in fep_files:
    fep_id = fep_file.fep
    print(f"updating {fep_id}")

    apr_url = discussion_url(fep_id, discussion_urls, topic_data)
    if apr_url is None:
        print(f"no discussion url for {fep_id}")

    parsed = fep_file.parsed_frontmatter
    update_data = [
        fep_file.title,
        fep_file.summary.strip(),
        copyright(fep_file),
        parsed["status"],
        provides_feature(fep_file),
        provides_ld_context(fep_file),
        parsed["dateReceived"],
        date_updated(fep_file),
        parsed.get("dateFinalized"),
        parsed.get("dateWithdrawn"),
        parsed.get("discussionsTo"),
        apr_url
    ]
    upsert_data = [fep_id] + update_data + update_data

    cur.execute("""
                INSERT INTO feps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = ?,
                    summary = ?,
                    copyright = ?,
                    status = ?,
                    provides_feature = ?,
                    provides_ld_context = ?,
                    date_received = ?,
                    date_updated = ?,
                    date_finalized = ?,
                    date_withdrawn = ?,
                    tracking_url = ?,
                    discussion_url = ?
                """, upsert_data)
    conn.commit()

    cur.execute("DELETE FROM feps_authors WHERE fep = ?", (fep_id, ))
    for (email, display_name) in author_data(fep_file):
        cur.execute("INSERT INTO authors VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET display_name = ?", (email, display_name, display_name, ))
        cur.execute("INSERT INTO feps_authors VALUES (?, ?)", (fep_id, email))
    conn.commit()

    cur.execute("DELETE FROM feps_references WHERE fep = ?", (fep_id, ))
    for ref in fep_references(fep_file, topic_data):
        cur.execute("INSERT INTO feps_references VALUES (?, ?)", (fep_id, ref))
    conn.commit()

    cur.execute("DELETE FROM feps_topics WHERE fep = ?", (fep_id, ))
    for (category, topic) in topics(fep_id, topic_data):
        cur.execute("INSERT INTO feps_topics VALUES (?, ?, ?)", (fep_id, category, topic))
    conn.commit()

    cur.execute("DELETE FROM feps_implementations WHERE fep = ?", (fep_id, ))
    for (name, url, comment) in implementations(fep_id, topic_data):
        cur.execute("INSERT INTO feps_implementations VALUES (?, ?, ?, ?)", (fep_id, name, url, comment))
    conn.commit()
