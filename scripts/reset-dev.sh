#!/bin/bash
echo "Resetting development environment..."
echo

echo "Cleaning Next.js cache..."
rm -rf .next

echo "Cleaning npm cache..."
npm cache clean --force

echo "Development environment reset complete!"
echo "You can now run: npm run dev"