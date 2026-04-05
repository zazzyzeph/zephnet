---
title: "Neovim Per-Environment Configs"
type: "entry"
date: 2026-04-05T10:30:46-04:00
featured_image: "https://media.zephnet.biz/neovim_config.jpg"
featured_image_alt: "screenshot of the tree bash command, showing a visual representation of the author's neovim config. it contains multiple lua files used in different environments"
tags: ["neovim", "webdev"]
---

## The Problem

I use NeoVim for my coding tasks \[and you should too ( ͡° ͜ʖ ͡°)\], but an issue i've been having is keeping two versions going for my `init.lua` config file - one for my personal webdev work and livecoding stuff, and another specifically for my day job, which I generally do inside a virtual machine.

Both of these configs share a lot of features / keymaps (I always need HTML/CSS/JS features), but I don't need SuperCollider language support for work, and conversely don't need PHP debugger configs cluttering up my personal NeoVim config.

## The Solution

My solution is to use 

1. a `.nvim_env` file, which just contains the name of the specific environment i'm in (ex. `work`, or `personal`)
2. `lua/shared.lua`, which contains the common configs, like my base vim options, colorscheme, treesitter configs for languages i'll use in both environments, etc.
3. Configs for each environment - `personal.lua` contains configs for languages I don't use for work, or paths that are hard-coded for my system. `work.lua` includes my VM-specific configs like my (PHP) XDebug or `php-cs-fixer`.
4. Rules in `init.lua` to conditionally load the above configs based on the `.nvim_env` string.

/nvim_env
```bash
personal
```

/init.lua
```lua
-- default to the 'personal' config
local env = "personal"

-- Detect environment
local marker_file = vim.fn.stdpath('config') .. '/.nvim_env'
if vim.fn.filereadable(marker_file) == 1 then
  env = vim.fn.readfile(marker_file)[1]
  if env then
    env = env:gsub('^%s*(.-)%s*$', '%1') -- trim whitespace
  end
end

-- Load shared configuration
require('shared').setup()

-- Load environment-specific configuration
if env == 'work' then
  require('work').setup()
elseif env == 'personal' then
  require('personal').setup()
end

```

/work/shared.lua
```lua
-- Shared configuration for both work and personal environments
local Z = {}

function Z.setup()
  vim.o.number = true
  vim.o.relativenumber = true
  vim.o.ignorecase = true
  -- config continues...
end

return Z

```

and `/lua/work.lua` and `/lua/personal.lua` share the same format!

## Pitfalls

You might use one plugin in multiple environments with different configurations, but their setup functions should only be run once, like `vim.lsp.config` in my case. Functions that like have to exist in the environment-specific files (`work.lua` or `personal.lua`), so some config code might be duplicated between environments.

## Conclusion

This isn't a perfect solution, but it's been working well for me. I can manage my configs via a singular git repo, and I no longer have the config-drift problem I've dealt with for several years :) Hope it's helpful!

