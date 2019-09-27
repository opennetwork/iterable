const baseURL = new URL(`${process.cwd()}/`, 'file://');

export async function resolve(specifier,
                              parentModuleURL = baseURL,
                              defaultResolver) {
  const url = new URL(specifier, parentModuleURL);
  console.log(url);
  if (url.pathname.endsWith("node_modules/.bin/betterer")) {
    return {
      url: url.href,
      format: "commonjs"
    };
  }
  return {
    url: url.href,
    format: 'module'
  };
}
