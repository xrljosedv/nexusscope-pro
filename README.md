<div align="center">
  <img src="./logo.svg" alt="Nexus Scope Logo" width="150" height="150">
  <h1>Nexus Scope</h1>
  <p><strong>Inspector de red avanzado y escáner de API keys para el navegador.</strong></p>
  
  [![Version](https://img.shields.io/badge/version-9.0.0-blue.svg?style=flat-square)](https://github.com/xrljosedv/nexusscope-pro)
  [![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/xrljosedv/nexusscope-pro/blob/main/LICENSE)
  [![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-lightgrey.svg?style=flat-square)]()
  [![Userscript](https://img.shields.io/badge/Userscript-Tampermonkey-orange.svg?style=flat-square)]()
</div>

---

## 📖 ¿Qué es Nexus Scope?

**Nexus Scope** es una herramienta de desarrollo ligera y potente que intercepta el tráfico de red (`fetch` y `XMLHttpRequest`) directamente en el navegador. Diseñado para desarrolladores, pentesters y entusiastas de la seguridad, Nexus Scope detecta automáticamente tokens, API keys y datos sensibles (OpenAI, AWS, Stripe, etc.) mientras filtra el ruido de la publicidad y el análisis.

A diferencia de las herramientas de red tradicionales, Nexus Scope inyecta una interfaz flotante y no invasiva que te permite auditar el tráfico en tiempo real sin salir de la página.

## ✨ Características Principales

- 🕵️ **Intercepción en tiempo real:** Captura todas las peticiones `fetch` y `XMLHttpRequest`.
- 🔑 **Escáner de secretos:** Detecta automáticamente API keys (OpenAI, AWS, Stripe, etc.) y tokens JWT.
- 🧹 **Filtro de ruido:** Ignora automáticamente peticiones de analytics, trackers y publicidad para centrarse en lo importante.
- 🎨 **UI Flotante:** Panel moderno con pestañas, fácil de ocultar y mostrar.
- 🔄 **Auto-detección:** Si el script ya está activo, un segundo clic simplemente alterna la visibilidad del panel.

## 🚀 Instalación

### Opción 1: Userscript (Recomendado)
La forma más potente de usar Nexus Scope. Se ejecuta automáticamente en todas las páginas **antes** de que carguen, capturando todo el tráfico desde el primer segundo.

1. Instala un gestor de userscripts como **Tampermonkey** o **Violentmonkey** (Disponible en Chrome, Firefox, Edge y Kiwi Browser en Android).
2. Abre el siguiente enlace para instalar el script:
   👉 **[Instalar Nexus Scope v9.0](https://cdn.jsdelivr.net/npm/nexusscope-pro@9.0.0/nexusscope-pro-9.0.user.js)**
3. Tampermonkey te pedirá confirmación. Haz clic en **Instalar**.

### Opción 2: Bookmarklet (Favoritos de Chrome)

Ideal para pruebas rápidas sin instalar extensiones.

#### 🖥️ En Chrome de Escritorio (PC/Mac):
1. Haz clic derecho en la **barra de marcadores** y selecciona **"Añadir página..."**.
2. En el campo **Nombre**, escribe: `Nexus Scope`.
3. En el campo **URL**, pega el siguiente código:
   ```javascript
   javascript:(function(){if(window.__snifffer&&typeof window.__snifffer.toggle==='function'){try{window.__snifffer.toggle()}catch(e){}return}var d=document,s=d.createElement('script');s.src='https://raw.githack.com/xrljosedv/nexusscope-pro/main/nexusscope.js';s.async=true;s.onload=function(){console.log('[NexusScope] Cargado correctamente')};s.onerror=function(){alert('Error: No se pudo cargar NexusScope.\n\nPrueba en otra página (ej. google.com).\nGitHub bloquea scripts externos por seguridad.')};var p=d.head||d.documentElement;p.appendChild(s)})();
   ```
4. Guarda el marcador. Para usarlo, simplemente haz clic en él mientras navegas por cualquier página web.

#### 📱 En Chrome para Android:
1. Abre cualquier página web (ej. `google.com`).
2. Toca la **estrella ⭐** en la barra de direcciones para guardar la página en favoritos.
3. En la ventana que aparece, toca **"Editar"**.
4. En el campo **Nombre**, escribe: `Nexus Scope`.
5. En el campo **URL**, borra todo el texto y **pega el código `javascript:...`** del paso 3 de la versión de escritorio.
6. Toca **Guardar**.
7. **Para usarlo**: Ve a la barra de direcciones, escribe `Nexus Scope` y toca la sugerencia que aparece abajo (la que tiene el icono de estrella), o ábrelo desde el menú de Marcadores.

> ⚠️ **Advertencia:** Muchos sitios web (como GitHub, Google o bancos) bloquean la carga de scripts externos mediante políticas de seguridad (CSP). Si el Bookmarklet falla con un error de carga, usa la Opción 1 (Userscript).

## 🛠️ Uso

Una vez instalado, Nexus Scope comenzará a funcionar automáticamente.

1. **Abrir/Cerrar el panel:** Haz clic en el icono flotante o ejecuta `window.__snifffer.toggle()` en la consola.
2. **Analizar peticiones:** Navega por las pestañas para ver las URLs, métodos HTTP, cabeceras y respuestas.
3. **Buscar secretos:** Las API keys detectadas se resaltarán automáticamente en la interfaz.

## ❓ Solución de Problemas (FAQ)

**1. ¿Por qué me sale "Error: No se pudo cargar NexusScope" en GitHub?**
GitHub (y otros sitios como Google o bancos) tienen políticas de seguridad muy estrictas (CSP) que bloquean la ejecución de scripts externos para proteger a sus usuarios. Esto es un mecanismo de defensa del sitio web, no un error del script. Para usar Nexus Scope en estos sitios, debes usar la **Opción 1 (Userscript con Tampermonkey)**.

**2. Instalé el Bookmarklet, pero no captura las peticiones iniciales.**
Es normal. Al usar el Bookmarklet, el script se inyecta *después* de que la página ya se ha cargado. Por lo tanto, solo capturará el tráfico que ocurra a partir de ese momento. Para capturar el tráfico desde el primer segundo (tokens iniciales, API keys de carga), usa la **Opción 1 (Userscript)**.

**3. ¿En qué navegadores móviles funciona mejor?**
Para Android, se recomienda usar **Kiwi Browser** o **Firefox**, ya que permiten instalar extensiones como Tampermonkey y ejecutar el script al inicio de la carga.

## 🧑‍💻 Autores y Créditos

Este proyecto ha sido posible gracias al trabajo de:

*   **xrljosedv** - Creador principal y desarrollador.
*   **David** - Co-creador y contribuidor.

Si deseas contribuir o reportar un error, por favor abre un *Issue* en el repositorio.

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

---
<div align="center">
  Hecho con ❤️ por <a href="https://github.com/xrljosedv">xrljosedv</a> y David
</div>
