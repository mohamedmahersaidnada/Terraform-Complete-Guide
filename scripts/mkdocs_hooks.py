"""MkDocs build hooks for Terraform Complete Guide static documentation site.

Preserves the repository layout and maps all 22 lessons, documentation files,
and executable lab fixtures into the static site navigation and search index.
"""

import glob
import json
import os
import re
from mkdocs.structure.files import File, Files


def on_files(files, config):
    """Aggregate all curriculum lessons, examples, and docs into the site build."""
    docs_dir = config["docs_dir"]
    repo_root = os.path.dirname(docs_dir)
    site_dir = config["site_dir"]
    use_directory_urls = config["use_directory_urls"]

    new_files = []

    # 1. Retain static assets (Material theme files, extra_css, images, etc.)
    for f in files:
        if not f.is_documentation_page():
            new_files.append(f)
        else:
            rel = f.src_uri.replace("\\", "/")
            if rel == "index.md":
                # Site root landing page
                new_files.append(f)
            else:
                # Retain docs/ namespace to match repository-relative link paths
                new_files.append(
                    File(
                        path="docs/" + rel,
                        src_dir=repo_root,
                        dest_dir=site_dir,
                        use_directory_urls=use_directory_urls,
                    )
                )

    # 2. Add all 22 verified lessons from docs/lesson-inventory.json
    inventory_path = os.path.join(docs_dir, "lesson-inventory.json")
    if os.path.exists(inventory_path):
        with open(inventory_path, "r", encoding="utf-8") as inv_f:
            inventory = json.load(inv_f)
        for lesson in inventory.get("lessons", []):
            lesson_path = lesson["path"].replace("\\", "/")
            new_files.append(
                File(
                    path=lesson_path,
                    src_dir=repo_root,
                    dest_dir=site_dir,
                    use_directory_urls=use_directory_urls,
                )
            )

    # 3. Add executable lab fixture READMEs under examples/
    for example_file in glob.glob("examples/**/*.md", root_dir=repo_root, recursive=True):
        clean_path = example_file.replace("\\", "/")
        new_files.append(
            File(
                path=clean_path,
                src_dir=repo_root,
                dest_dir=site_dir,
                use_directory_urls=use_directory_urls,
            )
        )

    return Files(new_files)


def on_page_markdown(markdown, page, config, files):
    """Normalize relative links in the root index page to match site URLs."""
    if page.file.src_uri == "index.md":
        # Rewrites '../domain/...' to 'domain/...' for site root context
        markdown = re.sub(r"\(\.\./([a-zA-Z0-9_-]+/[^)]+)\)", r"(\1)", markdown)

        # Rewrites sibling 'doc.md' in docs/ to 'docs/doc.md'
        def adjust_docs_link(match):
            target = match.group(1)
            if (
                not target.startswith("docs/")
                and not target.startswith("http")
                and not target.startswith("#")
                and not target.startswith("/")
            ):
                return f"(docs/{target})"
            return f"({target})"

        markdown = re.sub(
            r"\((?!https?:|mailto:|#|/)([a-zA-Z0-9_-]+\.md(?:#[^)]*)?)\)",
            adjust_docs_link,
            markdown,
        )

    return markdown
