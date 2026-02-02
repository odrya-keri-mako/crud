@echo off
cd /d "%~dp0"

:: Check parmeter
if /i "%~1"=="REACT"    goto :React
if /i "%~1"=="VUE"      goto :Vue
if /i "%~1"=="ANGULAR"  goto :Angular
if /i "%~1"=="SVELTE"   goto :Svelte
if "%~1" NEQ "" (
  echo Wrong parameter!
  goto :End
)

:: React
:React
echo React
start "Express" cmd /k "cd /d backend/express && npm run dev"
start "React" cmd /k "cd /d frontend/react && npm run dev"
if "%~1" NEQ "" goto :End

:: Angular
:Angular
echo Angular
:: start "Laravel" cmd /k "cd /d backend/laravel && php artisan serve --port=8000"
:: start "Angular" cmd /k "cd /d frontend/angular && npm start"
if "%~1" NEQ "" goto :End

:: Vue
:Vue
echo Vue
if "%~1" NEQ "" goto :End

:: Svelte
:Svelte
echo Svelte
if "%~1" NEQ "" goto :End

:End
exit