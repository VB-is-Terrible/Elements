#!/usr/bin/python3

import os
import subprocess
import pathlib


PROJECTS = ['elements', 'Reader']


def main():
    subprocess.call(['python3', 'manifest_builder2.py'])
    subprocess.call(['bash', 'build_docs.bash'])
    cwd = pathlib.Path.cwd()
    for project in PROJECTS:
        os.chdir(project)
        subprocess.call('tsc')
        os.chdir(cwd)


if __name__ == '__main__':
    main()
