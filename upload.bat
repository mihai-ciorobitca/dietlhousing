@echo off
echo Adding all files...
git add -A
echo.
echo Current status:
git status
echo.
set /p msg="Enter commit message: "
if "%msg%"=="" set msg=Update
git commit -m "%msg%"
echo.
echo Pushing to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    git push origin master
)
echo.
echo Done.
pause
