@echo off
echo =============================
echo  Subiendo cambios...
echo =============================

set /p MENSAJE="Mensaje del commit: "

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-infra"
echo.
echo === comerciales-infra ===
git add .
git commit -m "%MENSAJE%"
git push

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-backend"
echo.
echo === comerciales-backend ===
git add .
git commit -m "%MENSAJE%"
git push

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-docs"
echo.
echo === comerciales-docs ===
git add .
git commit -m "%MENSAJE%"
git push

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-frontend"
echo.
echo === comerciales-frontend ===
git add .
git commit -m "%MENSAJE%"
git push

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\Optimind_Solutions"
echo.
echo === Optimind_Solutions ===
git add .
git commit -m "%MENSAJE%"
git push

echo.
echo =============================
echo  Listo!
echo =============================
pause
