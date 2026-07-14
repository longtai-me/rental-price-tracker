const fs = require('fs');
const file = 'src/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `    <html lang="zh-TW">
      <body>`,
  `    <html lang="zh-TW">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: \`
              if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
                try {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (string) => string,
                    createScript: (string) => string,
                    createScriptURL: (string) => string,
                  });
                } catch (e) {}
              }
            \`
          }}
        />
      </head>
      <body>`
);

fs.writeFileSync(file, code);
