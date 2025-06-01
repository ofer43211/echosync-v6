# Fix Hebrew Single Quote Issue
Write-Host "🔧 מתקן בעיית גרש עברי..." -ForegroundColor Green

$mainFile = "echo-sync.js"
if (Test-Path $mainFile) {
    $content = Get-Content $mainFile -Raw -Encoding UTF8
    
    # תחליף את הגרש העברי בגרש רגיל או בלי גרש
    $content = $content -replace 'ג''מיני-רכז', 'ג_מיני-רכז'
    $content = $content -replace "'ג'מיני-רכז'", "'ג_מיני-רכז'"
    $content = $content -replace '"ג''מיני-רכז"', '"ג_מיני-רכז"'
    
    # אופציה נוספת - בלי גרש בכלל
    $content = $content -replace 'ג_מיני-רכז', 'גמיני-רכז'
    
    Set-Content $mainFile -Value $content -Encoding UTF8
    Write-Host "✅ תוקן הגרש העברי!" -ForegroundColor Green
    Write-Host "🚀 נסה שוב: node echo-sync.js" -ForegroundColor Cyan
}