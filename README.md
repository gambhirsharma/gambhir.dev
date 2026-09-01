# gambhir.dev
Personal website

## Screenshots
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/585369f9-e088-4da6-9346-6f979e4f65fa" />

<details>
  <summary>Gallary</summary>

**gambhir.xyz version**</br>

<img width="1440" alt="image" src="https://github.com/user-attachments/assets/611a6a5f-b826-4adc-831c-0003a7c85c96">

**Email Footer**</br>

<img width="524" height="228" alt="email-footer-signature" src="https://github.com/user-attachments/assets/2e277b75-8a81-47ae-a790-d70d79a697f5" /></br>
> footer is at [email-footer.html](./public/email-footer.html)

</details>

## VPS — Minimal Neovim Setup

Zero-plugin config for ssh/VPS. Two files: [`/minimal-init.lua`](./public/minimal-init.lua) (nvim) and [`/minimal-init.vimrc`](./public/minimal-init.vimrc) (vim). Installer backs up existing configs to `*.bak.<timestamp>`.

### One-liner

```bash
curl -fsSL https://gambhir.dev/nvim-setup.sh | bash
# short aliases
curl -fsSL https://gambhir.dev/nvim | bash
curl -fsSL https://gambhir.dev/nvim.sh | bash
```

Options:

```bash
curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --help
curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --vim-only   # only ~/.vimrc
curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --nvim-only  # only ~/.config/nvim/init.lua
curl -fsSL https://gambhir.dev/nvim-setup.sh | bash -s -- --fetch      # fetch latest from site instead of embedded
```

What it does: installs `nvim` → `~/.config/nvim/init.lua` (`$XDG_CONFIG_HOME/nvim/init.lua`) and `vim` → `~/.vimrc`, also copies to `/tmp/minimal-init.lua` / `/tmp/minimal-init.vimrc` for `nvim -u /tmp/minimal-init.lua` workflow.

### Raw files (scp / wget)

```bash
curl -fsSL https://gambhir.dev/minimal-init.lua -o ~/.config/nvim/init.lua
curl -fsSL https://gambhir.dev/minimal-init.vimrc -o ~/.vimrc
# try without installing
nvim -u /tmp/minimal-init.lua
vim -u /tmp/minimal-init.vimrc
```

### Neovim version

- Hard min `0.7` (`vim.keymap.set`, `nvim_create_autocmd`, `vim.highlight.on_yank` from `public/minimal-init.lua:35`)
- Practical min `0.10` ( `vim.diagnostic.config:78` uses `source="if_many"` / `border="rounded"` — strip to `virtual_text=true` on older)
- Tested on `v0.12.5`. `apt` on Ubuntu jammy ships `0.6`, noble ships `0.9` — install latest if needed:

```bash
curl -fsSLO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.appimage
chmod +x nvim-linux-x86_64.appimage && sudo mv nvim-linux-x86_64.appimage /usr/local/bin/nvim
nvim --version
```

`minimal-init.vimrc` works with `vim >=8.2` (nvim extensions gated behind `has('nvim')`).

## Inspiration:
- Using this Template [astro-theme-vitesse](https://github.com/kieranwv/astro-theme-vitesse)
- [nexxle.dev](https://www.nexxel.dev/)
