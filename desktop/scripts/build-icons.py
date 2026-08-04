from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
ICON_SCALE = 0.9


def build_icons():
    BUILD.mkdir(parents=True, exist_ok=True)
    source_path = BUILD / "deepseek-nova-app-icon.png"
    if not source_path.exists():
        raise FileNotFoundError(f"Missing DeepSeek Nova icon source: {source_path}")

    source = Image.open(source_path).convert("RGBA")
    scaled_size = tuple(round(dimension * ICON_SCALE) for dimension in source.size)
    scaled = source.resize(scaled_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", source.size, (0, 0, 0, 0))
    offset = tuple((source.size[index] - scaled_size[index]) // 2 for index in range(2))
    canvas.alpha_composite(scaled, offset)

    png_path = BUILD / "app-icon.png"
    ico_path = BUILD / "app-icon.ico"
    canvas.save(png_path, optimize=True)
    canvas.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (20, 20), (24, 24), (32, 32), (40, 40), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(png_path)
    print(ico_path)


if __name__ == "__main__":
    build_icons()
