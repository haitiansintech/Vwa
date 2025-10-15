const fs = require("node:fs")
const Module = require("node:module")
const ts = require("typescript")

const defaultCompilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  resolveJsonModule: true,
  allowJs: true,
}

const originalTsExtension = Module._extensions[".ts"]
const originalTsxExtension = Module._extensions[".tsx"]

Module._extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: defaultCompilerOptions,
    fileName: filename,
    reportDiagnostics: false,
  })
  module._compile(output.outputText, filename)
}

Module._extensions[".tsx"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: { ...defaultCompilerOptions, jsx: ts.JsxEmit.React },
    fileName: filename,
    reportDiagnostics: false,
  })
  module._compile(output.outputText, filename)
}

process.on("exit", () => {
  if (originalTsExtension) {
    Module._extensions[".ts"] = originalTsExtension
  }
  if (originalTsxExtension) {
    Module._extensions[".tsx"] = originalTsxExtension
  }
})
