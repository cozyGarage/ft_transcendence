from PIL import Image
import os

images_to_convert = [
    r"c:\Users\Home\Dev\ft_transcendence\frontend\assets\images\profile\mudoria.jpg",
    r"c:\Users\Home\Dev\ft_transcendence\frontend\assets\images\profile\tanjuro.jpg",
    r"c:\Users\Home\Dev\ft_transcendence\frontend\images\background.jpg",
]

for img_path in images_to_convert:
    if os.path.exists(img_path):
        filename = os.path.splitext(img_path)[0]
        webp_path = filename + ".webp"
        print(f"Converting {img_path} to {webp_path}...")
        with Image.open(img_path) as img:
            # Maintain aspect ratio, set quality to 80
            img.save(webp_path, "webp", quality=80)

        orig_size = os.path.getsize(img_path) / 1024
        webp_size = os.path.getsize(webp_path) / 1024
        reduction = (1 - webp_size / orig_size) * 100
        print(
            f"Original: {orig_size:.2f}KB, WebP: {webp_size:.2f}KB ({reduction:.1f}% reduction)"
        )
    else:
        print(f"File not found: {img_path}")
