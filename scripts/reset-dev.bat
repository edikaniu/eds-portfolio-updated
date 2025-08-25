@echo off
echo Resetting development environment...
echo.

echo Stopping any running processes...
taskkill /f /im node.exe 2>nul

echo Cleaning Next.js cache...
if exist .next rmdir /s /q .next

echo Cleaning npm cache...
npm cache clean --force

echo Development environment reset complete!
echo You can now run: npm run dev
pause