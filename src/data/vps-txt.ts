export const vpsTxt = `# gambhir.dev/vps — VPS bootstrap

One-liner to set up any fresh VPS (Ubuntu/Debian/Fedora/Arch/Alpine):

  curl -fsSL https://gambhir.dev/install.sh | bash

Aliases (same script):

  curl -fsSL https://gambhir.dev/bootstrap.sh | bash
  curl -fsSL https://gambhir.dev/vps-setup.sh | bash

What it does:
  1. installs git if missing (apt/dnf/yum/pacman/apk/zypper)
  2. clones https://github.com/gambhirsharma/vps-setup.git to ~/vps-setup
  3. runs ~/vps-setup/install.sh (vps packages + neovim config)

Common variants:

  # help / dry-run
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --help

  # skip zsh, set default shell
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-zsh --set-shell

  # only neovim/vim config (no system packages)
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-vps

  # only nvim config
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --nvim-only

Options forwarded to install.sh:
  --no-zsh           skip zsh
  --no-tmux          skip tmux
  --no-nvim          skip neovim binary
  --set-shell        chsh default shell to zsh
  --no-nvim-config   skip nvim/vim config
  --nvim-only        only nvim config
  --vim-only         only vim config
  --no-vps           skip vps packages, only nvim config
  --help, -h         show help

Env overrides:
  VPS_SETUP_REPO     git repo url (default https://github.com/gambhirsharma/vps-setup.git)
  VPS_SETUP_DIR      clone dir (default ~/vps-setup)
  VPS_SETUP_BRANCH   branch (default main)
  VPS_SETUP_USE_TMP  if 1, use /tmp/vps-setup (for testing)

Examples:
  VPS_SETUP_DIR=/tmp/vps-setup curl -fsSL https://gambhir.dev/install.sh | bash
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --no-zsh

Source:
  https://github.com/gambhirsharma/vps-setup
  https://gambhir.dev/install.sh  (raw shell script, pipe to bash)
  https://gambhir.dev/vps         (this file, text/plain for AI/curl)

Verify:
  curl -fsSL https://gambhir.dev/install.sh | bash -s -- --help
  cat ~/vps-setup/install.sh
`
