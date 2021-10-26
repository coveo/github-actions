import argparse
import glob
import re
import sys
import os
from pathlib import Path

if __name__ == "__main__"

    # https://regex101.com/r/bIMRKq/1/
    DEFAULT_CHANGELOG_FILE_PATTERN = r"^(?:- \*(?:feature|deprecation|fix|enhancement|refactor|internal|doc)\([\w\s]+\)\*: .+)+$"
    
    change_log_location = os.environ["INPUT_CHANGELOGSLOCATION"]
    change_log_file_pattern = os.environ["INPUT_CHANGELOGFILEPATTERN"]

    if not change_log_file_pattern or change_log_file_pattern == "":
        change_log_file_pattern = DEFAULT_CHANGELOG_FILE_PATTERN
    change_log_file_regex = re.compile(change_log_file_pattern)

    files = glob.glob(change_log_location)

    invalid_lines = []
    has_lines = False
    for filename in files:
        for number, line in enumerate(Path(filename).read_text().splitlines()):
            has_lines = True
            if not change_log_file_regex.match(line):
                invalid_lines.append(f"{filename}:{number+1}: `{line}`")

    if invalid_lines:
        print(
            f"The following changelogs do not match this pattern: {change_log_file_pattern}\n"
            + "Here's a valid example: `- *fix(Scope)*: I fixed this [DT-1234]`\n\n    "
            + "\n    ".join(invalid_lines)
        )
        print("\nIf you wish to make a multiline announcement, please do so in a message outside of the changelog")
        sys.exit(1)
    elif not has_lines:
        print(
            "No changelogs were found. Make sure a text file is present in '" + change_log_location "'."
        )
        sys.exit(1)
    else:
        print("All good!")
