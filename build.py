#!/usr/bin/python3

import os
import subprocess


def main():
    subprocess.call(['python3', 'manifest_builder.py'])
    subprocess.call(['bash', 'build_docs.bash'])
    os.chdir('elements/')
    subprocess.call('tsc')
    os.chdir('../')


if __name__ == '__main__':
    main()
