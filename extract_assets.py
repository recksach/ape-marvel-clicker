import UnityPy
import os

BUNDLES_DIR = os.path.join(os.environ['TEMP'], 'opencode', 'illuminati', 'main', 'assets', 'aa', 'Android')
OUTPUT_DIR = os.path.join(os.environ['USERPROFILE'], 'Documents', 'Default Project', 'ape-marvel-clicker', 'public', 'assets', 'illuminati', 'sprites')

os.makedirs(OUTPUT_DIR, exist_ok=True)

count = 0
for fname in os.listdir(BUNDLES_DIR):
    if not fname.endswith('.bundle'):
        continue
    fpath = os.path.join(BUNDLES_DIR, fname)
    short = fname.split('_assets_')[0] if '_assets_' in fname else fname[:20]
    print(f"Loading: {short}...")
    try:
        env = UnityPy.load(fpath)
        for obj in env.objects:
            if obj.type.name == "Texture2D":
                try:
                    data = obj.read()
                    name = getattr(data, 'm_Name', None) or getattr(data, 'name', None) or f"texture_{count}"
                    img = data.image
                    if img:
                        out = os.path.join(OUTPUT_DIR, f"{name}.png")
                        img.save(out)
                        count += 1
                        print(f"  -> {name} ({img.size[0]}x{img.size[1]})")
                except Exception as e2:
                    print(f"  skip: {e2}")
    except Exception as e:
        print(f"  Error: {e}")

print(f"\nTotal: {count} textures extracted")
