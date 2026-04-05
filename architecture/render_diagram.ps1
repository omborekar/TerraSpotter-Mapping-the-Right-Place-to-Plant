Param(
    [string]$InputFile = "diagram.mmd",
    [string]$OutSvg = "diagram.svg",
    [string]$OutPng = "diagram.png"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$inputPath = Join-Path $scriptDir $InputFile
$outSvgPath = Join-Path $scriptDir $OutSvg
$outPngPath = Join-Path $scriptDir $OutPng

Write-Host "Rendering Mermaid diagram from $inputPath"

if (-not (Test-Path $inputPath)) {
    Write-Error "Input file not found: $inputPath"
    exit 1
}

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "npx not found. Install Node.js / npm and ensure npx is on PATH."
    exit 1
}

function Run-Npx {
    param([string[]]$Args)
    Write-Host "npx $($Args -join ' ')"
    $proc = Start-Process -FilePath "npx" -ArgumentList $Args -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
    if ($null -eq $proc) { return 1 }
    return $proc.ExitCode
}

# Try the common invocation; if it fails try the alternate 'mmdc' invocation.
$code = Run-Npx -Args @("-y", "@mermaid-js/mermaid-cli", "--", "-i", $inputPath, "-o", $outSvgPath, "-w", "1024", "-H", "800")
if ($code -ne 0) {
    Write-Host "Primary invocation failed (code $code). Trying alternate 'mmdc' command..."
    $code = Run-Npx -Args @("-y", "@mermaid-js/mermaid-cli", "mmdc", "-i", $inputPath, "-o", $outSvgPath, "-w", "1024", "-H", "800")
    if ($code -ne 0) {
        Write-Error "mermaid-cli failed to render SVG (exit codes: $code)."
        exit 1
    }
}

# Render PNG (reuse same strategy)
$code = Run-Npx -Args @("-y", "@mermaid-js/mermaid-cli", "--", "-i", $inputPath, "-o", $outPngPath, "-w", "1024", "-H", "800")
if ($code -ne 0) {
    Write-Host "Primary PNG invocation failed (code $code). Trying alternate 'mmdc' command..."
    $code = Run-Npx -Args @("-y", "@mermaid-js/mermaid-cli", "mmdc", "-i", $inputPath, "-o", $outPngPath, "-w", "1024", "-H", "800")
    if ($code -ne 0) {
        Write-Error "mermaid-cli failed to render PNG (exit codes: $code)."
        exit 1
    }
}

Write-Host "Rendered: $outSvgPath and $outPngPath"
