import argparse
import glob
import re
import sys
import os
from pathlib import Path

# https://regex101.com/r/bIMRKq/1/
CHANGELOG_FILE_PATTERN = r"^(?:- \*(?:feature|deprecation|fix|enhancement|refactor|internal|doc)\([\w\s]+\)\*: .+)+$"
CHANGELOG_FILE_REGEX = re.compile(CHANGELOG_FILE_PATTERN)

files = glob.glob(os.environ["INPUT_CHANGELOGSLOCATION"])

invalid_lines = []
has_lines = False
for filename in files:
    for number, line in enumerate(Path(filename).read_text().splitlines()):
        has_lines = True
        if not CHANGELOG_FILE_REGEX.match(line):
            invalid_lines.append(f"{filename}:{number+1}: `{line}`")

if invalid_lines:
    print(
        f"The following changelogs do not match this pattern: {CHANGELOG_FILE_PATTERN}\n"
        + "Here's a valid example: `- *fix(Scope)*: I fixed this [DT-1234]`\n\n    "
        + "\n    ".join(invalid_lines)
    )
    print("\nIf you wish to make a multiline announcement, please do so in a message outside of the changelog")
    sys.exit(1)
elif not has_lines:
    print(
        "No changelogs were found. Please refer to the `unreleased-changes/INSTRUCTIONS.md` file or "
        "add the following string to your pull request if this is not a user-facing change: `noChangelog=true`"
    )
    sys.exit(1)
else:
    print("All good!")
