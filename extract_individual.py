import UnityPy
import os
import json

BUNDLES_DIR = os.path.join(os.environ['TEMP'], 'opencode', 'illuminati', 'main', 'assets', 'aa', 'Android')
OUTPUT_DIR = os.path.join(os.environ['USERPROFILE'], 'Documents', 'Default Project', 'ape-marvel-clicker', 'public', 'assets', 'illuminati', 'sprites')

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Collect all sprites with their rects from all bundles
all_sprites = []
for fname in sorted(os.listdir(BUNDLES_DIR)):
    if not fname.endswith('.bundle'):
        continue
    fpath = os.path.join(BUNDLES_DIR, fname)
    short = fname.split('_assets_')[0] if '_assets_' in fname else fname[:30]
    print(f"Scanning: {short}...")
    try:
        env = UnityPy.load(fpath)
        for obj in env.objects:
            if obj.type.name == "Sprite":
                try:
                    data = obj.read()
                    name = getattr(data, 'm_Name', None) or f"spr_{len(all_sprites)}"
                    # Get the sprite's rect within the atlas
                    rect = None
                    try:
                        if hasattr(data, 'm_Rect'):
                            r = data.m_Rect
                            rect = (int(r.x), int(r.y), int(r.width), int(r.height))
                    except:
                        pass
                    # Get the texture
                    try:
                        img = data.image
                        if img:
                            # Save the full sprite (already cropped by UnityPy)
                            safe_name = name.replace('/', '_').replace('\\', '_').replace(' ', '_')
                            out = os.path.join(OUTPUT_DIR, f"{safe_name}.png")
                            img.save(out)
                            all_sprites.append({
                                'name': name,
                                'file': f"{safe_name}.png",
                                'width': img.size[0],
                                'height': img.size[1],
                                'rect': rect,
                                'bundle': short,
                            })
                            print(f"  -> {name} ({img.size[0]}x{img.size[1]})")
                    except Exception as e2:
                        pass
                except Exception as e3:
                    pass
    except Exception as e:
        print(f"  Error: {e}")

# Save catalog
catalog_path = os.path.join(OUTPUT_DIR, '_sprite_catalog.json')
with open(catalog_path, 'w') as f:
    json.dump(all_sprites, f, indent=2)

print(f"\nTotal: {len(all_sprites)} individual sprites extracted")
print(f"Catalog: {catalog_path}")

# Group by category
categories = {}
for s in all_sprites:
    b = s['bundle']
    cat = 'other'
    if 'clone' in b.lower(): cat = 'clones'
    elif 'manager' in b.lower(): cat = 'managers'
    elif 'upgrade' in b.lower(): cat = 'upgrades'
    elif 'character' in b.lower() or 'stage' in b.lower(): cat = 'characters'
    elif 'cell' in b.lower(): cat = 'cells'
    elif 'background' in b.lower(): cat = 'backgrounds'
    elif 'button' in b.lower(): cat = 'buttons'
    elif 'content' in b.lower(): cat = 'ui'
    elif 'narrative' in b.lower(): cat = 'narrative'
    categories.setdefault(cat, []).append(s['name'])

print("\nCategories:")
for cat, items in sorted(categories.items()):
    print(f"  {cat}: {len(items)} sprites")
    for item in items[:5]:
        print(f"    - {item}")
    if len(items) > 5:
        print(f"    ... and {len(items)-5} more")
