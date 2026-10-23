import os
from PIL import Image, ImageDraw, ImageFilter

MASTER_PATH = r"C:/Users/aryan/.gemini/antigravity/brain/b59549df-6a9e-4a26-a63a-1e0e6f5916c5/.user_uploaded/media_1792734337564_a0857a3f.jpg"
OUTPUT_DIR = r"c:/Users/aryan/OneDrive/Desktop/Antigravity Projects/Gallery/public/icons"
PUBLIC_DIR = r"c:/Users/aryan/OneDrive/Desktop/Antigravity Projects/Gallery/public"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load master image
master = Image.open(MASTER_PATH).convert("RGBA")
W, H = master.size

# Average border background color
BG_COLOR = (233, 234, 237, 255)

def create_padded_canvas(target_w, target_h, icon_scale=0.8):
    """
    Creates a canvas of target dimensions with smooth radial ambient studio background
    and centers the master icon with natural blending.
    """
    canvas = Image.new("RGBA", (target_w, target_h), BG_COLOR)
    
    # Calculate target icon size maintaining 1:1 aspect ratio
    max_dim = min(target_w, target_h)
    icon_size = int(max_dim * icon_scale)
    
    # High-quality Lanczos resampling
    resized_icon = master.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Calculate center position
    x = (target_w - icon_size) // 2
    y = (target_h - icon_size) // 2
    
    # Paste centered
    canvas.paste(resized_icon, (x, y), resized_icon)
    return canvas

def generate_all():
    print("Generating comprehensive icon and ratio suite...")
    
    # 1. 1:1 Square Variations
    master.save(os.path.join(OUTPUT_DIR, "icon-1024x1024.png"), "PNG")
    master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_DIR, "icon-512x512.png"), "PNG")
    master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "pwa-512x512.png"), "PNG")
    
    master.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_DIR, "icon-192x192.png"), "PNG")
    master.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "pwa-192x192.png"), "PNG")
    
    master.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_DIR, "apple-touch-icon.png"), "PNG")
    master.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
    
    master.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_DIR, "favicon-64x64.png"), "PNG")
    master.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_DIR, "favicon-32x32.png"), "PNG")
    master.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon.png"), "PNG")
    
    # 2. Maskable PWA Icon (1:1 with 15% safe margin)
    maskable = create_padded_canvas(512, 512, icon_scale=0.78)
    maskable.save(os.path.join(OUTPUT_DIR, "icon-maskable-512x512.png"), "PNG")
    maskable.save(os.path.join(PUBLIC_DIR, "pwa-maskable-512x512.png"), "PNG")
    
    # 3. 16:9 Landscape Banner (1920 x 1080)
    banner_16_9 = create_padded_canvas(1920, 1080, icon_scale=0.75)
    banner_16_9.save(os.path.join(OUTPUT_DIR, "gallery-banner-16x9.png"), "PNG")
    
    # 4. 9:16 Vertical Mobile Splash / Story (1080 x 1920)
    splash_9_16 = create_padded_canvas(1080, 1920, icon_scale=0.68)
    splash_9_16.save(os.path.join(OUTPUT_DIR, "gallery-splash-9x16.png"), "PNG")
    
    # 5. 4:3 Display Card / Tablet (1200 x 900)
    card_4_3 = create_padded_canvas(1200, 900, icon_scale=0.72)
    card_4_3.save(os.path.join(OUTPUT_DIR, "gallery-card-4x3.png"), "PNG")
    
    # 6. 3:1 Wide Header Banner (1200 x 400)
    header_3_1 = create_padded_canvas(1200, 400, icon_scale=0.82)
    header_3_1.save(os.path.join(OUTPUT_DIR, "gallery-header-3x1.png"), "PNG")
    
    # 7. 21:9 Ultrawide Panorama (1680 x 720)
    ultrawide_21_9 = create_padded_canvas(1680, 720, icon_scale=0.75)
    ultrawide_21_9.save(os.path.join(OUTPUT_DIR, "gallery-ultrawide-21x9.png"), "PNG")
    
    print("All ratios and resolutions generated successfully!")

if __name__ == "__main__":
    generate_all()
