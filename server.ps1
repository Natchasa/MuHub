param([int]$Port = 3737)

$root = $PSScriptRoot

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript'
    '.css'  = 'text/css'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
    '.json' = 'application/json'
    '.txt'  = 'text/plain'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Serving $root on http://localhost:$Port/"

while ($listener.IsListening) {
    $ctx = $null
    try { $ctx = $listener.GetContext() } catch { continue }
    $req = $ctx.Request
    $res = $ctx.Response

    try {
        $path = $req.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        $path = $path.TrimStart('/')
        $path = $path -replace '\.\.', ''
        $file = Join-Path $root $path

        Write-Host "GET $($req.Url.LocalPath) -> $file"

        if (Test-Path $file -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($file).ToLower()
            $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $res.StatusCode = 200
            $res.ContentType = $ct
            # Write in chunks to avoid ContentLength64 mismatch
            $res.SendChunked = $true
            $stream = $res.OutputStream
            $chunkSize = 65536
            $offset = 0
            while ($offset -lt $bytes.Length) {
                $len = [Math]::Min($chunkSize, $bytes.Length - $offset)
                $stream.Write($bytes, $offset, $len)
                $offset += $len
            }
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("Not found: $path")
            $res.StatusCode = 404
            $res.ContentType = 'text/plain'
            $res.SendChunked = $true
            $res.OutputStream.Write($body, 0, $body.Length)
        }
    } catch {
        Write-Host "Error: $_"
    } finally {
        try { $res.OutputStream.Close() } catch {}
    }
}
