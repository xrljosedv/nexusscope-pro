# ⬡ NexusScope Pro

**Network Inspector Pro** · multi-token · API keys de pago (IA, pagos, SaaS) · antibot · captchas · PII · security · deep scan · minería JS/TS · descarga de fuentes · fingerprint · CORS · SSRF · runtime · playground · Tech Atlas · exportación JSON/MD.

Creado por **David Zuniga** · Editado y mejorado por **José**.

Funciona de 3 formas:

1. **CDN vía npm (jsDelivr)** — como eruda
2. **CDN vía GitHub (jsDelivr GH)**
3. **Userscript (Tampermonkey/Violentmonkey)**

---

## 🚀 Uso por CDN (estilo eruda)

Carga el script y **se inicia automáticamente**:

```html
<script src="https://cdn.jsdelivr.net/npm/nexusscope-pro@9"></script>
```

O versión fija exacta:

```html
<script src="https://cdn.jsdelivr.net/npm/nexusscope-pro@9.0.0"></script>
```

O con `init()` explícito (idéntico a `eruda.init();`):

```html
<script src="https://cdn.jsdelivr.net/npm/nexusscope-pro"></script>
<script>NexusScope.init();</script>
```

Alternativas de CDN:

```html
<script src="https://unpkg.com/nexusscope-pro"></script>
<script src="https://cdn.jsdelivr.net/gh/xrljosedv/nexusscope-pro@main/nexusscope.js"></script>
```

## 🧩 Uso como userscript

Instala [Tampermonkey](https://www.tampermonkey.net/) y crea un script nuevo con el contenido de `nexusscope-pro-9.0.user.js`, o instala directo desde la URL del CDN (termina en `.user.js`):

```
https://cdn.jsdelivr.net/npm/nexusscope-pro@9.0.0/nexusscope-pro-9.0.user.js
```

## 🛠️ API (consola del navegador)

Una vez cargado, disponible como `NexusScope` (alias: `window.__snifffer`):

| Método | Descripción |
| --- | --- |
| `NexusScope.init()` | Inicializa y devuelve la instancia |
| `NexusScope.toggle()` | Muestra/oculta el panel |
| `NexusScope.report()` | Reporte completo (objeto JS) |
| `NexusScope.export()` | Reporte completo en JSON (string) |
| `NexusScope.exportRaw()` | Entradas crudas del store en JSON |
| `NexusScope.plan()` | Reporte en Markdown |
| `NexusScope.scan()` | Escanea el DOM en busca de secretos/PII |
| `NexusScope.recon()` | Reconocimiento de red |
| `NexusScope.deep()` / `deepScan()` | Deep scan |
| `NexusScope.mine()` | Minería de bundles JS/TS |
| `NexusScope.tokens()` | Colección de tokens |
| `NexusScope.decode()` | Decoder inteligente |
| `NexusScope.beautify()` | Beautifier de JS |

Ejemplo:

```js
NexusScope.toggle();
console.log(NexusScope.report());
```

## 📦 Publicar en npm (por primera vez)

Desde la carpeta del paquete:

```bash
npm login
npm publish
```

> Si el nombre `nexusscope-pro` estuviera tomado, cámbialo en `package.json`
> (por ejemplo `nexusscope-projs` o un scope `@tunombre/nexusscope-pro`)
> y publica con `npm publish --access public` si usas scope.

Verifica que quedó publicado:

```bash
npm view nexusscope-pro
```

A los pocos minutos funcionará:

```
https://cdn.jsdelivr.net/npm/nexusscope-pro
```

## 🗂️ Subir a GitHub

```bash
git init
git add .
git commit -m "NexusScope Pro 9.0"
git branch -M main
git remote add origin https://github.com/xrljosedv/nexusscope-pro.git
git push -u origin main
```

Con eso también sirve por jsDelivr vía GitHub:

```
https://cdn.jsdelivr.net/gh/xrljosedv/nexusscope-pro/nexusscope.js
```

Y Tampermonkey puede instalarlo desde:

```
https://cdn.jsdelivr.net/gh/xrljosedv/nexusscope-pro@main/nexusscope-pro-9.0.user.js
```

## 📁 Estructura del paquete

```
nexusscope-pro/
├── package.json                  # metadatos npm · main: nexusscope.js
├── nexusscope.js                 # build principal (CDN, se auto-inicia)
├── nexusscope-pro-9.0.user.js    # userscript original (Tampermonkey)
├── README.md
├── LICENSE                        # MIT
└── .gitignore
```

## ⚠️ Aviso

Herramienta de auditoría para usar **solo en sitios y cuentas de tu propiedad**
o con autorización explícita. El uso indebido es responsabilidad del usuario.

## 📄 Licencia

MIT © 2026 David Zuniga (creador) · José (editor)# nexusscope-pro
