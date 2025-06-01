# EchoSync Hebrew Conversion Script
# מסיר את כל האנגלית ומחליף לעברית אוטומטית

Write-Host "🇮🇱 מתחיל המרה לעברית..." -ForegroundColor Green

# צור גיבוי לפני השינויים
Write-Host "📂 יוצר גיבוי..." -ForegroundColor Yellow
if (!(Test-Path "backup")) { mkdir backup }
Copy-Item *.js backup\ -Recurse -Force
Copy-Item *.html backup\ -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item *.json backup\ -Recurse -Force -ErrorAction SilentlyContinue

# מילון תרגומים
$translations = @{
    "Welcome to EchoSync" = "ברוכים הבאים ל-EchoSync"
    "System initialized" = "המערכת אותחלה בהצלחה"
    "Server running" = "השרת פועל"
    "Error occurred" = "אירעה שגיאה"
    "Loading credentials" = "טוען אישורים"
    "API Status" = "סטטוס API"
    "missing" = "חסר"
    "active" = "פעיל"
    "initialized" = "אותחל"
    "Starting" = "מתחיל"
    "Setup complete" = "הגדרה הושלמה"
    "GPT-Rami" = "GPT-רמי"
    "Claude-Business" = "קלוד-עסקים"
    "Gemini-Coordinator" = "ג'מיני-רכז"
    "Perplexity-Researcher" = "פרפלקסיטי-חוקר"
    "Friendly AI Assistant" = "עוזר AI ידידותי"
    "Professional Business Advisor" = "יועץ עסקי מקצועי"
    "Organized Task Manager" = "מנהל משימות מאורגן"
    "Research Specialist" = "מומחה מחקר"
    "Send Message" = "שלח הודעה"
    "Type your message" = "הקלד את ההודעה שלך"
    "Chat with AI" = "צ'אט עם AI"
    "AI Response" = "תגובת AI"
    "Clear Chat" = "נקה צ'אט"
    "Settings" = "הגדרות"
    "Homepage" = "עמוד בית"
    "Security Center" = "מרכז אבטחה"
    "API Endpoint" = "נקודת API"
    "Middleware setup" = "הגדרת תוכנה ביניים"
    "Routes setup" = "הגדרת נתיבים"
    "Socket.IO setup" = "הגדרת Socket.IO"
    "fully initialized" = "אותחל במלואו"
    "nodes configured" = "צמתים הוגדרו"
    "Instance created" = "מופע נוצר"
    "Credentials manager" = "מנהל אישורים"
    "keys" = "מפתחות"
}

# החלף תרגומים בכל קבצי JS
Write-Host "🔄 מחליף טקסטים בקבצי JavaScript..." -ForegroundColor Cyan
Get-ChildItem *.js -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    foreach ($english in $translations.Keys) {
        $hebrew = $translations[$english]
        $content = $content -replace [regex]::Escape($english), $hebrew
    }
    
    if ($content -ne $originalContent) {
        Set-Content $_.FullName -Value $content -Encoding UTF8
        Write-Host "✅ עודכן: $($_.Name)" -ForegroundColor Green
    }
}

# החלף תרגומים בקבצי HTML
Write-Host "🔄 מחליף טקסטים בקבצי HTML..." -ForegroundColor Cyan
Get-ChildItem *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # תרגומים ספציפיים ל-HTML
    $content = $content -replace '<title>.*?</title>', '<title>EchoSync - צ&#39;אט עם 4 בוטי AI</title>'
    $content = $content -replace 'placeholder=".*?"', 'placeholder="הקלד את ההודעה שלך..."'
    $content = $content -replace '>Send<', '>שלח<'
    $content = $content -replace '>Clear<', '>נקה<'
    $content = $content -replace '>Settings<', '>הגדרות<'
    
    foreach ($english in $translations.Keys) {
        $hebrew = $translations[$english]
        $content = $content -replace [regex]::Escape($english), $hebrew
    }
    
    # הוסף RTL support
    if ($content -notmatch 'dir="rtl"' -and $content -match '<html') {
        $content = $content -replace '<html[^>]*>', '<html dir="rtl" lang="he">'
    }
    
    if ($content -ne $originalContent) {
        Set-Content $_.FullName -Value $content -Encoding UTF8
        Write-Host "✅ עודכן: $($_.Name)" -ForegroundColor Green
    }
}

# עדכן את קובץ package.json
Write-Host "📦 מעדכן package.json..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $packageJson.description = "פלטפורמת צ'אט עם 4 מודלי AI - גרסה בעברית"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
    Write-Host "✅ package.json עודכן" -ForegroundColor Green
}

# עדכן README אם קיים
Write-Host "📝 מעדכן README..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    $readme = @"
# EchoSync - פלטפורמת צ'אט עברית עם 4 בוטי AI

## 🇮🇱 תיאור
מערכת צ'אט בעברית המאפשרת שיחה עם 4 מודלי AI שונים בו-זמנית:

- **GPT-רמי** - עוזר AI ידידותי (OpenAI)
- **קלוד-עסקים** - יועץ עסקי מקצועי (Anthropic)
- **ג'מיני-רכז** - מנהל משימות מאורגן (Google)
- **פרפלקסיטי-חוקר** - מומחה מחקר (Perplexity)

## 🚀 הפעלה
```bash
node echo-sync.js
```

## 🌐 כתובות
- עמוד בית: http://localhost:3001/
- מרכז אבטחה: http://localhost:3001/credentials

## ⚙️ הגדרה
הוסף את מפתחות ה-API שלך בקובץ .env:
```
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

**🎯 מערכת AI בעברית מלאה!**
"@
    Set-Content "README.md" -Value $readme -Encoding UTF8
    Write-Host "✅ README.md עודכן" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ההמרה לעברית הושלמה בהצלחה!" -ForegroundColor Green
Write-Host "📂 גיבויים נשמרו בתיקייה: backup\" -ForegroundColor Yellow
Write-Host "🚀 הפעל את השרת: node echo-sync.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "🇮🇱 עכשיו המערכת תעבוד בעברית מלאה!" -ForegroundColor Magenta