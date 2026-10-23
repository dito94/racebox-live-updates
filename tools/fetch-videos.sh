#!/bin/sh
# Download the product-page header videos into original/ (kept out of git: 75 MB, unchanged by the updates).
cd "$(dirname "$0")/../original" || exit 1
for p in racebox racebox-mini racebox-micro; do
  for f in header-1920.mp4 header-1920.webm header-1920.ogv header-1920-6.ogv; do
    wget -q -x -nH "https://www.racebox.pro/assets/v-1776405836/video/$p/$f" || true
  done
done
