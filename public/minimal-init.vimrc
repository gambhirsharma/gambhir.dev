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
