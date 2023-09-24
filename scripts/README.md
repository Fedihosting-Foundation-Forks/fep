# tools for fep editors

Please follow the steps in configuration before following "Merge a FEP".

## Merge a FEP

Merge the Pull Request in [https://codeberg.org/fediverse/fep/pulls](https://codeberg.org/fediverse/fep/pulls)
and note the slug.

```bash
python scripts/create_issue.py $SLUG
```

creates the tracking issue and updates the FEP with the information.
Then run

```bash
python scripts/create_readme.py
```

to update the table in `README.md`. You are now ready to commit the
changes to the FEP (added `discussionsTo` to frontmatter) and README.md,
added the new FEP.

Run

```bash
python scripts/create_topic.py $SLUG
```

and following the instructions to create a topic on SocialHub to discuss
the FEP.

Finally, add the link to the SocialHub topic to the tracking issue, created above.

## Configuration

Add a file `config.json` to the directory `scripts` with content

```json
{
  "repo": "fep",
  "owner": "fediverse",
  "token": "CODEBERG_API_TOKEN"
}
```

The API token can be obtained by visiting [https://codeberg.org/user/settings/applications](https://codeberg.org/user/settings/applications) and generating one with scope `write:issue`.

## Setup for running pytest

Ensure dependencies (use a virtualenv)

```bash
pip install pytest
```

Check validity

```bash
pytest
```

## Create a sqlite3 database of FEP information

The "data" directory of this repository contains a YAML file with 
annotations such as the topics, types, properties and activities 
used by each FEP, as well as additional data humanly scanned from the 
FEP. If this data becomes universally useful, perhaps it could be 
moved into an expanded list of new FEP front matter fields in 
a future revision to FEP-a4ed.

The "make_db.py" script merges this data with data from the front 
matter and markdown content of each FEP, as well as with forum 
discussion URLs scraped from the https://socialhub.activitypub.rocks/tag/fep 
forum index page, to create or update a small sqlite3 database file, 
located at "data/feps.db".

The database has six tables:

- feps - basic summary information for each FEP
- authors - email and display name for every author listed in an FEP
- feps_authors - one-to-many join on feps to authors
- feps_references - fep IDs mentioned in each FEP
- feps_topics - categorized topics for each FEP
- feps_implementations - implementations (software name, URL and comment) for each FEP

See the schema definitions in "make_db.py" for more information.

To create a new database file or update an existing database file, run

```bash
python scripts/make_db.py
```
