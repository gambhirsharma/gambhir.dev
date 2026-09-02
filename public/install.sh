#!/usr/bin/env bash
# bootstrap.sh — single entrypoint for VPS setup (hosted at https://gambhir.dev/install.sh)
# usage:
#   curl -fsSL https://gambhir.dev/install.sh | bash
#   curl -fsSL https://gambhir.dev/install.sh | bash -s -- --help
#   curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-zsh --set-shell
#   curl -fsSL https://gambhir.dev/vps-setup.sh | bash   # alias (same file)
#
# What it does:
#   1. installs git if missing (via apt/dnf/yum/pacman/apk/zypper)
#   2. clones/pulls https://github.com/gambhirsharma/vps-setup.git
#   3. runs install.sh from the clone (which runs vps-setup.sh + nvim-setup.sh)
set -euo pipefail
# never prompt for git credentials on headless VPS — fail fast and fallback to tarball
export GIT_TERMINAL_PROMPT=0
export GCM_INTERACTIVE=never

VPS_SETUP_REPO="${VPS_SETUP_REPO:-https://github.com/gambhirsharma/vps-setup.git}"
VPS_SETUP_DIR="${VPS_SETUP_DIR:-$HOME/vps-setup}"
VPS_SETUP_BRANCH="${VPS_SETUP_BRANCH:-main}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { printf "${GREEN}[bootstrap]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[bootstrap]${NC} %s\n" "$*"; }
err()  { printf "${RED}[bootstrap]${NC} %s\n" "$*" >&2; }

usage() {
  cat <<'USAGE'
bootstrap.sh — VPS setup entrypoint (thin wrapper)

Usage:
  curl -fsSL https://gambhir.dev/install.sh | bash
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- [options]
  curl -fsSL https://gambhir.dev/vps-setup.sh | bash -s -- [options]   # alias

This script:
  1. installs git if missing
  2. clones https://github.com/gambhirsharma/vps-setup.git to $VPS_SETUP_DIR
  3. runs $VPS_SETUP_DIR/install.sh with forwarded args

Options forwarded to install.sh:
  --no-zsh              skip zsh
  --no-tmux             skip tmux
  --no-nvim             skip neovim binary
  --set-shell           chsh default shell to zsh
  --no-nvim-config      skip nvim/vim config
  --nvim-only           only nvim config
  --vim-only            only vim config
  --no-vps              skip vps packages, only nvim config
  --help, -h            show this help

Env:
  VPS_SETUP_REPO        git repo url (default https://github.com/gambhirsharma/vps-setup.git)
  VPS_SETUP_DIR         clone dir (default $HOME/vps-setup)
  VPS_SETUP_BRANCH      branch to checkout (default main)
  VPS_SETUP_USE_TMP     if 1, use /tmp/vps-setup instead (for testing)
  NVIM_VERSION, NVIM_INSTALL_DIR, NVIM_BIN_LINK  (forwarded to vps-setup.sh)

Examples:
  curl -fsSL https://gambhir.dev/install.sh | bash
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-zsh --set-shell
  VPS_SETUP_DIR=/tmp/vps-setup curl -fsSL https://gambhir.dev/install.sh | bash
USAGE
}

need_sudo() {
  if [[ "$(id -u)" -eq 0 ]]; then
    SUDO=""
  else
    if ! command -v sudo >/dev/null 2>&1; then
      err "not running as root and sudo is not available — install git manually"
      exit 1
    fi
    SUDO="sudo"
  fi
}

detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    PKG_MANAGER="apt"
  elif command -v dnf >/dev/null 2>&1; then
    PKG_MANAGER="dnf"
  elif command -v yum >/dev/null 2>&1; then
    PKG_MANAGER="yum"
  elif command -v pacman >/dev/null 2>&1; then
    PKG_MANAGER="pacman"
  elif command -v apk >/dev/null 2>&1; then
    PKG_MANAGER="apk"
  elif command -v zypper >/dev/null 2>&1; then
    PKG_MANAGER="zypper"
  else
    PKG_MANAGER="none"
  fi
}

pkg_install() {
  case "$PKG_MANAGER" in
    apt)    $SUDO apt-get update -y && $SUDO apt-get install -y "$@" ;;
    dnf)    $SUDO dnf install -y "$@" ;;
    yum)    $SUDO yum install -y "$@" ;;
    pacman) $SUDO pacman -Sy --noconfirm "$@" ;;
    apk)    $SUDO apk add --no-cache "$@" ;;
    zypper) $SUDO zypper install -y "$@" ;;
    none)   err "no supported package manager (apt/dnf/yum/pacman/apk/zypper)"; return 1 ;;
  esac
}

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    info "git already installed ($(command -v git) — $(git --version))"
    return 0
  fi
  warn "git not found — installing..."
  need_sudo
  detect_pkg_manager
  info "package manager: $PKG_MANAGER"
  pkg_install git
  if ! command -v git >/dev/null 2>&1; then
    err "git install failed"
    exit 1
  fi
  info "git installed: $(git --version)"
}

download_tarball() {
  local dest="$1"
  local url="https://github.com/gambhirsharma/vps-setup/archive/${VPS_SETUP_BRANCH}.tar.gz"
  info "git clone failed or not available — downloading tarball $url"
  mkdir -p "$dest"
  if ! curl -fsSL "$url" | tar -xz --strip-components=1 -C "$dest"; then
    err "tarball download failed from $url"
    err "check if repo is public and branch '$VPS_SETUP_BRANCH' exists"
    exit 1
  fi
  # init git so future pulls work (optional)
  if command -v git >/dev/null 2>&1; then
    git -C "$dest" init -q 2>/dev/null || true
    git -C "$dest" remote add origin "$VPS_SETUP_REPO" 2>/dev/null || true
  fi
}

clone_or_update() {
  # handle VPS_SETUP_USE_TMP=1 for testing
  if [[ "${VPS_SETUP_USE_TMP:-0}" == "1" ]]; then
    VPS_SETUP_DIR="/tmp/vps-setup"
  fi

  if [[ -d "$VPS_SETUP_DIR/.git" ]]; then
    info "updating existing clone at $VPS_SETUP_DIR"
    if ! git -C "$VPS_SETUP_DIR" fetch origin "$VPS_SETUP_BRANCH" --depth 1 2>/dev/null; then
      warn "git fetch failed — re-downloading tarball"
      rm -rf "$VPS_SETUP_DIR"
      download_tarball "$VPS_SETUP_DIR"
    else
      git -C "$VPS_SETUP_DIR" checkout "$VPS_SETUP_BRANCH" 2>/dev/null || true
      git -C "$VPS_SETUP_DIR" pull --ff-only origin "$VPS_SETUP_BRANCH" 2>/dev/null || {
        warn "fast-forward pull failed — resetting to origin/$VPS_SETUP_BRANCH"
        git -C "$VPS_SETUP_DIR" reset --hard "origin/$VPS_SETUP_BRANCH" 2>/dev/null || {
          warn "git reset failed — re-downloading tarball"
          rm -rf "$VPS_SETUP_DIR"
          download_tarball "$VPS_SETUP_DIR"
        }
      }
    fi
  elif [[ -d "$VPS_SETUP_DIR" ]]; then
    warn "$VPS_SETUP_DIR exists but is not a git repo — moving to ${VPS_SETUP_DIR}.bak.$(date +%Y%m%d%H%M%S)"
    mv "$VPS_SETUP_DIR" "${VPS_SETUP_DIR}.bak.$(date +%Y%m%d%H%M%S)"
    info "cloning $VPS_SETUP_REPO -> $VPS_SETUP_DIR (branch $VPS_SETUP_BRANCH)"
    if ! git clone --branch "$VPS_SETUP_BRANCH" --depth 1 "$VPS_SETUP_REPO" "$VPS_SETUP_DIR" 2>/dev/null; then
      download_tarball "$VPS_SETUP_DIR"
    fi
  else
    info "cloning $VPS_SETUP_REPO -> $VPS_SETUP_DIR (branch $VPS_SETUP_BRANCH)"
    mkdir -p "$(dirname "$VPS_SETUP_DIR")"
    if ! git clone --branch "$VPS_SETUP_BRANCH" --depth 1 "$VPS_SETUP_REPO" "$VPS_SETUP_DIR" 2>/dev/null; then
      warn "git clone failed (no prompt — GIT_TERMINAL_PROMPT=0) — trying tarball"
      download_tarball "$VPS_SETUP_DIR"
    fi
  fi
  info "clone ready: $VPS_SETUP_DIR ($(git -C "$VPS_SETUP_DIR" rev-parse --short HEAD 2>/dev/null || echo 'unknown'))"
}

# handle --help early without needing git
for arg in "$@"; do
  case "$arg" in
    --help|-h) usage; exit 0 ;;
  esac
done

ensure_git
clone_or_update

INSTALL_SH="$VPS_SETUP_DIR/install.sh"
if [[ ! -f "$INSTALL_SH" ]]; then
  err "install.sh not found in $VPS_SETUP_DIR — repo may be outdated"
  err "try: ls -la $VPS_SETUP_DIR"
  exit 1
fi

info "running $INSTALL_SH $*"
bash "$INSTALL_SH" "$@"

echo ""
info "bootstrap done. repo at $VPS_SETUP_DIR"
echo "  cd $VPS_SETUP_DIR && ./install.sh --help   # rerun with options"
echo "  cd $VPS_SETUP_DIR && ./vps-setup.sh --help # vps only"
echo "  cd $VPS_SETUP_DIR && ./nvim-setup.sh --help # nvim config only"
