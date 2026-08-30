Add-Type -AssemblyName System.Drawing
$srcImage = [System.Drawing.Image]::FromFile("C:\Users\rio\.gemini\antigravity\scratch\CJM_Motor\public\assets\images\logo.jpg")

$size = [Math]::Min($srcImage.Width, $srcImage.Height)
$x = [Math]::Max(0, [Math]::Round(($srcImage.Width - $size) / 2))
$y = [Math]::Max(0, [Math]::Round(($srcImage.Height - $size) / 2))

$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$graph512 = [System.Drawing.Graphics]::FromImage($bmp512)
$graph512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph512.DrawImage($srcImage, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)), $x, $y, $size, $size, [System.Drawing.GraphicsUnit]::Pixel)
$bmp512.Save("C:\Users\rio\.gemini\antigravity\scratch\CJM_Motor\public\assets\icons\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$graph192 = [System.Drawing.Graphics]::FromImage($bmp192)
$graph192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph192.DrawImage($srcImage, (New-Object System.Drawing.Rectangle(0, 0, 192, 192)), $x, $y, $size, $size, [System.Drawing.GraphicsUnit]::Pixel)
$bmp192.Save("C:\Users\rio\.gemini\antigravity\scratch\CJM_Motor\public\assets\icons\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$graph512.Dispose()
$bmp512.Dispose()
$graph192.Dispose()
$bmp192.Dispose()
$srcImage.Dispose()
write-host "Icons generated successfully!"
