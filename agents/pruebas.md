# Pruebas

**TLDR:** `npm test`, `npm run test:integration` y `npm run test:e2e`. E2e va de a un worker y usa Chromium sin ventana cuando `CI` está definido; no rompas `#nombre`, `#m`, `Send` ni `#messages`.

Tres suites, cada una en su carpeta para que no se pisen:

| Comando | Qué corre |
|---|---|
| `npm test` | Mocha BDD en `test/test.js` (Chai `expect`) |
| `npm run test:integration` | Jest en `integration/**/*.test.js` |
| `npm run test:e2e` | Playwright en `e2e/`, Chromium visible, `slowMo: 1000` |

`server.js` solo hace `listen` cuando se ejecuta directo (`require.main === module`) y exporta el servidor HTTP. Los tests de integración escuchan en el puerto `0`.

Playwright usa un solo worker. El servidor reenvía cada mensaje a todos los sockets; correr e2e en paralelo mezcla los mensajes entre tests.

En GitHub Actions se ejecutan las tres suites en el trabajo `test`; `deploy` depende de ese trabajo. Chromium se instala antes de ejecutar Playwright. En CI, Playwright corre sin ventana y sin `slowMo`; localmente conserva el navegador visible y la pausa para depurar.

Selectores que no se rompen: título `Chat Socket.IO UNA`, `#nombre`, `#m`, botón `Send`, `#messages`. El estado vacío no es un `li` dentro de `#messages`. Un `<script>` se ve como texto y no abre un diálogo. Una URL de imagen aceptada queda en `img[src]`; una de YouTube, en un `iframe` de embed.
