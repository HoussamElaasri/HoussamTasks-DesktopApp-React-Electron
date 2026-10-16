# HoussamTasks - Automated Desktop Shortcut Generator
$rootDir = $PSScriptRoot
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "HoussamTasks.lnk"
$targetExe = Join-Path $rootDir "release\win-unpacked\HoussamTasks.exe"
$workingDir = Join-Path $rootDir "release\win-unpacked"
$iconPath = Join-Path $rootDir "Assets\icon.ico"

# If the app has not been compiled into release\win-unpacked yet, automatically build it
if (-not (Test-Path $targetExe)) {
    Write-Host "Building HoussamTasks application package..." -ForegroundColor Cyan
    npm.cmd run build
    npx.cmd electron-builder --win --x64 --dir
}

if (Test-Path $targetExe) {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetExe
    $shortcut.WorkingDirectory = $workingDir
    if (Test-Path $iconPath) {
        $shortcut.IconLocation = "$iconPath,0"
    }
    $shortcut.Description = "HoussamTasks - Notion-Style Personal Task & Project Workspace"
    $shortcut.Save()

    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "🎉 SUCCESS! HoussamTasks shortcut created on your Desktop:" -ForegroundColor Green
    Write-Host "   $shortcutPath" -ForegroundColor White
    Write-Host "You can now launch the app directly by double-clicking the icon on your Desktop!" -ForegroundColor Green
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Host "Error: Could not locate $targetExe. Please run 'npm run build' and 'npm start' first." -ForegroundColor Red
}
