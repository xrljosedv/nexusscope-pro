try {
  window.NexusScope = window.__snifffer || {};
  window.NexusScopePro = window.NexusScope;
  if (typeof window.NexusScope.init !== "function") {
    window.NexusScope.init = function () { return window.NexusScope; };
  }
} catch (e) {}