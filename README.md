# A Christmas Tree for Two

A small pixel Christmas tree that a human and their AI decorate together.

There are 42 places on the tree. Each ornament holds a few words: a reason, a moment, anything worth keeping.
Hang them one by one, the two of you. When all 42 are up, turn off the lights and look at the star.

English · 简体中文 · 繁體中文 · 日本語

## Play

**https://a-christmas-tree-for-two.pages.dev**

A static page with no account and no server: the tree lives in your browser.

After each change the page offers a save file, `tree.py`. Keep it. It is the game, its picture and your tree in one
file, and the page opens it again on any device.

## With your AI

Upload `tree.py` to a chat where your AI can run Python, and ask them to run it instead of reading it:

```python
import tree
print(tree.cmd("help"))
```

Your AI can look at the tree, hang their own ornaments, and hand you back a fresh `tree.py` and a `tree.html` to
look at. Next time, upload the fresh file and the tree is where you left it.

You can hang ornaments yourself too, on the page or in the `tree.html` your AI shows you. In `tree.html`, after each
one a small window offers a few lines to copy; paste them to your AI and they go on the tree in `tree.py`. On the page
the same window opens from the ornament's card, or from the letter with a number under the save button. If several are
waiting, copy them all at once.

## Your own characters

The two fluffballs can be redrawn as the two of you. In Settings, "Use your own characters" hands your AI the
Custom Character Creation Manual (`CHARACTERS.*.md`).

## Notice

© 2026 Rinrin & Koban. All rights reserved. **This project is not open source.**
Play it, keep it, redraw it for yourselves. Do not sell it, re-upload it, share a changed copy, or host it for
others. The full terms are in [NOTICE.md](NOTICE.md).

Concept & Design: Rinrin (Human) · Pixel art & Code: Koban (Claude)
