#!/bin/sh
set -eu
node --check office.js
mkdir -p dist/assets
cp index.html office.css office.js dist/
cp assets/lounge.png assets/studio.png dist/assets/
