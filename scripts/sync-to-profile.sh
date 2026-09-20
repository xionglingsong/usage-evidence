#!/bin/bash
# usage-evidence 主仓 → Ekko profile 同步脚本
# 用法：./scripts/sync-to-profile.sh
# 只同步 skill 运行必需的文件，不同步 post/ promo/ README/ 本脚本自身

set -e

MASTER="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="$HOME/.hermes-web-ui/.ekko/skills/default/writing/usage-evidence"

echo "master:  $MASTER"
echo "profile: $PROFILE"

if [ ! -d "$MASTER" ]; then
  echo "ERROR: master dir not found: $MASTER"
  exit 1
fi

if [ -L "$PROFILE" ]; then
  echo "ERROR: profile is a symlink, refusing to overwrite. Remove it first."
  exit 1
fi

# 重建 profile 目录（确保干净）
rm -rf "$PROFILE"
mkdir -p "$PROFILE/references"
mkdir -p "$PROFILE/scripts"

# 同步核心文件
cp "$MASTER/SKILL.md" "$PROFILE/SKILL.md"
cp "$MASTER/references/sources.md" "$PROFILE/references/sources.md"
cp "$MASTER/scripts/ngram.mjs" "$PROFILE/scripts/ngram.mjs"
[ -f "$MASTER/.ekko-skill.json" ] && cp "$MASTER/.ekko-skill.json" "$PROFILE/.ekko-skill.json"

echo "✓ synced"
echo "  SKILL.md           $(wc -c < "$PROFILE/SKILL.md") bytes"
echo "  references/sources.md $(wc -c < "$PROFILE/references/sources.md") bytes"
echo "  scripts/ngram.mjs  $(wc -c < "$PROFILE/scripts/ngram.mjs") bytes"
