# Run from the project root in PowerShell:  powershell -ExecutionPolicy Bypass -File .\compress-videos.ps1
# Needs ffmpeg:  winget install Gyan.FFmpeg   (then reopen the terminal)
Get-ChildItem public\video, public\gifts -Filter *.mp4 | ForEach-Object {
  $out = "$($_.FullName).tmp.mp4"
  if ($_.Name -like 'hero-*') { $a = @('-an') } else { $a = @('-c:a','aac','-b:a','64k') }
  & ffmpeg -y -loglevel error -i $_.FullName -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart @a $out
  if (Test-Path $out) { Move-Item -Force $out $_.FullName; Write-Host "OK  $($_.Name)  $([math]::Round($_.Length/1MB,1)) MB" }
}
