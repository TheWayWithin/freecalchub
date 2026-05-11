#!/usr/bin/env python3
"""
add-missing-head-tags.py

Add missing canonical, Open Graph, and Twitter Card head tags to calculator
index.html pages on freecalchub.com.

Idempotent: pages already containing a canonical link or og:title tag are
left alone. Pages missing both get both inserted; pages missing only one
get only that one.

Scope: pages under finance/, health/, math/, lifestyle/, conversions/,
date-time/ matching index.html.

Skip conditions (logged, not modified):
  - Page has no <title> tag
  - Page has no <meta name="description"> tag (cannot derive og:description)
  - Meta description tag cannot be located on a single line

Standards source: general-template-guidelines.md v1.7, Section 2 (Canonical
URL Requirements + Open Graph & Social Card Tags). Master reference for the
exact insertion block: calculator-template.html lines 22-34.

Usage:
    # Dry-run on specific pages, print unified diffs:
    python scripts/add-missing-head-tags.py --dry-run finance/mortgage/index.html ...

    # Dry-run on every calculator index.html in the six domains:
    python scripts/add-missing-head-tags.py --dry-run --all

    # Real run on every calculator page:
    python scripts/add-missing-head-tags.py --all

    # Real run on a specific list:
    python scripts/add-missing-head-tags.py path1 path2 ...
"""

from __future__ import annotations

import argparse
import difflib
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOMAIN_BASE = "https://www.freecalchub.com"
OG_IMAGE_URL = f"{DOMAIN_BASE}/images/social/cover_image_1200x630.png"
OG_IMAGE_WIDTH = "1200"
OG_IMAGE_HEIGHT = "630"
CALCULATOR_DIRS = (
    "finance",
    "health",
    "math",
    "lifestyle",
    "conversions",
    "date-time",
)

RE_TITLE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
RE_META_DESCRIPTION_LINE = re.compile(
    r"<meta\s+[^>]*name=[\"']description[\"'][^>]*>",
    re.IGNORECASE,
)
RE_CONTENT_ATTR = re.compile(r"content=[\"']([^\"']*)[\"']", re.IGNORECASE)
RE_CANONICAL = re.compile(r"<link\s+[^>]*rel=[\"']canonical[\"']", re.IGNORECASE)
RE_OG_TITLE = re.compile(r"<meta\s+[^>]*property=[\"']og:title[\"']", re.IGNORECASE)
RE_TWITTER_CARD = re.compile(r"<meta\s+[^>]*property=[\"']twitter:card[\"']", re.IGNORECASE)


def canonical_for_path(rel_path: Path) -> str:
    """Derive canonical URL for an index.html file.

    finance/mortgage/mortgage-calculator/index.html
      -> https://www.freecalchub.com/finance/mortgage/mortgage-calculator/
    """
    parts = rel_path.parts
    if parts and parts[-1].lower() == "index.html":
        parts = parts[:-1]
    return f"{DOMAIN_BASE}/{'/'.join(parts)}/"


def build_insertion_block(
    canonical_url: str,
    title: str,
    description: str,
    need_canonical: bool,
    need_og: bool,
    need_twitter: bool,
    indent: str,
) -> str:
    """Return the block of lines to splice in after the meta description line.

    Each line is prefixed with the same indentation observed on the meta
    description line, so the inserted block matches surrounding code style.
    OG and Twitter blocks are independent: a page may have OG without Twitter
    (or vice versa), and only the missing block(s) get inserted.
    """
    lines: list[str] = []
    if need_canonical:
        lines.append(f'<link rel="canonical" href="{canonical_url}"/>')
    if need_og:
        lines.append("<!-- Open Graph / Facebook -->")
        lines.append('<meta property="og:type" content="website">')
        lines.append(f'<meta property="og:url" content="{canonical_url}">')
        lines.append(f'<meta property="og:title" content="{title}">')
        lines.append(f'<meta property="og:description" content="{description}">')
        lines.append(f'<meta property="og:image" content="{OG_IMAGE_URL}">')
        lines.append(f'<meta property="og:image:width" content="{OG_IMAGE_WIDTH}">')
        lines.append(f'<meta property="og:image:height" content="{OG_IMAGE_HEIGHT}">')
    if need_twitter:
        lines.append("<!-- Twitter -->")
        lines.append('<meta property="twitter:card" content="summary_large_image">')
        lines.append(f'<meta property="twitter:url" content="{canonical_url}">')
        lines.append(f'<meta property="twitter:title" content="{title}">')
        lines.append(f'<meta property="twitter:description" content="{description}">')
        lines.append(f'<meta property="twitter:image" content="{OG_IMAGE_URL}">')
    return "\n".join(indent + ln for ln in lines)


def process_file(path: Path) -> tuple[str, tuple[str, str] | None]:
    """Return a status code and, if MODIFIED, the (original, new) text tuple."""
    rel = path.relative_to(REPO_ROOT)
    original = path.read_text(encoding="utf-8")

    title_match = RE_TITLE.search(original)
    if not title_match:
        return ("SKIP_NO_TITLE", None)
    desc_line_match = RE_META_DESCRIPTION_LINE.search(original)
    if not desc_line_match:
        return ("SKIP_NO_DESCRIPTION_LINE", None)
    content_match = RE_CONTENT_ATTR.search(desc_line_match.group(0))
    if not content_match:
        return ("SKIP_NO_DESCRIPTION", None)

    title = title_match.group(1).strip()
    description = content_match.group(1)

    need_canonical = not RE_CANONICAL.search(original)
    need_og = not RE_OG_TITLE.search(original)
    need_twitter = not RE_TWITTER_CARD.search(original)

    if not need_canonical and not need_og and not need_twitter:
        return ("UNCHANGED", None)

    canonical_url = canonical_for_path(rel)

    line_start = original.rfind("\n", 0, desc_line_match.start()) + 1
    indent_chars: list[str] = []
    for ch in original[line_start:desc_line_match.start()]:
        if ch in (" ", "\t"):
            indent_chars.append(ch)
        else:
            break
    indent = "".join(indent_chars)

    insertion = build_insertion_block(
        canonical_url=canonical_url,
        title=title,
        description=description,
        need_canonical=need_canonical,
        need_og=need_og,
        need_twitter=need_twitter,
        indent=indent,
    )

    line_end = original.find("\n", desc_line_match.end())
    if line_end == -1:
        return ("SKIP_NO_LINE_END", None)

    new_content = (
        original[: line_end + 1]
        + insertion
        + "\n"
        + original[line_end + 1 :]
    )
    return ("MODIFIED", (original, new_content))


def discover_all_calculator_pages() -> list[Path]:
    pages: list[Path] = []
    for domain in CALCULATOR_DIRS:
        d = REPO_ROOT / domain
        if not d.is_dir():
            continue
        pages.extend(sorted(d.rglob("index.html")))
    return pages


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Add missing canonical + OG + Twitter head tags to calculator pages."
    )
    parser.add_argument("paths", nargs="*", help="Specific paths to process")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Process all index.html files in the six calculator domain directories",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print unified diffs without writing files",
    )
    args = parser.parse_args()

    if args.all:
        targets = discover_all_calculator_pages()
    elif args.paths:
        targets = [
            Path(p) if Path(p).is_absolute() else (REPO_ROOT / p)
            for p in args.paths
        ]
    else:
        parser.error("Provide --all or one or more specific paths")
        return 2

    counters: dict[str, int] = {
        "MODIFIED": 0,
        "UNCHANGED": 0,
        "SKIP_NO_TITLE": 0,
        "SKIP_NO_DESCRIPTION": 0,
        "SKIP_NO_DESCRIPTION_LINE": 0,
        "SKIP_NO_LINE_END": 0,
    }
    skipped: list[tuple[str, Path]] = []
    modified: list[Path] = []

    for path in targets:
        if not path.exists():
            print(f"NOT_FOUND: {path}", file=sys.stderr)
            continue
        status, payload = process_file(path)
        counters[status] = counters.get(status, 0) + 1
        if status == "MODIFIED":
            modified.append(path)
            assert payload is not None
            original, new_content = payload
            rel_str = str(path.relative_to(REPO_ROOT))
            if args.dry_run:
                diff = difflib.unified_diff(
                    original.splitlines(keepends=True),
                    new_content.splitlines(keepends=True),
                    fromfile=rel_str,
                    tofile=rel_str,
                    n=2,
                )
                sys.stdout.writelines(diff)
            else:
                path.write_text(new_content, encoding="utf-8")
                print(f"MODIFIED: {rel_str}")
        elif status.startswith("SKIP"):
            skipped.append((status, path))

    print("\n=== Summary ===", file=sys.stderr)
    for k in (
        "MODIFIED",
        "UNCHANGED",
        "SKIP_NO_TITLE",
        "SKIP_NO_DESCRIPTION",
        "SKIP_NO_DESCRIPTION_LINE",
        "SKIP_NO_LINE_END",
    ):
        print(f"  {k}: {counters.get(k, 0)}", file=sys.stderr)
    if skipped:
        print("\n=== Skipped files ===", file=sys.stderr)
        for status, p in skipped:
            print(f"  [{status}] {p.relative_to(REPO_ROOT)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
