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
