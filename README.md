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

## VPS Setup — Single Entrypoint

All VPS config now lives in [`gambhirsharma/vps-setup`](https://github.com/gambhirsharma/vps-setup). This site only hosts a thin bootstrap that installs `git`, clones that repo, and delegates.

### One-liner (fresh VPS)

```bash
curl -fsSL https://gambhir.dev/install.sh | bash
# aliases (same file)
curl -fsSL https://gambhir.dev/vps-setup.sh | bash
curl -fsSL https://gambhir.dev/bootstrap.sh | bash
curl -fsSL https://gambhir.dev/install | bash
curl -fsSL https://gambhir.dev/nvim | bash          # legacy alias -> same
```

Options are forwarded to `vps-setup/install.sh`:

```bash
curl -fsSL https://gambhir.dev/install.sh | bash -s -- --help
curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-zsh --set-shell
curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-nvim-config  # skip nvim config
curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-vps --nvim-only  # only nvim config
```

What the bootstrap does:
1. installs `git` if missing (via `apt`/`dnf`/`yum`/`pacman`/`apk`/`zypper` + `sudo`)
2. clones `https://github.com/gambhirsharma/vps-setup.git` to `~/vps-setup` (`$VPS_SETUP_DIR`)
3. runs `~/vps-setup/install.sh` — which then runs `vps-setup.sh` (zsh/tmux/nvim binary) + `nvim-setup.sh` (minimal nvim/vim config)

Re-run/update:
```bash
cd ~/vps-setup && ./install.sh --help
cd ~/vps-setup && ./vps-setup.sh --help
cd ~/vps-setup && ./nvim-setup.sh --help
```

### VPS repo contents

`~/vps-setup` after clone:
- `install.sh` — orchestrator (runs both)
- `vps-setup.sh` — zsh, tmux, neovim binary (from official GitHub release)
- `nvim-setup.sh` — zero-plugin nvim/vim config (`~/.config/nvim/init.lua` + `~/.vimrc`)
- `minimal-init.lua` / `minimal-init.vimrc` — raw configs

Env overrides (forwarded):
```bash
VPS_SETUP_DIR=/tmp/vps-setup curl -fsSL https://gambhir.dev/install.sh | bash
NVIM_VERSION=0.11.0 curl -fsSL https://gambhir.dev/install.sh | bash
```

## Inspiration:
- Using this Template [astro-theme-vitesse](https://github.com/kieranwv/astro-theme-vitesse)
- [nexxle.dev](https://www.nexxel.dev/)
