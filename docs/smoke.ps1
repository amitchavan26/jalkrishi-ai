$ErrorActionPreference = 'Stop'
$base = if ($env:API_URL) { $env:API_URL } else { 'http://localhost:8080' }
$json = 'application/json'
$script:failed = 0
$script:headers = @{}
$script:farm = $null
$script:crops = $null
$script:assessment = $null

function Assert($cond, $msg) { if (-not $cond) { throw $msg } }

function Get-Json([string]$path) {
  $raw = (Invoke-WebRequest -Uri "$base$path" -Headers $script:headers -UseBasicParsing).Content
  return ,@($raw | ConvertFrom-Json)
}

function Post-Json([string]$path, $obj) {
  $raw = (Invoke-WebRequest -Method Post -Uri "$base$path" -Headers $script:headers -ContentType $json -Body ($obj | ConvertTo-Json -Depth 5) -UseBasicParsing).Content
  return ($raw | ConvertFrom-Json)
}

function Step([string]$name, [scriptblock]$body) {
  try {
    & $body | Out-Null
    Write-Host "PASS  $name" -ForegroundColor Green
  } catch {
    Write-Host "FAIL  $name -> $($_.Exception.Message)" -ForegroundColor Red
    $script:failed++
  }
}

$email = "smoke$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$password = 'password123'

Step 'health' {
  $r = Invoke-RestMethod "$base/health"
  Assert ($r.status -eq 'UP') 'health is not UP'
}
Step 'register' {
  $r = Post-Json '/api/auth/register' @{ name = 'Smoke User'; email = $email; password = $password }
  Assert ($r.email -eq $email) 'register did not echo the email'
}
Step 'login' {
  $r = Post-Json '/api/auth/login' @{ email = $email; password = $password }
  Assert ($r.token) 'no token returned'
  $script:headers = @{ Authorization = "Bearer $($r.token)" }
}
Step 'protected route without token returns 401' {
  $code = 0
  try { Invoke-WebRequest "$base/api/farms" -UseBasicParsing | Out-Null } catch { $code = [int]$_.Exception.Response.StatusCode }
  Assert ($code -eq 401) "expected 401 but got $code"
}
Step 'create farm' {
  $r = Post-Json '/api/farms' @{ name = 'Smoke Farm'; lat = 18.52; lon = 73.85; areaHa = 2.5; soilType = 'Loam'; storedWaterLitres = 100000; groundwaterLitres = 200000 }
  Assert ($r.id) 'farm has no id'
  $script:farm = $r
}
Step 'list crops (at least 8)' {
  $r = (Get-Json '/api/crops')[0]
  Assert ($r.Count -ge 8) "only $($r.Count) crops"
  $script:crops = $r
}
Step 'create assessment' {
  $r = Post-Json '/api/assessments' @{ farmId = $script:farm.id; cropId = $script:crops[0].id; horizonDays = 30 }
  Assert ($r.id) 'assessment has no id'
  Assert (@('EXCELLENT', 'GOOD', 'RISKY', 'NOT_RECOMMENDED') -contains $r.suitability) "bad suitability $($r.suitability)"
  Assert ([math]::Abs($r.ratio - ($r.supplyLitres / $r.demandLitres)) -lt 0.0001) 'ratio is not supply/demand'
  $script:assessment = $r
}
Step 'assessment appears in the list' {
  $r = (Get-Json '/api/assessments')[0]
  Assert (@($r | Where-Object { $_.id -eq $script:assessment.id }).Count -ge 1) 'not found in list'
}
Step 'compare three crops sorted by ratio' {
  $ids = @($script:crops[0].id, $script:crops[1].id, $script:crops[2].id)
  $raw = (Invoke-WebRequest -Method Post -Uri "$base/api/assessments/compare" -Headers $script:headers -ContentType $json -Body (@{ farmId = $script:farm.id; cropIds = $ids; horizonDays = 30 } | ConvertTo-Json -Depth 5) -UseBasicParsing).Content
    $parsed = $raw | ConvertFrom-Json
  $r = @($parsed | ForEach-Object { $_ })
  Assert ($r.Count -eq 3) "expected 3 results, got $($r.Count)"
  for ($i = 1; $i -lt $r.Count; $i++) {
    Assert ([double]$r[$i - 1].ratio -ge [double]$r[$i].ratio) 'not sorted by ratio descending'
  }
}
Step 'alerts endpoint answers' {
  Get-Json '/api/alerts' | Out-Null
}
Step 'report has 30/60/90 breakdown' {
  $raw = (Invoke-WebRequest -Uri "$base/api/reports/$($script:assessment.id)" -Headers $script:headers -UseBasicParsing).Content
  $r = $raw | ConvertFrom-Json
  $h = @($r.breakdown | ForEach-Object { [int]$_.horizonDays })
  Assert (($h -join ',') -eq '30,60,90') "breakdown horizons were $($h -join ',')"
}

if ($script:failed -gt 0) {
  Write-Host "$($script:failed) check(s) failed" -ForegroundColor Red
  exit 1
}
Write-Host 'All smoke checks passed' -ForegroundColor Green
exit 0