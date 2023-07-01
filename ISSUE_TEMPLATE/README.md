# tools for fep editors

Ensure dependencies (use a virtualenv)

```bash
pip install pytest requests
```

Check validity

```bash
pytest
```

## Configuration

Add a file `config.json` to the directory `ISSUE_TEMPLATE` with content

```json
{
  "repo": "fep",
  "owner": "fediverse",
  "token": "CODEBERG_API_TOKEN"
}

```

## Merge a FEP

```bash
python ISSUE_TEMPATE/create_issue.py
```

creates the tracking issue and updates the fep with the information. Then run

```bash
python ISSUE_TEMPATE/create_readme.py
```

to update the table in `README.md`.
