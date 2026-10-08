from PIL import Image, ImageDraw

def generate_bloomberg_anywhere_icon(output_path, size=1024):
    scale = 4
    w = size * scale
    h = size * scale

    # Dark background
    img = Image.new('RGB', (w, h), color=(10, 10, 12))
    draw = ImageDraw.Draw(img)

    # 1. Subtle Bloomberg Anywhere micro-dot grid
    dot_spacing = 34 * scale
    dot_radius = 2.0 * scale
    for y in range(int(dot_spacing // 2), h, int(dot_spacing)):
        for x in range(int(dot_spacing // 2), w, int(dot_spacing)):
            draw.ellipse(
                [x - dot_radius, y - dot_radius, x + dot_radius, y + dot_radius],
                fill=(26, 27, 34)
            )

    cx = w / 2

    # Proportions matching Bloomberg Professional App Icon exactly:
    mon_w = 344 * scale
    mon_h = 246 * scale
    gap = 22 * scale
    corner_r = 16 * scale
    
    # Vertically centered
    mon_top = 346 * scale
    mon_bottom = mon_top + mon_h

    left_mon_x0 = cx - (gap / 2) - mon_w
    left_mon_x1 = cx - (gap / 2)

    right_mon_x0 = cx + (gap / 2)
    right_mon_x1 = cx + (gap / 2) + mon_w

    # Left Monitor
    draw.rounded_rectangle(
        [left_mon_x0, mon_top, left_mon_x1, mon_bottom],
        radius=corner_r,
        fill=(255, 255, 255)
    )

    # Right Monitor
    draw.rounded_rectangle(
        [right_mon_x0, mon_top, right_mon_x1, mon_bottom],
        radius=corner_r,
        fill=(255, 255, 255)
    )

    # Stand Stem (Neck)
    stem_w = 38 * scale
    base_cy = 672 * scale
    hole_cy = 650 * scale
    
    # Base Disc (White Ellipse)
    base_rx = 168 * scale
    base_ry = 60 * scale
    draw.ellipse(
        [cx - base_rx, base_cy - base_ry, cx + base_rx, base_cy + base_ry],
        fill=(255, 255, 255)
    )

    # Stand Stem connecting from monitor down to hole top
    draw.rectangle(
        [cx - stem_w / 2, mon_bottom - (2 * scale), cx + stem_w / 2, hole_cy],
        fill=(255, 255, 255)
    )

    # Base Center Hole Cutout (Dark Ellipse for perspective ring)
    hole_rx = 50 * scale
    hole_ry = 26 * scale
    draw.ellipse(
        [cx - hole_rx, hole_cy - hole_ry, cx + hole_rx, hole_cy + hole_ry],
        fill=(10, 10, 12)
    )

    # Stand Stem entering top rim of hole
    stem_enter = hole_cy - (hole_ry * 0.3)
    draw.rectangle(
        [cx - stem_w / 2, mon_bottom - (2 * scale), cx + stem_w / 2, stem_enter],
        fill=(255, 255, 255)
    )

    # Resize down with LANCZOS for high quality anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    final_img.save(output_path, 'PNG', optimize=True)
    print(f"Generated icon: {output_path} ({size}x{size})")

if __name__ == '__main__':
    generate_bloomberg_anywhere_icon(r'C:\Users\bhask\Desktop\Celsius Network\scripts\test_bloomberg_icon3.png')
