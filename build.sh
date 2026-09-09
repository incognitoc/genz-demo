#!/bin/sh
set -eu
node --check office.js
mkdir -p dist/assets/rooms
cp index.html office.css rooms.css glass.css office.js dist/
cp assets/lounge.png assets/studio.png dist/assets/
cp assets/rooms/*.png dist/assets/rooms/
