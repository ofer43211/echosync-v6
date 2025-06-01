# Simple Hebrew Names Fix
Write-Host "🔧 מתקן שמות בעברית..." -ForegroundColor Green

# עצור את השרת אם רץ
Write-Host "⏹️ עוצר שרת אם רץ..." -ForegroundColor Yellow
try { Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue } catch {}

# תקן את הקובץ הראשי בלבד
$mainFile = "echo-sync.js"
if (Test-Path $mainFile) {
    Write-Host "📝 מעדכן $mainFile..." -ForegroundColor Cyan
    
    $content = Get-Content $mainFile -Raw -Encoding UTF8
    
    # החלפות ספציפיות
    $content = $content -replace 'GPT-Rami', 'GPT-רמי'
    $content = $content -replace 'Claude-Business', 'קלוד-עסקים'
    $content = $content -replace 'Gemini-Coordinator', 'ג''מיני-רכז'
    $content = $content -replace 'Perplexity-Researcher', 'פרפלקסיטי-חוקר'
    
    # החלפות נוספות
    $content = $content -replace '"name": "gpt-rami"', '"name": "GPT-רמי"'
    $content = $content -replace '"name": "claude-business"', '"name": "קלוד-עסקים"'
    $content = $content -replace '"name": "gemini-coordinator"', '"name": "ג''מיני-רכז"'
    $content = $content -replace '"name": "perplexity-researcher"', '"name": "פרפלקסיטי-חוקר"'
    
    Set-Content $mainFile -Value $content -Encoding UTF8
    Write-Host "✅ $mainFile עודכן!" -ForegroundColor Green
} else {
    Write-Host "❌ לא מוצא את $mainFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 עכשיו הפעל: node echo-sync.js" -ForegroundColor Magenta
Write-Host "🇮🇱 אמור לראות שמות בעברית!" -ForegroundColor Green