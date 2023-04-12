-- import nvim-treesitter plugin safely
local status, treesitter = pcall(require, "nvim-treesitter.configs")
if not status then
	return
end

-- configure treesitter
treesitter.setup({
	ensure_installed = { "bash", "javascript", "json", "lua", "python", "css", "rust", "yaml", "markdown", "markdown_inline","php" }, -- one of "all" or a list of languages
	ignore_install = { "phpdoc" }, -- List of parsers to ignore installing
	highlight = {
	  enable = true, -- false will disable the whole extension
	  disable = { "css" }, -- list of language that will be disabled
	},
	indent = { enable = true, disable = { "python", "css" } },
	autotag = { enable = true },
	auto_install = true,
})
