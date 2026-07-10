@echo off
chcp 65001 >nul
echo.
echo  ==========================================
echo   Kun Panelleri - Sayt Ishletilmekte...
echo  ==========================================
echo.
echo  Adres: http://localhost:5000
echo  Toqtatish: CTRL+C
echo.
set PYTHONIOENCODING=utf-8
venv\Scripts\python app.py
pause
