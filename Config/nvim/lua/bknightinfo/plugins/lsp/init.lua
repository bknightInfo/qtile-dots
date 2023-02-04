local status_ok, _ = pcall(require, "lspconfig")
if not status_ok then
  return
end

require "bknightinfo.plugins.lsp.mason"
require("bknightinfo.plugins.lsp.handlers").setup()
require "bknightinfo.plugins.lsp.null-ls"
