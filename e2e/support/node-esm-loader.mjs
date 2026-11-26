/**
 * Resolve as importações de diretório do build ESM do Material UI.
 *
 * `@mui/icons-material/esm` importa `@mui/material/utils` sem `/index.js`,
 * forma que o Node não aceita fora de um bundler. Os testes de lógica pura
 * rodam direto no Node, então este hook completa o caminho quando o Node
 * recusa a importação de diretório. Registrado via `register-loader.mjs`.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const isDirImport = error?.code === 'ERR_UNSUPPORTED_DIR_IMPORT';
    const isMissingExtension = error?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('@mui/');
    if (!isDirImport && !isMissingExtension) throw error;
    const candidates = [`${specifier}/index.js`, `${specifier}.js`];
    for (const candidate of candidates) {
      try {
        return await nextResolve(candidate, context);
      } catch {
        // tenta o próximo
      }
    }
    throw error;
  }
}
