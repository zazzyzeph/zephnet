#!/bin/bash

# Script to crop MP4 to 4:3 aspect ratio, extract first frame, and create web-optimized video
# Usage: ./crop_video.sh input.mp4

set -e

# Check if input file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <input.mp4>"
    exit 1
fi

INPUT="$1"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it first."
    exit 1
fi

# Get the directory and filename without extension
DIR=$(dirname "$INPUT")
BASENAME=$(basename "$INPUT" .mp4)

# Output filenames
OUTPUT_VIDEO="${DIR}/${BASENAME}_cropped.mp4"
OUTPUT_JPG="${DIR}/${BASENAME}_frame.jpg"

echo "Processing: $INPUT"
echo "Output directory: $DIR"

# Get video dimensions
VIDEO_INFO=$(ffmpeg -i "$INPUT" 2>&1)
WIDTH=$(echo "$VIDEO_INFO" | grep -oP 'Stream.*Video.*\K\d{3,5}x\d{3,5}' | head -1 | cut -d'x' -f1)
HEIGHT=$(echo "$VIDEO_INFO" | grep -oP 'Stream.*Video.*\K\d{3,5}x\d{3,5}' | head -1 | cut -d'x' -f2)

if [ -z "$WIDTH" ] || [ -z "$HEIGHT" ]; then
    echo "Error: Could not determine video dimensions"
    exit 1
fi

echo "Original dimensions: ${WIDTH}x${HEIGHT}"

# Calculate crop dimensions for 4:3 centered crop
# 4:3 aspect ratio = 1.333...
TARGET_RATIO=1.333333
CURRENT_RATIO=$(echo "scale=6; $WIDTH / $HEIGHT" | bc)

if (( $(echo "$CURRENT_RATIO > $TARGET_RATIO" | bc -l) )); then
    # Video is wider than 4:3, crop width
    CROP_HEIGHT=$HEIGHT
    CROP_WIDTH=$(echo "$HEIGHT * 4 / 3" | bc)
    CROP_X=$(echo "($WIDTH - $CROP_WIDTH) / 2" | bc)
    CROP_Y=0
else
    # Video is taller than 4:3, crop height
    CROP_WIDTH=$WIDTH
    CROP_HEIGHT=$(echo "$WIDTH * 3 / 4" | bc)
    CROP_X=0
    CROP_Y=$(echo "($HEIGHT - $CROP_HEIGHT) / 2" | bc)
fi

echo "Crop dimensions: ${CROP_WIDTH}x${CROP_HEIGHT} at offset (${CROP_X},${CROP_Y})"

# Create the cropped video with web optimization
# - H.264 codec (widely supported)
# - CRF 23 (medium quality, good balance)
# - faststart flag for web streaming
# - YUV 4:2:0 pixel format for compatibility
echo "Creating cropped video..."
ffmpeg -i "$INPUT" \
    -vf "crop=${CROP_WIDTH}:${CROP_HEIGHT}:${CROP_X}:${CROP_Y}" \
    -c:v libx264 \
    -preset medium \
    -crf 23 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac \
    -b:a 128k \
    -y \
    "$OUTPUT_VIDEO" 2>&1 | grep -v "^frame="

echo "Video created: $OUTPUT_VIDEO"

# Extract first frame from cropped video as JPG with quality ~80
echo "Extracting first frame..."
ffmpeg -i "$OUTPUT_VIDEO" \
    -vframes 1 \
    -q:v 2 \
    -y \
    "$OUTPUT_JPG" 2>&1 | grep -v "^frame="

echo "Frame extracted: $OUTPUT_JPG"
echo "Done!"
