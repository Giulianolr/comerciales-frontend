@echo off
echo =============================
echo  Actualizando repositorios...
echo =============================

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-infra"
echo.
echo === comerciales-infra ===
git pull

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-backend"
echo.
echo === comerciales-backend ===
git pull

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-docs"
echo.
echo === comerciales-docs ===
git pull

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\comerciales-frontend"
echo.
echo === comerciales-frontend ===
git pull

cd /d "C:\Users\Lenovo\OneDrive\Documentos\GitHub\Optimind_Solutions"
echo.
echo === Optimind_Solutions ===
git pull

echo.
echo =============================
echo  Listo!
echo =============================
pause
