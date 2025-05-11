function Process-Directory {
    param (
        [string]$Path
    )

    # List directories in the current path
    $subDirs = Get-ChildItem -Path $Path -Directory

    # Process each subdirectory recursively first
    foreach ($dir in $subDirs) {
        Write-Host "`n=== Entering Directory: $($dir.FullName) ===" -ForegroundColor Green
        Write-Host "`n[Directory Listing]"
        Get-ChildItem -Path $dir.FullName  # Equivalent to 'ls'

        # Print file contents in this directory
        $files = Get-ChildItem -Path $dir.FullName -File
        if ($files) {
            Write-Host "`n[File Contents]" -ForegroundColor Yellow
            foreach ($file in $files) {
                Write-Host "`n---- $($file.Name) ----" -ForegroundColor Cyan
                Get-Content $file.FullName  # Equivalent to 'cat'
            }
        }

        # Recursively process subdirectories
        Process-Directory -Path $dir.FullName
    }
}

# Start processing from the root directory
$rootPath = "C:\Users\user\Desktop\projects\members-backend"

# First process all subdirectories
Process-Directory -Path $rootPath

# Finally process root files
Write-Host "`n=== Root Files in: $rootPath ===" -ForegroundColor Green
Write-Host "`n[Root Directory Listing]"
Get-ChildItem -Path $rootPath  # List root contents

$rootFiles = Get-ChildItem -Path $rootPath -File
if ($rootFiles) {
    Write-Host "`n[Root File Contents]" -ForegroundColor Yellow
    foreach ($file in $rootFiles) {
        Write-Host "`n---- $($file.Name) ----" -ForegroundColor Cyan
        Get-Content $file.FullName
    }
}