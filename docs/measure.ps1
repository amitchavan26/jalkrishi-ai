param([string]$Label = 'run')
$ErrorActionPreference = 'Stop'
$base = if ($env:API_URL) { $env:API_URL } else { 'http://localhost:8080' }
$root = Split-Path $PSScriptRoot -Parent
$json = 'application/json'
Add-Type -AssemblyName System.Net.Http

function Post-Raw([string]$path, $obj, $headers) {
  return (Invoke-WebRequest -Method Post -Uri "$base$path" -Headers $headers -ContentType $json -Body ($obj | ConvertTo-Json -Depth 5) -UseBasicParsing).Content
}

$email = "measure$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$password = 'password123'
Post-Raw '/api/auth/register' @{ name = 'Measure User'; email = $email; password = $password } @{} | Out-Null
$token = ((Post-Raw '/api/auth/login' @{ email = $email; password = $password } @{}) | ConvertFrom-Json).token
$headers = @{ Authorization = "Bearer $token" }
$farm = (Post-Raw '/api/farms' @{ name = 'Measure Farm'; lat = 18.52; lon = 73.85; areaHa = 2.5; soilType = 'Loam'; storedWaterLitres = 100000; groundwaterLitres = 200000 } $headers) | ConvertFrom-Json
$cropsRaw = (Invoke-WebRequest -Uri "$base/api/crops" -Headers $headers -UseBasicParsing).Content
$crops = New-Object System.Collections.ArrayList
foreach ($c in ($cropsRaw | ConvertFrom-Json)) { [void]$crops.Add($c) }
$bodyObj = @{ farmId = $farm.id; cropId = $crops[0].id; horizonDays = 30 }
$body = $bodyObj | ConvertTo-Json

# 1) Sequential latency
$n = 50
$times = New-Object System.Collections.Generic.List[double]
$conf = @{}
$mlUsed = 0
$last = $null
for ($i = 0; $i -lt $n; $i++) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $raw = Post-Raw '/api/assessments' $bodyObj $headers
  $sw.Stop()
  $last = $raw | ConvertFrom-Json
  $times.Add($sw.Elapsed.TotalMilliseconds)
  $conf[$last.confidence] = 1 + [int]$conf[$last.confidence]
  if ($last.mlUsed) { $mlUsed++ }
}
$sorted = @($times | Sort-Object)
$avg = ($times | Measure-Object -Average).Average
$p95 = $sorted[[int][math]::Ceiling(0.95 * $n) - 1]

# 2) Concurrent load
function Run-Concurrent([int]$count) {
  $client = New-Object System.Net.Http.HttpClient
  $client.Timeout = [TimeSpan]::FromSeconds(120)
  $client.DefaultRequestHeaders.Add('Authorization', "Bearer $token")
  $tasks = New-Object 'System.Collections.Generic.List[System.Threading.Tasks.Task[System.Net.Http.HttpResponseMessage]]'
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  for ($i = 0; $i -lt $count; $i++) {
    $content = New-Object System.Net.Http.StringContent($body, [System.Text.Encoding]::UTF8, 'application/json')
    $tasks.Add($client.PostAsync("$base/api/assessments", $content))
  }
  try { [System.Threading.Tasks.Task]::WaitAll([System.Threading.Tasks.Task[]]$tasks.ToArray()) } catch { }
  $sw.Stop()
  $ok = 0
  foreach ($t in $tasks) {
    try { if ([int]$t.Result.StatusCode -eq 201) { $ok++ } } catch { }
  }
  $client.Dispose()
  return [pscustomobject]@{ Users = $count; Success = $ok; TotalMs = [math]::Round($sw.Elapsed.TotalMilliseconds) }
}
$c20 = Run-Concurrent 20
$c50 = Run-Concurrent 50

# 3) Write the report
$m = Get-Content (Join-Path $root 'ml-service\metrics.json') -Raw | ConvertFrom-Json
$o = New-Object System.Collections.Generic.List[string]
$o.Add("# Measured results ($Label)")
$o.Add("")
$o.Add("Measured on $(Get-Date -Format 'yyyy-MM-dd HH:mm') against $base")
$o.Add("")
$o.Add("## Sample assessment")
$o.Add("")
$o.Add("Farm 2.5 ha (Loam, 100,000 L stored, 200,000 L groundwater), crop $($crops[0].name), horizon 30 days.")
$o.Add("")
$o.Add("| Item | Value |")
$o.Add("|---|---|")
$o.Add("| Supply S | $([math]::Round($last.supplyLitres)) L |")
$o.Add("| Demand D | $([math]::Round($last.demandLitres)) L |")
$o.Add("| Balance B | $([math]::Round($last.balanceLitres)) L |")
$o.Add("| Ratio R | $([math]::Round($last.ratio, 3)) |")
$o.Add("| Suitability | $($last.suitability) |")
$o.Add("| Stress | $($last.stress) |")
$o.Add("| Confidence | $($last.confidence) |")
$o.Add("| ML used | $($last.mlUsed) ($($last.mlSuitability)) |")
$o.Add("| Weather source | $($last.weather.source) |")
$o.Add("| Tmax / Tmin | $($last.weather.tmax) / $($last.weather.tmin) C |")
$o.Add("| Rain per day | $($last.weather.peffDailyMm) mm |")
$o.Add("| Advice | $($last.advice) |")
$o.Add("")
$o.Add("## Latency of POST /api/assessments ($n sequential requests)")
$o.Add("")
$o.Add("| Metric | Milliseconds |")
$o.Add("|---|---|")
$o.Add("| Average | $([math]::Round($avg, 1)) |")
$o.Add("| p95 | $([math]::Round($p95, 1)) |")
$o.Add("| Min | $([math]::Round($sorted[0], 1)) |")
$o.Add("| Max | $([math]::Round($sorted[$sorted.Count - 1], 1)) |")
$o.Add("")
$o.Add("Confidence counts: " + (($conf.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ') + "; ML used in $mlUsed of $n requests.")
$o.Add("")
$o.Add("## Concurrent load (all requests fired at once)")
$o.Add("")
$o.Add("| Concurrent users | Successful (201) | Total time (ms) |")
$o.Add("|---|---|---|")
$o.Add("| $($c20.Users) | $($c20.Success) / $($c20.Users) | $($c20.TotalMs) |")
$o.Add("| $($c50.Users) | $($c50.Success) / $($c50.Users) | $($c50.TotalMs) |")
$o.Add("")
$o.Add("## ML model (synthetic rule-learning baseline)")
$o.Add("")
$o.Add("Samples: $($m.n_samples). Split: $($m.split). Accuracy: $($m.accuracy).")
$o.Add("")
$o.Add("| Class | Precision | Recall | F1 | Support |")
$o.Add("|---|---|---|---|---|")
foreach ($c in 'EXCELLENT', 'GOOD', 'RISKY', 'NOT_RECOMMENDED') {
  $row = $m.classification_report.$c
  $o.Add("| $c | $([math]::Round($row.precision, 3)) | $([math]::Round($row.recall, 3)) | $([math]::Round($row.'f1-score', 3)) | $($row.support) |")
}
$o.Add("")
$o.Add("Note: labels come from the same rule thresholds the model sees, so the accuracy is not a real-world estimate.")

$outFile = Join-Path $PSScriptRoot "measured-$Label.md"
$o | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Written $outFile"