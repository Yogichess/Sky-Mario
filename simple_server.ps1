Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()

Write-Host "Server started at http://localhost:8080/"
Write-Host "Open this URL in Chrome to play the Mario game!"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq '/') { 
            $localPath = '/index.html' 
        }
        
        $filePath = Join-Path (Get-Location) $localPath.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            if ($filePath.EndsWith('.html')) { 
                $response.ContentType = 'text/html; charset=utf-8' 
            } elseif ($filePath.EndsWith('.js')) { 
                $response.ContentType = 'application/javascript; charset=utf-8' 
            } elseif ($filePath.EndsWith('.css')) { 
                $response.ContentType = 'text/css; charset=utf-8' 
            }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes('File not found')
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
}
