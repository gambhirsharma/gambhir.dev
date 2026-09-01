#!/usr/bin/env bash
# nvim-setup.sh — minimal nvim/vim config installer for VPS/ssh
# usage:
#   curl -fsSL https://gambhir.dev/nvim-setup.sh | bash
#   curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --vim-only
#   curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --nvim-only
#   curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --help
#
# sources (if --fetch is used):
#   https://gambhir.dev/minimal-init.lua  -> $XDG_CONFIG_HOME/nvim/init.lua
#   https://gambhir.dev/minimal-init.vimrc -> ~/.vimrc
# local overrides (dev):
#   /tmp/minimal-init.lua
#   /tmp/minimal-init.vimrc
set -euo pipefail

BASE_URL="${BASE_URL:-https://gambhir.dev}"
NVIM_SRC_URL="${NVIM_SRC:-$BASE_URL/minimal-init.lua}"
VIM_SRC_URL="${VIM_SRC:-$BASE_URL/minimal-init.vimrc}"
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
NVIM_DEST="$XDG_CONFIG_HOME/nvim/init.lua"
VIM_DEST="$HOME/.vimrc"

DO_NVIM=1
DO_VIM=1
FETCH=0
FORCE=0
USE_TMP=0

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

info()  { printf "${GREEN}[nvim-setup]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[nvim-setup]${NC} %s\n" "$*"; }
err()   { printf "${RED}[nvim-setup]${NC} %s\n" "$*" >&2; }

usage() {
  cat <<'USAGE'
nvim-setup.sh — install minimal nvim/vim config

Usage:
  curl -fsSL https://gambhir.dev/nvim-setup.sh | bash
  curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- [options]

Options:
  --nvim-only     only install nvim config ($XDG_CONFIG_HOME/nvim/init.lua)
  --vim-only      only install vim config (~/.vimrc)
  --no-nvim       skip nvim
  --no-vim        skip vim
  --fetch         fetch latest from https://gambhir.dev/minimal-init.* instead of embedded
  --use-tmp       use /tmp/minimal-init.lua and /tmp/minimal-init.vimrc if present (dev)
  --force, -f     overwrite without backup prompt (still creates .bak)
  --help, -h      show this help

Env:
  BASE_URL        override base url (default https://gambhir.dev)
  XDG_CONFIG_HOME override nvim config parent (default ~/.config)

Files installed:
  nvim: $XDG_CONFIG_HOME/nvim/init.lua  (or ~/.config/nvim/init.lua)
  vim:  ~/.vimrc

Backup:
  existing files are backed up to <file>.bak.<timestamp> before overwrite
USAGE
}

backup_if_exists() {
  local dest="$1"
  if [[ -f "$dest" ]]; then
    local bak="${dest}.bak.$(date +%Y%m%d%H%M%S)"
    warn "backing up $dest -> $bak"
    cp -a "$dest" "$bak"
  fi
}

ensure_dir() {
  mkdir -p "$(dirname "$1")"
}

fetch_url() {
  local url="$1" dest="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$dest" "$url"
  else
    err "need curl or wget to --fetch"
    return 1
  fi
}

# --- embedded configs (used by default, so curl|bash is single-request) ---
write_embedded_nvim() {
  local dest="$1"
  cat > "$dest" <<'LUA'
-- minimal-init.lua — ssh version, no plugins, only changed defaults
-- use: scp /tmp/minimal-init.lua user@host:~/.config/nvim/init.lua
--   or: nvim -u /tmp/minimal-init.lua

vim.g.mapleader = " "
vim.g.maplocalleader = ","

vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = "a"
vim.opt.spell = true
vim.opt.spelllang = "en_us"
vim.opt.showmode = false
vim.opt.clipboard = "unnamedplus" -- remove if server has no clipboard provider
vim.opt.breakindent = true
vim.opt.undofile = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.signcolumn = "yes"
vim.opt.updatetime = 250
vim.opt.timeoutlen = 300
vim.opt.splitright = true
vim.opt.splitbelow = true
vim.opt.list = true
vim.opt.listchars = { tab = "» ", trail = "·", nbsp = "␣" }
vim.opt.inccommand = "split"
vim.opt.cursorline = true
vim.opt.termguicolors = true
vim.opt.scrolloff = 10
vim.opt.hlsearch = true
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true

vim.api.nvim_create_autocmd("TextYankPost", {
  group = vim.api.nvim_create_augroup("yank-hl", { clear = true }),
  callback = function() vim.highlight.on_yank() end,
})
vim.api.nvim_create_autocmd("TermOpen", {
  group = vim.api.nvim_create_augroup("custom-term-open", { clear = true }),
  callback = function()
    vim.opt_local.number = false
    vim.opt_local.relativenumber = false
    vim.opt_local.scrolloff = 0
  end,
})

local map = vim.keymap.set
map("n", "<Esc>", "<cmd>nohlsearch<CR>", { desc = "Clear search highlight" })
map("n", "[d", vim.diagnostic.goto_prev, { desc = "Prev diagnostic" })
map("n", "]d", vim.diagnostic.goto_next, { desc = "Next diagnostic" })
map("n", "<leader>df", vim.diagnostic.open_float, { desc = "Show diagnostic float" })
map("n", "<leader>qd", vim.diagnostic.setloclist, { desc = "Diagnostic quickfix" })
map("n", "<C-h>", "<C-w><C-h>", { desc = "Move to left window" })
map("n", "<C-l>", "<C-w><C-l>", { desc = "Move to right window" })
map("n", "<C-j>", "<C-w><C-j>", { desc = "Move to lower window" })
map("n", "<C-k>", "<C-w><C-k>", { desc = "Move to upper window" })
map("t", "<Esc><Esc>", "<C-\\><C-n>", { desc = "Exit terminal mode" })
map("t", "<C-h>", "<C-\\><C-n><C-w>h")
map("t", "<C-j>", "<C-\\><C-n><C-w>j")
map("t", "<C-k>", "<C-\\><C-n><C-w>k")
map("t", "<C-l>", "<C-\\><C-n><C-w>l")
map("i", "jj", "<Esc>", { desc = "jj → Normal mode" })
map("n", "<leader>qq", ":q!<CR>", { desc = "Quit without save" })
map("v", "<leader>y", '"+y', { desc = "Copy to system clipboard" })
map("n", "<leader>ww", "<C-w>p", { desc = "Other window" })
map("n", "<leader>wd", "<C-w>c", { desc = "Delete window" })
map("n", "<leader>w-", "<C-w>s", { desc = "Split below" })
map("n", "<leader>w|", "<C-w>v", { desc = "Split right" })
map("n", "<C-Up>", "<cmd>resize +2<CR>", { desc = "Increase height" })
map("n", "<C-Down>", "<cmd>resize -2<CR>", { desc = "Decrease height" })
map("n", "<C-Left>", "<cmd>vertical resize -2<CR>", { desc = "Decrease width" })
map("n", "<C-Right>", "<cmd>vertical resize +2<CR>", { desc = "Increase width" })
map("v", "K", ":move '<-2<CR>gv=gv", { desc = "Move selection up" })
map("v", "J", ":move '>+1<CR>gv=gv", { desc = "Move selection down" })
map("n", "<leader>fp", function() vim.fn.setreg("+", vim.fn.expand("%:p")) end, { desc = "Copy file path" })

vim.diagnostic.config({
  virtual_text = { source = "if_many", prefix = "●" },
  severity_sort = true,
  float = { border = "rounded", source = "if_many" },
})
LUA
}

write_embedded_vim() {
  local dest="$1"
  cat > "$dest" <<'VIMRC'
" minimal-init.vimrc — ssh version, no plugins, only changed defaults
" use: scp /tmp/minimal-init.vimrc user@host:~/.vimrc
"   or: vim -u /tmp/minimal-init.vimrc

let mapleader = " "
let maplocalleader = ","

set number
set relativenumber
set mouse=a
set spell
set spelllang=en_us
set noshowmode
set clipboard=unnamedplus
set breakindent
set undofile
set ignorecase
set smartcase
set signcolumn=yes
set updatetime=250
set timeoutlen=300
set splitright
set splitbelow
set list
set listchars=tab:»\ ,trail:·,nbsp:␣
set cursorline
set termguicolors
set scrolloff=10
set hlsearch
set tabstop=4
set shiftwidth=4
set expandtab

" highlight yanked text (Neovim 0.11+ has this built-in; vim needs no plugin)
if has('nvim')
  augroup yank-hl
    autocmd!
    autocmd TextYankPost * silent! lua vim.highlight.on_yank()
  augroup END
  augroup custom-term-open
    autocmd!
    autocmd TermOpen * setlocal nonumber norelativenumber scrolloff=0
  augroup END
endif

" keymaps
nnoremap <Esc> <cmd>nohlsearch<CR>
nnoremap [d <cmd>lua vim.diagnostic.goto_prev()<CR>
nnoremap ]d <cmd>lua vim.diagnostic.goto_next()<CR>
nnoremap <leader>df <cmd>lua vim.diagnostic.open_float()<CR>
nnoremap <leader>qd <cmd>lua vim.diagnostic.setloclist()<CR>

nnoremap <C-h> <C-w><C-h>
nnoremap <C-l> <C-w><C-l>
nnoremap <C-j> <C-w><C-j>
nnoremap <C-k> <C-w><C-k>

if has('nvim')
  tnoremap <Esc><Esc> <C-\><C-n>
  tnoremap <C-h> <C-\><C-n><C-w>h
  tnoremap <C-j> <C-\><C-n><C-w>j
  tnoremap <C-k> <C-\><C-n><C-w>k
  tnoremap <C-l> <C-\><C-n><C-w>l
endif

inoremap jj <Esc>

nnoremap <leader>qq :q!<CR>
vnoremap <leader>y "+y
nnoremap <leader>ww <C-w>p
nnoremap <leader>wd <C-w>c
nnoremap <leader>w- <C-w>s
nnoremap <leader>w\| <C-w>v

nnoremap <C-Up> <cmd>resize +2<CR>
nnoremap <C-Down> <cmd>resize -2<CR>
nnoremap <C-Left> <cmd>vertical resize -2<CR>
nnoremap <C-Right> <cmd>vertical resize +2<CR>

vnoremap K :move '<-2<CR>gv=gv
vnoremap J :move '>+1<CR>gv=gv

" copy file path to clipboard
nnoremap <leader>fp <cmd>let @+ = expand('%:p')<CR>

if has('nvim')
  lua << EOF
vim.diagnostic.config({
  virtual_text = { source = "if_many", prefix = "●" },
  severity_sort = true,
  float = { border = "rounded", source = "if_many" },
})
EOF
endif
VIMRC
}

install_nvim() {
  info "installing nvim config -> $NVIM_DEST"
  ensure_dir "$NVIM_DEST"
  backup_if_exists "$NVIM_DEST"
  if [[ "$USE_TMP" -eq 1 && -f /tmp/minimal-init.lua ]]; then
    info "using /tmp/minimal-init.lua"
    cp -a /tmp/minimal-init.lua "$NVIM_DEST"
  elif [[ "$FETCH" -eq 1 ]]; then
    info "fetching $NVIM_SRC_URL"
    local tmp
    tmp="$(mktemp)"
    fetch_url "$NVIM_SRC_URL" "$tmp"
    cp -a "$tmp" "$NVIM_DEST"
    rm -f "$tmp"
  else
    write_embedded_nvim "$NVIM_DEST"
  fi
  # keep /tmp copy for 'nvim -u /tmp/minimal-init.lua' workflow as requested
  mkdir -p /tmp 2>/dev/null || true
  cp -a "$NVIM_DEST" /tmp/minimal-init.lua 2>/dev/null || true
  info "nvim config installed at $NVIM_DEST (also copied to /tmp/minimal-init.lua)"
  if command -v nvim >/dev/null 2>&1; then
    info "nvim $(nvim --version | head -n1) detected"
  else
    warn "nvim not found in PATH — config will be used next time you install nvim"
  fi
}

install_vim() {
  info "installing vim config -> $VIM_DEST"
  backup_if_exists "$VIM_DEST"
  if [[ "$USE_TMP" -eq 1 && -f /tmp/minimal-init.vimrc ]]; then
    info "using /tmp/minimal-init.vimrc"
    cp -a /tmp/minimal-init.vimrc "$VIM_DEST"
  elif [[ "$FETCH" -eq 1 ]]; then
    info "fetching $VIM_SRC_URL"
    local tmp
    tmp="$(mktemp)"
    fetch_url "$VIM_SRC_URL" "$tmp"
    cp -a "$tmp" "$VIM_DEST"
    rm -f "$tmp"
  else
    write_embedded_vim "$VIM_DEST"
  fi
  mkdir -p /tmp 2>/dev/null || true
  cp -a "$VIM_DEST" /tmp/minimal-init.vimrc 2>/dev/null || true
  info "vim config installed at $VIM_DEST (also copied to /tmp/minimal-init.vimrc)"
  if command -v vim >/dev/null 2>&1; then
    info "vim $(vim --version | head -n1 | head -c 80) detected"
  fi
}

# parse args
for arg in "$@"; do
  case "$arg" in
    --nvim-only) DO_NVIM=1; DO_VIM=0 ;;
    --vim-only)  DO_NVIM=0; DO_VIM=1 ;;
    --no-nvim)   DO_NVIM=0 ;;
    --no-vim)    DO_VIM=0 ;;
    --fetch)     FETCH=1 ;;
    --use-tmp)   USE_TMP=1 ;;
    --force|-f)  FORCE=1 ;;
    --help|-h)   usage; exit 0 ;;
    *) err "unknown option: $arg (see --help)"; exit 1 ;;
  esac
done

if [[ "$DO_NVIM" -eq 0 && "$DO_VIM" -eq 0 ]]; then
  err "nothing to do (both nvim and vim disabled)"
  exit 1
fi

# main
info "base url: $BASE_URL"
[[ "$FETCH" -eq 1 ]] && info "mode: fetch from network" || info "mode: embedded (no second fetch needed)"
[[ "$USE_TMP" -eq 1 ]] && info "mode: prefer /tmp/minimal-init.* if present"

if [[ "$DO_NVIM" -eq 1 ]]; then install_nvim; fi
if [[ "$DO_VIM" -eq 1 ]]; then install_vim; fi

info "done. verify with:"
if [[ "$DO_NVIM" -eq 1 ]]; then
  echo "  nvim -u /tmp/minimal-init.lua   # tmp alias"
  echo "  nvim                            # uses $NVIM_DEST"
fi
if [[ "$DO_VIM" -eq 1 ]]; then
  echo "  vim -u /tmp/minimal-init.vimrc  # tmp alias"
  echo "  vim                             # uses $VIM_DEST"
fi
echo ""
echo "  curl -fsSL $BASE_URL/nvim-setup.sh | bash -s -- --help   # options"
