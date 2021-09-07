#!/usr/bin/python3

import os
import subprocess
import pathlib


def main():
    subprocess.call(['python3', 'manifest_builder2.py'])
    subprocess.call(['bash', 'build_docs.bash'])
    cwd = pathlib.Path.cwd()
    folders = []
    for inode in os.listdir():
        if os.path.isdir(inode):
            folders.append(inode)
    projects = []
    for folder in folders:
        if os.path.isfile(os.path.join(folder, 'tsconfig.json')):
            projects.append(folder)
    for project in projects:
        os.chdir(project)
        subprocess.call('tsc')
        os.chdir(cwd)


if __name__ == '__main__':
    main()
