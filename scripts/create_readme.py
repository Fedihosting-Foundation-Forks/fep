#!/usr/bin/python

from tools import FepIndex

with open("index.md", "w") as f1:
    f1.writelines(FepIndex().content)
