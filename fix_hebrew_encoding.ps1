# Fix Hebrew Encoding Issues
Write-Host "🔧 מתקן בעיות קידוד עברי..." -ForegroundColor Green

# מצא את קובץ ה-HTML
$htmlFiles = Get-ChildItem -Recurse -Include "*.html"

foreach ($file in $htmlFiles) {
    Write-Host "📄 מעבד: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # וודא שיש meta charset UTF-8
    if ($content -notmatch '<meta charset="utf-8"') {
        $content = $content -replace '<head>', '<head><meta charset="utf-8">'
    }
    
    # הוסף direction RTL ו-lang Hebrew
    $content = $content -replace '<html[^>]*>', '<html dir="rtl" lang="he">'
    
    # תקן CSS עבור עברית
    $cssAddition = @"
<style>
body { 
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
    direction: rtl; 
    text-align: right; 
}
.chat-container { direction: rtl; text-align: right; }
.message { direction: rtl; text-align: right; }
input[type="text"] { direction: rtl; text-align: right; }
</style>
"@
    
    if ($content -notmatch 'direction: rtl') {
        $content = $content -replace '</head>', "$cssAddition</head>"
    }
    
    Set-Content $file.FullName -Value $content -Encoding UTF8
    Write-Host "✅ $($file.Name) תוקן!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 הפעל מחדש את השרת:" -ForegroundColor Magenta
Write-Host "Ctrl+C → node echo-sync.js" -ForegroundColor Yellow
Write-Host "🌐 ואז נסה שוב בדפדפן!" -ForegroundColor Green