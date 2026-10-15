// ==UserScript==
// @name         ⬡ NexusScope Pro
// @namespace    nexusscope
// @version      9.0
// @description  Network Inspector Pro · multi-token · API keys de pago (IA, pagos, SaaS) · antibot · captchas · PII · security · deep scan · mineria JS/TS (js, mjs, cjs, chunks, rutas de router) · descarga de fuentes · fingerprint · CORS · SSRF · runtime · playground · Tech Atlas · JSON/MD — creado por David Zuniga, editado y mejorado por José
// @author       David Zuniga (creador) · Editado y mejorado por José
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==
(function () {
  "use strict";
  if (window.__snifffer && window.__snifffer.__ui) { try { window.__snifffer.toggle(); } catch (e) {} return; }
  var START = Date.now();
  var ORIG_FETCH = (window.fetch && window.fetch.bind) ? window.fetch.bind(window) : window.fetch;
  var refreshUI = null;

  var STATIC_EXT = /\.(css|woff2?|ttf|eot|svg|ico|jpe?g|png|gif|webp|avif|bmp|map)(\?|$)/i;
  var JS_BUNDLE_EXT = /\.(mjs|cjs|jsx?|tsx?|chunk\.js|bundle\.js)(\?|$)/i;

  // ═══════════════════════════════════════════════════════════
  //  NOISE
  // ═══════════════════════════════════════════════════════════
  var NOISE_DOMAINS = [
    /google-analytics\.com/i, /googletagmanager\.com/i, /analytics\.google\.com/i,
    /segment\.(io|com)/i, /mixpanel\.com/i, /amplitude\.com/i, /heap\.(io|com)/i,
    /plausible\.io/i, /matomo\./i, /posthog\.com/i, /doubleclick\.net/i,
    /googlesyndication\.com/i, /amazon-adsystem/i, /outbrain\.com/i, /taboola\.com/i,
    /criteo\.(com|net)/i, /adnxs\.com/i, /facebook\.com\/tr/i, /facebook\.net/i,
    /connect\.facebook/i, /bat\.bing\.com/i, /sc-static\.net/i, /sentry\.io/i,
    /bugsnag\.com/i, /datadoghq\.com/i, /newrelic\.com/i, /logrocket\.com/i,
    /fullstory\.com/i, /clarity\.ms/i, /hotjar\.com/i, /crisp\.chat/i,
    /intercom\.(io|com)/i, /drift\.com/i, /tawk\.to/i, /zendesk\.com/i, /zdassets\.com/i,
    /onesignal\.com/i, /branch\.io/i, /appsflyer\.com/i, /hubspot\.(com|net)/i,
    /klaviyo\.com/i, /fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i, /typekit\.net/i,
    /fontawesome/i, /cookiebot\.com/i, /onetrust\.com/i, /cookieconsent/i,
    /cdn-cgi\//i, /recaptcha\/api/i, /recaptcha\/enterprise/i,
    /scorecardresearch\.com/i, /optimizely\.com/i, /abtasty\.com/i, /vwo\.com/i,
    /adtrafficquality\.google/i, /adservice\.google/i,
    /cloudflareinsights\.com/i, /static\.cloudflareinsights/i, /google\.com\/recaptcha/i,
    /gstatic\.com\/recaptcha/i, /cdn\.jsdelivr\.net\/npm\/shareon/i,
    /kissmetrics\.com/i, /quantcast\.com/i, /quantserve\.com/i,
    /chartbeat\.(com|net)/i, /parsely\.com/i, /nr-data\.net/i, /pingdom\.net/i,
    /speedcurve\.com/i, /msecnd\.net/i, /statcounter\.com/i, /histats\.com/i,
    /yandex\.ru\/metrika/i, /mc\.yandex\.ru/i, /vk\.com\/rtrg/i, /top-fwz1\.mail\.ru/i,
    /trustpilot\.com/i, /yotpo\.com/i, /bazaarvoice\.com/i, /powerreviews\.com/i,
    /rfihub\.com/i, /turn\.com/i, /casalemedia\.com/i, /rubiconproject\.com/i,
    /pubmatic\.com/i, /openx\.net/i, /indexexchange\.com/i, /sharethrough\.com/i,
    /gumgum\.com/i, /spotxchange\.com/i, /smartadserver\.com/i, /adform\.net/i,
    /adsrvr\.org/i, /33across\.com/i, /crwdcntrl\.net/i, /mathtag\.com/i, /agkn\.com/i,
    /demdex\.net/i, /omtrdc\.net/i, /everesttech\.net/i, /2o7\.net/i, /adobedtm\.com/i
  ];
  function isNoise(u) { for (var i = 0; i < NOISE_DOMAINS.length; i++) if (NOISE_DOMAINS[i].test(u)) return true; return false; }

  var NOISE_CATEGORIES = {
    analytics: /google-analytics|googletagmanager|analytics|segment\.|mixpanel|amplitude|heap\.|posthog|plausible|matomo|piwik|umami|chartbeat|parsely|statcounter|histats|metrika|msecnd/i,
    ads: /doubleclick|adsense|adservice|googlesyndication|amazon-adsystem|outbrain|taboola|criteo|appnexus|adnxs|moatads|adtrafficquality|pubmatic|openx|indexexchange|rubiconproject|casalemedia|sharethrough|gumgum|spotxchange|smartadserver|adform|adsrvr|33across|demdex|omtrdc|everesttech|2o7|adobedtm|rfihub|turn\.com/i,
    tracking: /facebook\.com\/tr|facebook\.net|twitter\.com\/i|linkedin|pinterest|snap\.com|reddit\.com\/pixel|bat\.bing|sc-static|crwdcntrl|mathtag|agkn/i,
    errors: /sentry\.io|bugsnag|rollbar|datadoghq|newrelic|logrocket|fullstory|clarity\.ms|hotjar|smartlook|nr-data/i,
    chat: /crisp\.chat|intercom|drift\.com|tawk\.to|zendesk|zdassets|tidio/i,
    fonts: /fonts\.googleapis|fonts\.gstatic|typekit|fontawesome/i,
    marketing: /onesignal|braze|mailchimp|hubspot|klaviyo|branch\.io|appsflyer|yotpo|bazaarvoice|powerreviews|trustpilot/i,
    consent: /cookiebot|onetrust|cookieconsent|trustarc|iubenda|quantcast|kissmetrics/i,
    cloudflare: /cloudflareinsights|cdn-cgi/i,
    yandex: /yandex\.ru|mc\.yandex|vk\.com/i
  };
  function categorizeNoise(url) { for (var k in NOISE_CATEGORIES) if (NOISE_CATEGORIES[k].test(url)) return k; return "other"; }

  // ═══════════════════════════════════════════════════════════
  //  SECRET PATTERNS (base + v7.1)
  // ═══════════════════════════════════════════════════════════
  var SECRET_PATTERNS = [
    { name: "AWS Access Key", re: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, sev: "critical" },
    { name: "AWS Secret Key", re: /(?:aws[_-]?(?:secret|access)[_-]?(?:access[_-]?)?key|aws_secret_access_key)["']?\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, sev: "critical", group: 1 },
    { name: "AWS Session Token", re: /(?:aws[_-]?session[_-]?token|AWS_SESSION_TOKEN)["']?\s*[:=]\s*["']?(FwoGZXIvYXdz[A-Za-z0-9+/=]{100,})/g, sev: "critical", group: 1 },
    { name: "AWS Cognito", re: /\b[a-z0-9-]+\.auth\.[a-z0-9-]+\.amazoncognito\.com\/[a-z0-9-]+/gi, sev: "high" },
    { name: "AWS S3 Bucket", re: /[a-zA-Z0-9_-]{2,}\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com/gi, sev: "medium" },
    { name: "GCP Service Account", re: /"type"\s*:\s*"service_account"/g, sev: "critical" },
    { name: "GCP API Key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g, sev: "high" },
    { name: "GCP OAuth Client", re: /\b[0-9]{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com\b/g, sev: "medium" },
    { name: "Google OAuth Token", re: /\bya29\.[0-9A-Za-z_-]{20,}/g, sev: "high" },
    { name: "Azure Storage Conn", re: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{40,}/g, sev: "critical" },
    { name: "Azure SAS Token", re: /\?sv=\d{4}-\d{2}-\d{2}&(?:ss|srt|sp|se|st|spr|sig)=[^"'\s&]+(&[a-z]+=[^"'\s&]+)+/gi, sev: "critical" },
    { name: "Azure Tenant/Client", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b(?=.*(?:tenant|client[_-]?id))/gi, sev: "medium" },
    { name: "Cloudflare API Token", re: /\b[A-Za-z0-9_-]{40}\b(?=.*cloudflare)/gi, sev: "high" },
    { name: "Cloudflare Global API", re: /(?:cloudflare|cf)[_-]?(?:global[_-]?)?api[_-]?key["']?\s*[:=]\s*["']?([a-f0-9]{37})["']?/gi, sev: "critical", group: 1 },
    { name: "DigitalOcean Token", re: /\bdop_v1_[a-f0-9]{64}\b/g, sev: "critical" },
    { name: "DigitalOcean Spaces", re: /\b(?:spaces?_?key|DO_SPACES_KEY)["']?\s*[:=]\s*["']?([A-Z0-9]{20})["']?/gi, sev: "high", group: 1 },
    { name: "Linode Token", re: /\b[a-f0-9]{64}\b(?=.*linode)/gi, sev: "high" },
    { name: "Vultr API Key", re: /(?:vultr)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([A-Z0-9]{36})["']?/gi, sev: "high", group: 1 },
    { name: "Hetzner Token", re: /\b[A-Za-z0-9]{32,64}\b(?=.*hetzner)/gi, sev: "high" },
    { name: "Oracle Cloud", re: /(?:oci|oracle)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([A-Za-z0-9+/=]{40,})["']?/gi, sev: "critical", group: 1 },
    { name: "Alibaba Access Key", re: /\bLTAI[A-Za-z0-9]{16,20}\b/g, sev: "critical" },
    { name: "Tencent SecretId", re: /\bAKID[A-Za-z0-9]{13,20}\b/g, sev: "critical" },
    { name: "Netlify Token", re: /\bnfp_[A-Za-z0-9]{40,}\b/g, sev: "high" },
    { name: "Vercel Token", re: /\bvercel_[A-Za-z0-9]{24,}\b/g, sev: "high" },
    { name: "Heroku API Key", re: /(?:heroku)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})["']?/gi, sev: "critical", group: 1 },
    { name: "Fly.io Token", re: /\bFlyV1 [A-Za-z0-9_=.-]{80,}/g, sev: "critical" },
    { name: "Railway Token", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*railway)/gi, sev: "high" },
    { name: "Render Token", re: /\brnd_[A-Za-z0-9]{24,}\b/g, sev: "high" },
    { name: "Terraform Cloud", re: /\b[a-zA-Z0-9]{14}\.atlasv1\.[a-zA-Z0-9]{60,}/g, sev: "critical" },
    { name: "Pulumi Token", re: /\bpul-[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Kubernetes Secret", re: /(?:apiVersion:\s*v1[\s\S]{0,80}kind:\s*Secret|kind:\s*Secret[\s\S]{0,80}data:)/g, sev: "critical" },
    { name: "K8s Service Token", re: /eyJhbGciOiJSUzI1NiIsImtpZCI6[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{100,}/g, sev: "critical" },
    { name: "Docker Registry Auth", re: /"auth"\s*:\s*"[A-Za-z0-9+/=]{40,}"/g, sev: "critical" },
    { name: "Doppler Token", re: /\bdp\.pt\.[A-Za-z0-9_-]{40,}/g, sev: "critical" },
    { name: "Vault Token", re: /\b(?:hvs|hvb|s)\.[A-Za-z0-9_-]{24,}/g, sev: "critical" },
    { name: "1Password Connect", re: /\bops_[A-Za-z0-9+/=]{40,}/g, sev: "critical" },
    { name: "OVH Consumer Key", re: /\b[a-zA-Z0-9]{32}\b(?=.*ovh)/gi, sev: "high" },
    { name: "Scaleway Token", re: /(?:scaleway)[_-]?(?:token|secret)["']?\s*[:=]\s*["']?([A-Fa-f0-9-]{36})["']?/gi, sev: "high", group: 1 },
    { name: "UpCloud API", re: /(?:upcloud)[_-]?(?:api[_-]?)?(?:token|key)["']?\s*[:=]\s*["']?([A-Z0-9]{24})["']?/gi, sev: "high", group: 1 },
    { name: "IBM Cloud API Key", re: /\b[a-zA-Z0-9_-]{44}\b(?=.*ibm)/gi, sev: "high" },
    { name: "SAP BTP Token", re: /(?:sap|btp)[_-]?(?:client[_-]?)?(?:secret|token)["']?\s*[:=]\s*["']?([A-Za-z0-9+/=]{32,})["']?/gi, sev: "high", group: 1 },
    { name: "Salesforce Token", re: /\b00D[A-Za-z0-9]{12,15}![A-Za-z0-9._]{80,}\b/g, sev: "critical" },
    { name: "Salesforce Connected App", re: /\b3MVG9[A-Za-z0-9._]{80,}\b/g, sev: "critical" },
    { name: "ServiceNow Basic", re: /Basic\s+[A-Za-z0-9+/=]{20,}(?=.*servicenow)/gi, sev: "critical" },
    { name: "Zoom JWT Token", re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}(?=.*zoom)/gi, sev: "critical" },
    { name: "Zoom SDK Secret", re: /(?:zoom)[_-]?(?:sdk[_-]?)?(?:secret|key)["']?\s*[:=]\s*["']?([A-Za-z0-9]{20,})["']?/gi, sev: "critical", group: 1 },
    { name: "Azure DevOps PAT", re: /\b[a-z0-9]{52}\b(?=.*dev\.azure)/gi, sev: "critical" },
    { name: "Azure Function Key", re: /\?code=[A-Za-z0-9+/=_-]{40,}/g, sev: "high" },
    { name: "Azure Cosmos DB", re: /AccountEndpoint=https:\/\/[^;]+;AccountKey=[A-Za-z0-9+/=]{86,}/g, sev: "critical" },
    { name: "Azure Service Bus", re: /Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[A-Za-z0-9+/=]{40,}/g, sev: "critical" },
    { name: "Azure Event Hub", re: /Endpoint=sb:\/\/[^;]+\.servicebus\.windows\.net\/;SharedAccessKeyName=[^;]+;SharedAccessKey=[A-Za-z0-9+/=]{40,}/gi, sev: "critical" },
    { name: "AWS Bedrock Key", re: /(?:bedrock)[_-]?(?:key|token)["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{20,})["']?/gi, sev: "critical", group: 1 },
    { name: "AWS KMS Key", re: /\barn:aws:kms:[a-z0-9-]+:\d{12}:key\/[a-f0-9-]{36}\b/g, sev: "medium" },
    { name: "GCP OAuth Refresh", re: /\b1\/\/[0-9A-Za-z_-]{40,}\b/g, sev: "critical" },
    { name: "GCP Service JSON", re: /"private_key_id"\s*:\s*"[a-f0-9]{40}"/g, sev: "critical" },

    { name: "MongoDB URI", re: /mongodb(\+srv)?:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "PostgreSQL URI", re: /postgres(ql)?:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "MySQL URI", re: /mysql:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "MSSQL URI", re: /(?:sqlserver|mssql):\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "Oracle URI", re: /oracle:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "Redis URI", re: /redis(s)?:\/\/[^\s'"]+/gi, sev: "high" },
    { name: "Cassandra URI", re: /cassandra:\/\/[^\s'"]+/gi, sev: "high" },
    { name: "Neo4j URI", re: /(?:neo4j|bolt):\/\/[^\s'"]+/gi, sev: "high" },
    { name: "InfluxDB URI", re: /influx(?:db)?:\/\/[^\s'"]+/gi, sev: "high" },
    { name: "ClickHouse URI", re: /clickhouse:\/\/[^\s'"]+/gi, sev: "high" },
    { name: "Elasticsearch URI", re: /https?:\/\/[^\s'"]*:9200[^\s'"]*/g, sev: "high" },
    { name: "JDBC Conn String", re: /jdbc:[a-z]+:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "Kafka Brokers", re: /\b(?:kafka|broker)s?["']?\s*[:=]\s*["']?([a-z0-9.-]+:\d{4,5}(?:,[a-z0-9.-]+:\d{4,5})*)/gi, sev: "high", group: 1 },
    { name: "RabbitMQ URI", re: /amqps?:\/\/[^\s'"]+/gi, sev: "high" },
    { name: "CockroachDB URI", re: /cockroachdb:\/\/[^\s'"]+/gi, sev: "critical" },
    { name: "PlanetScale Token", re: /\bpscale_tkn_[A-Za-z0-9_.-]{40,}\b/g, sev: "critical" },
    { name: "Neon API Key", re: /\bnapi_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "FaunaDB Secret", re: /\bfnAC[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Upstash Token", re: /\bAX[A-Za-z0-9]{30,}\b(?=.*upstash)/gi, sev: "critical" },
    { name: "MongoDB Atlas", re: /mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+\.mongodb\.net/gi, sev: "critical" },

    { name: "Stripe Secret Key", re: /\bsk_(?:test|live)_[0-9a-zA-Z]{24,}\b/g, sev: "critical" },
    { name: "Stripe Publishable", re: /\bpk_(?:test|live)_[0-9a-zA-Z]{24,}\b/g, sev: "medium" },
    { name: "Stripe Restricted Key", re: /\brk_(?:test|live)_[0-9a-zA-Z]{24,}\b/g, sev: "critical" },
    { name: "Stripe Webhook Secret", re: /\bwhsec_[A-Za-z0-9]{32,}\b/g, sev: "critical" },
    { name: "Stripe Price ID", re: /\bprice_[A-Za-z0-9]{24,}\b/g, sev: "low" },
    { name: "Stripe Product ID", re: /\bprod_[A-Za-z0-9]{14,}\b/g, sev: "low" },
    { name: "PayPal Client", re: /\bA[A-Za-z0-9_-]{79}\b(?=.*paypal)/gi, sev: "high" },
    { name: "PayPal Token", re: /\baccess_token\$production\$[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Square Token", re: /\bsq0atp-[A-Za-z0-9_-]{22}\b/g, sev: "critical" },
    { name: "Square OAuth", re: /\bsq0csp-[A-Za-z0-9_-]{43}\b/g, sev: "critical" },
    { name: "Razorpay Key", re: /\brzp_(?:test|live)_[A-Za-z0-9]{14,}/g, sev: "high" },
    { name: "Shopify Access Token", re: /\bshpat_[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Shopify Custom App", re: /\bshpca_[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Shopify Private App", re: /\bshpss_[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Paddle API Key", re: /\b(?:pdl|paddle)[_-]?(?:live|test|sandbox)[_-]?[a-z0-9]{26,}/gi, sev: "critical" },
    { name: "Coinbase API", re: /(?:coinbase)[_-]?(?:api[_-]?)?(?:key|secret)["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{32,})["']?/gi, sev: "critical", group: 1 },
    { name: "Binance API Key", re: /\b[A-Za-z0-9]{64}\b(?=.*binance)/gi, sev: "critical" },
    { name: "Braintree Token", re: /\baccess_token\$production\$[A-Za-z0-9]{20,}\$[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Adyen API Key", re: /\bAQE[A-Za-z0-9+/=]{50,}\b/g, sev: "critical" },
    { name: "Klarna Key", re: /(?:klarna)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([A-Za-z0-9_-]{40,})["']?/gi, sev: "critical", group: 1 },
    { name: "Mollie Key", re: /\b(?:test|live)_[A-Za-z0-9]{30,}\b(?=.*mollie)/gi, sev: "high" },
    { name: "Checkout.com Key", re: /\bsk_(?:test|live)_[a-f0-9-]{36}\b(?=.*checkout)/gi, sev: "critical" },
    { name: "Flutterwave Key", re: /\bFLWSECK(?:_TEST)?-[A-Za-z0-9]{32}-X\b/g, sev: "critical" },
    { name: "Paystack Key", re: /\bsk_(?:test|live)_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "MercadoPago Token", re: /\b(?:TEST|APP_USR)-\d{15,}-\d{6}-[a-f0-9]{32}-\d{9}\b/g, sev: "critical" },
    { name: "Culqi Key", re: /\bsk_(?:test|live)_[A-Za-z0-9]{40,}\b(?=.*culqi)/gi, sev: "critical" },
    { name: "Wompi Key", re: /\bpub_(?:test|prod)_[A-Za-z0-9]{40,}\b/g, sev: "medium" },

    { name: "SendGrid API Key", re: /\bSG\.[0-9a-zA-Z_-]{22}\.[0-9a-zA-Z_-]{43}\b/g, sev: "critical" },
    { name: "Mailgun API Key", re: /\bkey-[0-9a-zA-Z]{32}\b/g, sev: "critical" },
    { name: "Mailchimp API Key", re: /\b[0-9a-f]{32}-us\d{1,2}\b/g, sev: "high" },
    { name: "Sendinblue Key", re: /\bxkeysib-[A-Za-z0-9_-]{60,}/g, sev: "critical" },
    { name: "Resend API Key", re: /\bre_[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "Twilio SID", re: /\bAC[a-f0-9]{32}\b/gi, sev: "high" },
    { name: "Twilio API Key SID", re: /\bSK[a-f0-9]{32}\b/gi, sev: "high" },
    { name: "Twilio Auth Token", re: /(?:twilio[_-]?auth[_-]?token|TWILIO_AUTH_TOKEN)["']?\s*[:=]\s*["']?([a-f0-9]{32})["']?/gi, sev: "critical", group: 1 },
    { name: "WhatsApp Business Token", re: /\bEAA[A-Za-z0-9]{100,}/g, sev: "critical" },
    { name: "Telegram Bot Token", re: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, sev: "high" },
    { name: "Discord Webhook", re: /discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/g, sev: "high" },
    { name: "Discord Bot Token", re: /\b[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27,}/g, sev: "critical" },
    { name: "Slack Bot Token", re: /\bxox[bporsa]-[0-9a-zA-Z-]{10,}\b/g, sev: "critical" },
    { name: "Slack Webhook", re: /hooks\.slack\.com\/(?:services|workflows)\/[A-Z0-9/]{40,}/gi, sev: "high" },
    { name: "Slack User Token", re: /\bxoxc-[0-9a-zA-Z-]{10,}\b/g, sev: "critical" },
    { name: "Slack Refresh", re: /\bxoxe-[0-9a-zA-Z-]{10,}\b/g, sev: "critical" },

    { name: "GitHub PAT (classic)", re: /\bghp_[A-Za-z0-9]{36}\b/g, sev: "critical" },
    { name: "GitHub PAT (fine)", re: /\bgithub_pat_[A-Za-z0-9_]{82}\b/g, sev: "critical" },
    { name: "GitHub OAuth", re: /\bgho_[A-Za-z0-9]{36}\b/g, sev: "critical" },
    { name: "GitHub App Token", re: /\b(ghu|ghs)_[A-Za-z0-9]{36}\b/g, sev: "critical" },
    { name: "GitHub Refresh", re: /\bghr_[A-Za-z0-9]{76}\b/g, sev: "critical" },
    { name: "GitLab PAT", re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "GitLab Runner", re: /\bglrt-[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "Bitbucket App Password", re: /\bATBB[A-Za-z0-9]{28}\b/g, sev: "critical" },
    { name: "NPM Token", re: /\bnpm_[A-Za-z0-9]{36}\b/g, sev: "critical" },
    { name: "PyPI Token", re: /\bpypi-[A-Za-z0-9_-]{100,}\b/g, sev: "critical" },
    { name: "Docker Hub PAT", re: /\bdckr_pat_[A-Za-z0-9_-]{27,}\b/g, sev: "critical" },
    { name: "CircleCI Token", re: /\b[a-f0-9]{40}\b(?=.*circleci)/gi, sev: "critical" },
    { name: "TravisCI Token", re: /(?:travis)[_-]?(?:api[_-]?)?token["']?\s*[:=]\s*["']?([A-Za-z0-9_-]{22})["']?/gi, sev: "critical", group: 1 },
    { name: "Buildkite Token", re: /\bbkua_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Argo CD Token", re: /\beyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}(?=.*argo)/gi, sev: "critical" },
    { name: "Jenkins API Token", re: /\b[a-f0-9]{34}\b(?=.*jenkins)/gi, sev: "high" },

    { name: "OpenAI Key", re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/g, sev: "critical" },
    { name: "Anthropic Key", re: /\bsk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{80,}\b/g, sev: "critical" },
    { name: "HuggingFace Token", re: /\bhf_[A-Za-z0-9]{30,}\b/g, sev: "high" },
    { name: "Replicate Token", re: /\br8_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Groq API Key", re: /\bgsk_[A-Za-z0-9]{50,}\b/g, sev: "critical" },
    { name: "Perplexity Key", re: /\bpplx-[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Stability API Key", re: /\bsk-[A-Za-z0-9]{48}\b(?=.*stability)/gi, sev: "critical" },
    { name: "Pinecone API Key", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*pinecone)/gi, sev: "high" },
    { name: "Together AI Key", re: /\b[a-f0-9]{64}\b(?=.*together)/gi, sev: "critical" },
    { name: "Fireworks AI Key", re: /\bfw_[A-Za-z0-9]{20,}\b/g, sev: "critical" },
    { name: "Voyage AI Key", re: /\bpa-[A-Za-z0-9_-]{40,}\b/g, sev: "high" },
    { name: "Jina AI Key", re: /\bjina_[A-Za-z0-9_-]{40,}\b/g, sev: "high" },
    { name: "DeepSeek Key", re: /\bsk-[a-f0-9]{32}\b(?=.*deepseek)/gi, sev: "critical" },
    { name: "Moonshot Key", re: /\bsk-[A-Za-z0-9]{48}\b(?=.*moonshot)/gi, sev: "critical" },
    { name: "Zhipu Key", re: /\b[a-f0-9]{32}\.[A-Za-z0-9]{16}\b(?=.*zhipu|bigmodel)/gi, sev: "critical" },
    { name: "Baidu Qianfan", re: /\bbce-v3\/[A-Z0-9]{8,}\/[a-f0-9]{40,}/g, sev: "critical" },
    { name: "Ollama Endpoint", re: /https?:\/\/[^\s'"]*:11434[^\s'"]*/g, sev: "medium" },
    { name: "LM Studio Endpoint", re: /https?:\/\/[^\s'"]*:1234\/v1[^\s'"]*/g, sev: "medium" },

    { name: "Firebase Server Key", re: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140,}/g, sev: "critical" },
    { name: "Firebase URL", re: /[a-zA-Z0-9_-]+\.firebaseio\.com/gi, sev: "medium" },
    { name: "Auth0 Management Token", re: /\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}(?=.*auth0)/gi, sev: "critical" },
    { name: "Okta API Token", re: /\b00[A-Za-z0-9_-]{40}\b(?=.*okta)/gi, sev: "critical" },
    { name: "Okta SSWS", re: /\bSSWS [A-Za-z0-9_-]{40}\b/g, sev: "critical" },
    { name: "Clerk Secret Key", re: /\bsk_(?:test|live)_[A-Za-z0-9]{40,}\b(?=.*clerk)/gi, sev: "critical" },
    { name: "Supabase Anon Key", re: /\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b(?=.*supabase)/gi, sev: "medium" },
    { name: "Supabase Service Key", re: /\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b(?=.*service[_-]?role)/gi, sev: "critical" },
    { name: "NextAuth Secret", re: /(?:nextauth|next[_-]?auth)[_-]?secret["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{32,})["']?/gi, sev: "critical", group: 1 },
    { name: "JWT Secret (ctx)", re: /(?:jwt|token)[_-]?secret["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{16,})["']?/gi, sev: "critical", group: 1 },
    { name: "Session Secret", re: /(?:session|express[_-]?session)[_-]?secret["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{16,})["']?/gi, sev: "critical", group: 1 },
    { name: "Stytch Secret", re: /\bsecret-(?:test|live)-[A-Za-z0-9_-]{40,}\b/g, sev: "critical" },
    { name: "Keycloak Secret", re: /"client_secret"\s*:\s*"([A-Za-z0-9_-]{20,})"/g, sev: "critical", group: 1 },

    { name: "Notion Integration", re: /\bsecret_[A-Za-z0-9]{43}\b/g, sev: "critical" },
    { name: "Notion API v2", re: /\bntn_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Airtable PAT", re: /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/g, sev: "critical" },
    { name: "Linear API Key", re: /\blin_api_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Asana PAT", re: /\b[12]\/[0-9]{16}\/[0-9]{16}:[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "ClickUp Token", re: /\bpk_[0-9]{6,10}_[A-Z0-9]{32}\b/g, sev: "critical" },
    { name: "Figma PAT", re: /\bfigd_[A-Za-z0-9_-]{40,}\b/g, sev: "critical" },
    { name: "Contentful Token", re: /\bCFPAT-[A-Za-z0-9_-]{60,}\b/g, sev: "critical" },
    { name: "Mapbox Secret", re: /\bsk\.eyJ[A-Za-z0-9_-]{60,}\b/g, sev: "critical" },
    { name: "Mapbox Public", re: /\bpk\.eyJ[A-Za-z0-9_-]{60,}\b/g, sev: "medium" },
    { name: "Cloudinary URL", re: /cloudinary:\/\/[0-9]+:[A-Za-z0-9_-]+@[A-Za-z0-9-]+/g, sev: "critical" },

    { name: "Datadog API Key", re: /\b[a-f0-9]{32}\b(?=.*datadog|dd[_-])/gi, sev: "critical" },
    { name: "Datadog App Key", re: /\b[a-f0-9]{40}\b(?=.*datadog)/gi, sev: "critical" },
    { name: "New Relic Key", re: /\bNRAK-[A-Z0-9]{27}\b/g, sev: "critical" },
    { name: "Sentry DSN", re: /https:\/\/[a-f0-9]{32}(?:@[a-z0-9.-]+)?\.ingest\.sentry\.io\/\d+/g, sev: "medium" },
    { name: "Sentry Auth Token", re: /\bsntrys_[A-Za-z0-9_-]{60,}\b/g, sev: "critical" },
    { name: "Grafana API Key", re: /\beyJrIjoi[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "Grafana Service Token", re: /\bglsa_[A-Za-z0-9]{32}_[a-f0-9]{8}\b/g, sev: "critical" },
    { name: "Dynatrace Token", re: /\bdt0c01\.[A-Z0-9]{24}\.[A-Z0-9]{64}\b/g, sev: "critical" },

    { name: "Zapier Webhook", re: /hooks\.zapier\.com\/hooks\/catch\/\d+\/[A-Za-z0-9]+\/?/g, sev: "high" },
    { name: "Make Webhook", re: /hook(?:s)?\.[a-z0-9-]*make\.com\/[A-Za-z0-9]+/gi, sev: "high" },
    { name: "n8n Webhook", re: /https?:\/\/[^\s'"]+\/webhook(?:-test)?\/[A-Za-z0-9_-]+/gi, sev: "high" },
    { name: "IFTTT Webhook", re: /maker\.ifttt\.com\/trigger\/[a-z0-9_-]+\/with\/key\/[A-Za-z0-9_-]+/gi, sev: "high" },
    { name: "Pipedream Webhook", re: /https?:\/\/[a-z0-9]+\.m\.pipedream\.net\/[A-Za-z0-9]+/gi, sev: "high" },

    { name: "Ethereum Private Key", re: /\b(?:0x)?[a-f0-9]{64}\b(?=.*(?:private|wallet|mnemonic))/gi, sev: "critical" },
    { name: "Ethereum Address", re: /\b0x[a-fA-F0-9]{40}\b/g, sev: "low" },
    { name: "Bitcoin Private (WIF)", re: /\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b/g, sev: "critical" },
    { name: "Bitcoin Address", re: /\b(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b/g, sev: "low" },
    { name: "BIP39 Mnemonic", re: /\b(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}\b/g, sev: "critical" },
    { name: "Solana Private Key", re: /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/g, sev: "critical" },
    { name: "XRP Secret", re: /\bsEd[a-zA-Z0-9]{50,}\b/g, sev: "critical" },
    { name: "Alchemy Key", re: /\balch_[A-Za-z0-9_-]{30,}\b/g, sev: "critical" },
    { name: "Infura Project", re: /\b[a-f0-9]{32}\b(?=.*infura)/gi, sev: "critical" },
    { name: "QuickNode Key", re: /\b[A-Za-z0-9]{40,}\b(?=.*quicknode)/gi, sev: "critical" },
    { name: "Magic Link Key", re: /\bpk_(?:live|test)_[A-F0-9]{32}\b/g, sev: "critical" },

    { name: "Private Key PEM", re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g, sev: "critical" },
    { name: "SSH Private Key", re: /-----BEGIN OPENSSH PRIVATE KEY-----/g, sev: "critical" },
    { name: "PGP Private Key", re: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g, sev: "critical" },
    { name: "Certificate PEM", re: /-----BEGIN CERTIFICATE-----/g, sev: "medium" },
    { name: "Encrypted Private Key", re: /-----BEGIN ENCRYPTED PRIVATE KEY-----/g, sev: "critical" },
    { name: "Age Key", re: /AGE-SECRET-KEY-1[A-Z0-9]{58}/g, sev: "critical" },
    { name: "Tailscale Auth", re: /\btskey-auth-[A-Za-z0-9]{20,}\b/g, sev: "critical" },
    { name: "Tailscale API", re: /\btskey-api-[A-Za-z0-9]{20,}\b/g, sev: "critical" },

    { name: "JWT", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}\b/g, sev: "medium" },
    { name: "Bearer Token", re: /Bearer\s+[A-Za-z0-9_.\-+/=]{20,}/gi, sev: "medium" },
    { name: "Basic Auth", re: /Basic\s+[A-Za-z0-9+/=]{16,}/g, sev: "high" },
    { name: "Hex Key (ctx)", re: /(?:key|token|secret|api[_-]?key|client[_-]?secret)\s*[:='"]\s*['"]?([0-9a-fA-F]{32,})['"]?/gi, sev: "high", group: 1 },
    { name: "API Key (ctx)", re: /(?:api[_-]?key|apikey|access[_-]?key|app[_-]?key|client[_-]?secret|auth[_-]?key|secret[_-]?key|x-api-key|x-auth-token)["']?\s*[:=]\s*["']?([A-Za-z0-9_\-./+=]{16,120})["']?/gi, sev: "high", group: 1 },
    { name: "Password (ctx)", re: /(?:password|passwd|pwd|pass)["']?\s*[:=]\s*["']([^"'\s]{6,120})["']/gi, sev: "high", group: 1 },
    { name: "Secret Env", re: /(?:[A-Z_]{3,}_(?:SECRET|TOKEN|KEY|PASSWORD))["']?\s*[:=]\s*["']([^"'\s]{8,})["']/g, sev: "high", group: 1 },
    { name: "Vite Env Var", re: /\bVITE_[A-Z0-9_]+\s*[:=]\s*["']([^"'\s]{6,})["']/g, sev: "high", group: 1 },
    { name: "Next.js Env", re: /\bNEXT_PUBLIC_[A-Z0-9_]+\s*[:=]\s*["']([^"'\s]{6,})["']/g, sev: "medium", group: 1 },
    { name: "React Env", re: /\bREACT_APP_[A-Z0-9_]+\s*[:=]\s*["']([^"'\s]{6,})["']/g, sev: "medium", group: 1 },
    { name: "Vue Env", re: /\bVUE_APP_[A-Z0-9_]+\s*[:=]\s*["']([^"'\s]{6,})["']/g, sev: "medium", group: 1 },
    { name: "Nuxt Env", re: /\bNUXT_[A-Z0-9_]+\s*[:=]\s*["']([^"'\s]{6,})["']/g, sev: "medium", group: 1 },

    { name: "IP Internal", re: /\b(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g, sev: "low" },
    { name: "Localhost URI", re: /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d{2,5})?[^\s'"]*/gi, sev: "low" },
    { name: "Internal Host", re: /\b[a-z0-9-]+\.(?:local|internal|corp|lan|intranet|priv|internal\.local)\b/gi, sev: "medium" },
    { name: "Debug Flag", re: /(?:DEBUG|VERBOSE|DEV_MODE|TESTING|SANDBOX|STAGING)["']?\s*[:=]\s*(?:true|1|"true"|"1"|'true'|'1')/gi, sev: "low" },
    { name: "Stack Trace Java", re: /\bat\s+[a-zA-Z_$][\w$.]*\([\w$]+\.java:\d+\)/g, sev: "low" },
    { name: "Stack Trace Python", re: /File\s+"[^"]+\.py",\s+line\s+\d+/g, sev: "low" },
    { name: "Stack Trace Node", re: /\bat\s+(?:[\w$.]+\s+)?\(?\/[^\s)]+:\d+:\d+\)?/g, sev: "low" },
    { name: "GraphQL Debug", re: /"(?:errors|extensions|debug)"\s*:\s*\[?\s*\{[^}]*"(?:message|stacktrace|locations)"/gi, sev: "low" },

    { name: "LaunchDarkly SDK", re: /\bsdk-[a-f0-9-]{36}\b/g, sev: "medium" },
    { name: "LaunchDarkly Personal", re: /\bapi-[a-f0-9-]{36}\b/g, sev: "critical" },
    { name: "Flagsmith Key", re: /\bser\.[A-Za-z0-9]{40,}\b/g, sev: "medium" },
    { name: "WooCommerce Key", re: /\bck_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "WooCommerce Secret", re: /\bcs_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Meilisearch Key", re: /\b[a-f0-9]{64}\b(?=.*meili)/gi, sev: "critical" },
    { name: "Typesense Key", re: /\b[a-zA-Z0-9]{32}\b(?=.*typesense)/gi, sev: "high" },
    { name: "W&B API Key", re: /\b[a-f0-9]{40}\b(?=.*wandb)/gi, sev: "high" },
    { name: "Backblaze B2 Key", re: /\bK00[a-zA-Z0-9]{21}\b/g, sev: "critical" },
    { name: "Bunny API Key", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*bunny)/gi, sev: "high" },
    { name: "Cloudflare Worker", re: /https:\/\/[a-z0-9-]+\.workers\.dev\/[^\s'"]*/gi, sev: "medium" },
    { name: "Vercel Deploy Hook", re: /https:\/\/api\.vercel\.com\/v1\/deployments\/[A-Za-z0-9]+/g, sev: "high" },
    { name: "Netlify Deploy Hook", re: /https:\/\/api\.netlify\.com\/build_hooks\/[a-f0-9]{24}/g, sev: "high" },
    { name: "Infisical Token", re: /\bst\.[a-f0-9-]{36}\.[A-Za-z0-9_-]{40,}\b/g, sev: "critical" },
    { name: "2Captcha Key", re: /\b[a-f0-9]{32}\b(?=.*2captcha|twocaptcha)/gi, sev: "high" },
    { name: "Anti-Captcha Key", re: /\b[a-f0-9]{32}\b(?=.*anti-captcha|anticaptcha)/gi, sev: "high" },
    { name: "CapSolver Key", re: /\bCAP-[A-F0-9]{32}\b/g, sev: "high" },

    { name: "Appwrite Key", re: /\bstandard_[a-f0-9]{64}\b/g, sev: "critical" },
    { name: "Ghost Admin Key", re: /\b[a-f0-9]{24}:[a-f0-9]{64}\b/g, sev: "critical" },
    { name: "Cal.com Key", re: /\bcal_(?:live|test)_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "PostHog Key", re: /\bphc_[A-Za-z0-9]{40,}\b/g, sev: "medium" },
    { name: "FCM Server Key", re: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140,}\b/g, sev: "critical" },
    { name: "OneSignal REST", re: /\bBasic\s+[A-Za-z0-9+/=]{40,}(?=.*onesignal)/gi, sev: "critical" },
    { name: "Pusher Key", re: /\b[a-f0-9]{20}\b(?=.*pusher)/gi, sev: "medium" },
    { name: "Ably Key", re: /\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b(?=.*ably)/gi, sev: "high" },
    { name: "Sentry Project DSN", re: /https:\/\/[a-f0-9]{32}@o\d+\.ingest\.sentry\.io\/\d+/g, sev: "medium" },
    { name: "Datadog RUM", re: /\bpub[a-f0-9]{32}\b/g, sev: "medium" },
    { name: "Segment Write Key", re: /\b[a-zA-Z0-9]{32}\b(?=.*segment)/gi, sev: "medium" },
    { name: "Mixpanel Token", re: /\b[a-f0-9]{32}\b(?=.*mixpanel)/gi, sev: "medium" },
    { name: "Amplitude Key", re: /\b[a-f0-9]{32}\b(?=.*amplitude)/gi, sev: "medium" },
    { name: "FullStory Org", re: /\b[A-Z0-9]{4,6}\b(?=.*fullstory)/gi, sev: "low" },

    // ── v9 · API keys de pago: IA, pagos, comunicaciones, SaaS ──
    { name: "OpenAI API Key (proj)", re: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "OpenAI API Key", re: /\bsk-[A-Za-z0-9]{32,}\b/g, sev: "critical" },
    { name: "Anthropic API Key", re: /\bsk-ant-[A-Za-z0-9_-]{30,}\b/g, sev: "critical" },
    { name: "OpenRouter Key", re: /\bsk-or-v1-[a-f0-9]{40,}\b/gi, sev: "critical" },
    { name: "Groq API Key", re: /\bgsk_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Perplexity API Key", re: /\bpplx-[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "xAI (Grok) API Key", re: /\bxai-[A-Za-z0-9]{50,}\b/g, sev: "critical" },
    { name: "DeepSeek API Key", re: /\bsk-[a-f0-9]{32}\b(?=.*deepseek)/gi, sev: "critical" },
    { name: "Mistral API Key", re: /\b[A-Za-z0-9]{32}\b(?=.*mistral)/gi, sev: "critical" },
    { name: "Cohere API Key", re: /\b[A-Za-z0-9]{40}\b(?=.*cohere)/gi, sev: "critical" },
    { name: "Together AI Key", re: /\b[a-f0-9]{64}\b(?=.*together)/gi, sev: "critical" },
    { name: "Fireworks AI Key", re: /\bfw_[A-Za-z0-9]{24,}\b/g, sev: "critical" },
    { name: "Anyscale Token", re: /\besecret_[A-Za-z0-9]{20,}\b/g, sev: "critical" },
    { name: "HuggingFace Token", re: /\bhf_[A-Za-z0-9]{30,}\b/g, sev: "critical" },
    { name: "Replicate Token", re: /\br8_[A-Za-z0-9]{30,}\b/g, sev: "critical" },
    { name: "Stability AI Key", re: /\bsk-[A-Za-z0-9]{32,}\b(?=.*stability)/gi, sev: "critical" },
    { name: "ElevenLabs Key", re: /\b(?:sk_)?[a-f0-9]{32}\b(?=.*elevenlabs)/gi, sev: "critical" },
    { name: "AssemblyAI Key", re: /\b[a-f0-9]{32}\b(?=.*assemblyai)/gi, sev: "high" },
    { name: "Deepgram Key", re: /\b[a-f0-9]{40}\b(?=.*deepgram)/gi, sev: "high" },
    { name: "Gladia Key", re: /\b[a-f0-9-]{36}\b(?=.*gladia)/gi, sev: "high" },
    { name: "Pinecone API Key", re: /\bpcsk_[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "Pinecone Key (legacy)", re: /\b[a-f0-9-]{36}\b(?=.*pinecone)/gi, sev: "high" },
    { name: "Weaviate Key", re: /(?:weaviate)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([A-Za-z0-9_-]{20,})["']?/gi, sev: "high", group: 1 },
    { name: "Qdrant Key", re: /\b[A-Za-z0-9_-]{30,}\b(?=.*qdrant)/gi, sev: "high" },
    { name: "W&B Key", re: /\b[a-f0-9]{40}\b(?=.*wandb)/gi, sev: "critical" },
    { name: "RunPod Key", re: /\b[A-Z0-9]{32,}\b(?=.*runpod)/gi, sev: "critical" },
    { name: "Fal.ai Key", re: /\b[a-f0-9]{8}-[a-f0-9-]{20,}:[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Roboflow Key", re: /\b[A-Za-z0-9]{20,}\b(?=.*roboflow)/gi, sev: "medium" },
    { name: "Synthesia Key", re: /\b[a-f0-9]{32}\b(?=.*synthesia)/gi, sev: "critical" },
    { name: "HeyGen Key", re: /\b[A-Za-z0-9_-]{30,}\b(?=.*heygen)/gi, sev: "high" },
    { name: "Freepik API Key", re: /\bFPSX[a-f0-9]{30,}\b/g, sev: "high" },
    { name: "Algolia Key", re: /\b[a-f0-9]{32}\b(?=.*algolia)/gi, sev: "high" },
    { name: "Typesense Key", re: /(?:typesense)[_-]?(?:api[_-]?)?key["']?\s*[:=]\s*["']?([A-Za-z0-9]{16,})["']?/gi, sev: "high", group: 1 },
    { name: "Meilisearch Key", re: /\b[a-f0-9]{32,}\b(?=.*meili)/gi, sev: "high" },
    { name: "Elastic API Key", re: /\b[A-Za-z0-9_-]{20,}:[A-Za-z0-9_-]{20,}\b(?=.*elastic)/gi, sev: "high" },
    { name: "Xata Key", re: /\bxau_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Supabase Service Key", re: /\bsbp_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Clerk/WorkOS Key", re: /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{20,}\b/g, sev: "critical" },
    { name: "Stytch Token", re: /\b(?:secret|public)-token-(?:live|test)-[a-f0-9-]{30,}\b/g, sev: "critical" },
    { name: "Ory Token", re: /\bory_[a-zA-Z0-9_-]{30,}\b/g, sev: "critical" },
    { name: "Okta Token", re: /\b00[A-Za-z0-9_-]{40}\b(?=.*okta)/gi, sev: "critical" },
    { name: "Twilio API Key", re: /\bSK[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Twilio Account SID", re: /\bAC[a-f0-9]{32}\b/g, sev: "high" },
    { name: "SendGrid API Key", re: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, sev: "critical" },
    { name: "Mailgun API Key", re: /\bkey-[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Postmark Token", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*postmark)/gi, sev: "critical" },
    { name: "Brevo/Sendinblue Key", re: /\bxkeysib-[a-f0-9]{64}-[A-Za-z0-9]{10,}\b/g, sev: "critical" },
    { name: "Resend API Key", re: /\bre_[A-Za-z0-9]{30,}\b/g, sev: "critical" },
    { name: "Mailchimp API Key", re: /\b[a-f0-9]{32}-us\d{1,2}\b/g, sev: "critical" },
    { name: "SparkPost Key", re: /\b[a-f0-9]{40}\b(?=.*sparkpost)/gi, sev: "high" },
    { name: "Plivo Auth ID", re: /\bMA[A-Z0-9]{18}\b(?=.*plivo)/gi, sev: "high" },
    { name: "MessageBird Key", re: /\b[A-Za-z0-9]{25}\b(?=.*messagebird)/gi, sev: "high" },
    { name: "Sendbird Token", re: /\b[a-f0-9]{40}\b(?=.*sendbird)/gi, sev: "high" },
    { name: "PubNub Publish Key", re: /\bpub-c-[a-f0-9-]{36}\b/g, sev: "medium" },
    { name: "Slack Token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g, sev: "critical" },
    { name: "Slack App Token", re: /\bxapp-[A-Za-z0-9-]{10,}/g, sev: "critical" },
    { name: "Slack Webhook", re: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{6,}\/B[A-Z0-9]{6,}\/[A-Za-z0-9]{20,}/g, sev: "critical" },
    { name: "Discord Bot Token", re: /\b[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{25,}\b/g, sev: "critical" },
    { name: "Discord Webhook", re: /https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d{15,}\/[A-Za-z0-9_-]{60,}/g, sev: "critical" },
    { name: "Telegram Bot Token", re: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, sev: "critical" },
    { name: "Meta/WhatsApp Token", re: /\bEAA[A-Za-z0-9]{20,}\b/g, sev: "high" },
    { name: "X/Twitter Bearer", re: /\bAAAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]{50,}\b/g, sev: "critical" },
    { name: "GitHub PAT", re: /\bghp_[A-Za-z0-9]{36,}\b/g, sev: "critical" },
    { name: "GitHub OAuth Token", re: /\bgho_[A-Za-z0-9]{36,}\b/g, sev: "critical" },
    { name: "GitHub App Token", re: /\b(?:ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g, sev: "critical" },
    { name: "GitHub Fine-Grained PAT", re: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g, sev: "critical" },
    { name: "GitLab PAT", re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g, sev: "critical" },
    { name: "npm Token", re: /\bnpm_[A-Za-z0-9]{36}\b/g, sev: "critical" },
    { name: "PyPI Token", re: /\bpypi-[A-Za-z0-9_-]{50,}\b/g, sev: "critical" },
    { name: "Docker PAT", re: /\bdckr_pat_[A-Za-z0-9_-]{27,}\b/g, sev: "critical" },
    { name: "CircleCI Token", re: /\b[a-f0-9]{40}\b(?=.*circleci)/gi, sev: "critical" },
    { name: "Buildkite Token", re: /\bbkua_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Tailscale Key", re: /\btskey-(?:api|auth)-[A-Za-z0-9-]{20,}\b/g, sev: "critical" },
    { name: "n8n API Key", re: /\bn8n_api_[A-Za-z0-9]{30,}\b/g, sev: "critical" },
    { name: "Axiom Token", re: /\bxaat-[A-Za-z0-9-]{30,}\b/g, sev: "critical" },
    { name: "Grafana Service Account", re: /\bglsa_[A-Za-z0-9]{32}_[A-Fa-f0-9]{8}\b/g, sev: "critical" },
    { name: "Grafana API Key", re: /\beyJr[A-Za-z0-9_-]{40,}\b/g, sev: "high" },
    { name: "New Relic Key", re: /\bNRAK-[A-Z0-9]{27}\b/g, sev: "critical" },
    { name: "Rollbar Token", re: /\b[a-f0-9]{32}\b(?=.*rollbar)/gi, sev: "critical" },
    { name: "Bugsnag Key", re: /\b[a-f0-9]{32}\b(?=.*bugsnag)/gi, sev: "high" },
    { name: "LaunchDarkly Key", re: /\b(?:sdk|api|mob)-[a-f0-9-]{36}\b/g, sev: "critical" },
    { name: "PostHog Personal Key", re: /\bphx_[A-Za-z0-9]{40,}\b/g, sev: "critical" },
    { name: "Sentry Auth Token", re: /\bsntryu_[a-f0-9]{40,}\b/g, sev: "critical" },
    { name: "Splunk HEC Token", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*splunk)/gi, sev: "high" },
    { name: "Braintree Token", re: /\baccess_token\$(?:production|sandbox)\$[a-z0-9]{16}\$[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Adyen API Key", re: /\bAQE[A-Za-z0-9]{20,}\b(?=.*adyen)/gi, sev: "critical" },
    { name: "Mollie API Key", re: /\b(?:live|test)_[A-Za-z0-9]{30,}\b/g, sev: "critical" },
    { name: "MercadoPago Token", re: /\b(?:APP_USR|TEST)-\d{8,}-\d{4,}-[a-f0-9]{32}\b/gi, sev: "critical" },
    { name: "Conekta Key", re: /\bkey_[A-Za-z0-9]{16,}\b/g, sev: "critical" },
    { name: "Flutterwave Secret", re: /\bFLW(?:SECK|PUBK)-(?:TEST-)?[a-f0-9]{32}(?:-X)?\b/gi, sev: "critical" },
    { name: "WooCommerce Key", re: /\b(?:ck|cs)_[a-f0-9]{40}\b/g, sev: "critical" },
    { name: "Plaid Token", re: /\b(?:access|public)-(?:sandbox|development|production)-[a-f0-9-]{36}\b/g, sev: "critical" },
    { name: "Airtable PAT", re: /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/g, sev: "critical" },
    { name: "Airtable Key (legacy)", re: /\bkey[A-Za-z0-9]{14}\b/g, sev: "high" },
    { name: "Notion Token", re: /\b(?:secret|ntn)_[A-Za-z0-9]{32,}\b/g, sev: "critical" },
    { name: "Asana PAT", re: /\b\d\/\d{15,}:[a-f0-9]{32}\b/g, sev: "critical" },
    { name: "Atlassian Token", re: /\bATATT[A-Za-z0-9_-]{50,}\b/g, sev: "critical" },
    { name: "ClickUp Token", re: /\bpk_\d{6,}_[A-Z0-9]{32}\b/g, sev: "critical" },
    { name: "Linear API Key", re: /\blin_api_[A-Za-z0-9]{40}\b/g, sev: "critical" },
    { name: "HubSpot PAT", re: /\bpat-(?:na1|eu1)-[a-f0-9-]{36}\b/g, sev: "critical" },
    { name: "Pipedrive Token", re: /\b[a-f0-9]{40}\b(?=.*pipedrive)/gi, sev: "high" },
    { name: "Contentful PAT", re: /\bCFPAT-[A-Za-z0-9_-]{40,}\b/g, sev: "critical" },
    { name: "Sanity Token", re: /\bsk[A-Za-z0-9]{20,}\b(?=.*sanity)/gi, sev: "critical" },
    { name: "DatoCMS Token", re: /\b[a-f0-9]{32}\b(?=.*datocms)/gi, sev: "high" },
    { name: "Mux Token", re: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*mux)/gi, sev: "critical" },
    { name: "Agora Cert", re: /\b[a-f0-9]{32}\b(?=.*agora)/gi, sev: "critical" },
    { name: "LiveKit Key", re: /\bAPI[A-Za-z0-9]{12,}\b(?=.*livekit)/gi, sev: "high" },
    { name: "Daily.co Key", re: /\b[a-f0-9]{64}\b(?=.*daily\.co)/gi, sev: "critical" },
    { name: "Cloudinary URL", re: /cloudinary:\/\/\d{10,}:[A-Za-z0-9_-]{20,}@[A-Za-z0-9_-]+/g, sev: "critical" },
    { name: "Mapbox Token", re: /\b[ps]k\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, sev: "critical" },
    { name: "OpenWeather Key", re: /\b[a-f0-9]{32}\b(?=.*openweather)/gi, sev: "medium" },
    { name: "TomTom Key", re: /\b[A-Za-z0-9]{32}\b(?=.*tomtom)/gi, sev: "medium" },
    { name: "Pexels Key", re: /\b563492ad6f91700001000001[a-f0-9]{24}\b/g, sev: "high" },
    { name: "Spotify Secret", re: /\b[a-f0-9]{32}\b(?=.*spotify)/gi, sev: "high" },
    { name: "Twitch OAuth", re: /\boauth:[a-z0-9]{30}\b/g, sev: "critical" },
    { name: "Vimeo Token", re: /\b[a-f0-9]{32}\b(?=.*vimeo)/gi, sev: "high" },
    { name: "Infura Project Key", re: /\b[a-f0-9]{32}\b(?=.*infura)/gi, sev: "high" },
    { name: "Alchemy Key", re: /\b[A-Za-z0-9_-]{32}\b(?=.*alchemy)/gi, sev: "high" },
    { name: "Helius Key", re: /\b[a-f0-9-]{36}\b(?=.*helius)/gi, sev: "high" },
    { name: "Thirdweb Client", re: /\b[a-f0-9]{32}\b(?=.*thirdweb)/gi, sev: "medium" },
    { name: "Etherscan Key", re: /\b[A-Z0-9]{34}\b(?=.*etherscan)/gi, sev: "high" },
    { name: "CoinGecko Key", re: /\bCG-[A-Za-z0-9]{24,}\b/g, sev: "high" },
    { name: "CoinMarketCap Key", re: /\b[a-f0-9-]{36}\b(?=.*coinmarketcap)/gi, sev: "high" },
    { name: "Kraken Key", re: /\b[A-Za-z0-9+/]{56}\b(?=.*kraken)/gi, sev: "critical" },
    { name: "OpenSea Key", re: /\b[a-f0-9]{32}\b(?=.*opensea)/gi, sev: "high" },
    { name: "Shodan Key", re: /\b[A-Za-z0-9]{32}\b(?=.*shodan)/gi, sev: "high" },
    { name: "VirusTotal Key", re: /\b[a-f0-9]{64}\b(?=.*virustotal)/gi, sev: "critical" },
    { name: "IPinfo Token", re: /\b[a-f0-9]{14}\b(?=.*ipinfo)/gi, sev: "medium" },
    { name: "Bunny.net Key", re: /\b[a-f0-9-]{36}\b(?=.*bunny)/gi, sev: "high" }
  ];
  var FP = [/^0{16,}$/, /^f{16,}$/i, /^1234567890/, /^(test|demo|example|sample|placeholder|your|xxx)/i, /^(undefined|null|true|false)$/i];
  function isFP(v) { if (!v || v.length < 7) return true; for (var i = 0; i < FP.length; i++) if (FP[i].test(v)) return true; return false; }
  function scanSecrets(text, source) {
    var out = []; if (!text || text.length < 7) return out;
    var seen = {};
    for (var i = 0; i < SECRET_PATTERNS.length; i++) {
      var p = SECRET_PATTERNS[i], re = new RegExp(p.re.source, p.re.flags), m, c = 0;
      while ((m = re.exec(text)) !== null && c < 8) {
        c++;
        var val = (p.group ? m[p.group] : m[0]) || "", v = val.substring(0, 200);
        if (isFP(v) || seen[v]) continue; seen[v] = 1;
        var st = Math.max(0, m.index - 40), en = Math.min(text.length, m.index + m[0].length + 40);
        out.push({ name: p.name, value: v, severity: p.sev, source: source, context: text.substring(st, en).replace(/\s+/g, " ").substring(0, 150) });
      }
    }
    return out;
  }

  // ═══════════════════════════════════════════════════════════
  //  PII (base + v7.1)
  // ═══════════════════════════════════════════════════════════
  var PII_PATTERNS = [
    { name: "Email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, sev: "medium" },
    { name: "Phone (E.164)", re: /\+(?:[0-9]{1,3}[-.\s]?){1,4}[0-9]{6,14}\b/g, sev: "medium" },
    { name: "Credit Card (Luhn)", re: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, sev: "critical" },
    { name: "SSN (US)", re: /\b(?!000|666|9\d\d)\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}\b/g, sev: "critical" },
    { name: "IBAN", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, sev: "high" },
    { name: "UUID", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, sev: "low" },
    { name: "IPv4 Public", re: /\b(?!(?:10|127|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.)(?:\d{1,3}\.){3}\d{1,3}\b/g, sev: "low" },
    { name: "IPv6", re: /\b(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}\b/gi, sev: "low" },
    { name: "Passport", re: /\b[A-Z]{1,2}[0-9]{6,9}\b/g, sev: "medium" },
    { name: "DNI (ES)", re: /\b\d{8}[A-HJ-NP-TV-Z]\b/g, sev: "critical" },
    { name: "NIE (ES)", re: /\b[XYZ]\d{7}[A-HJ-NP-TV-Z]\b/g, sev: "critical" },
    { name: "CURP (MX)", re: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g, sev: "critical" },
    { name: "RFC (MX)", re: /\b[A-Z]{3,4}\d{6}[A-Z0-9]{3}\b/g, sev: "high" },
    { name: "CPF (BR)", re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, sev: "critical" },
    { name: "CNPJ (BR)", re: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, sev: "high" },
    { name: "RUT (CL)", re: /\b\d{1,2}\.\d{3}\.\d{3}-[\dK]\b/g, sev: "critical" },
    { name: "CUIL (AR)", re: /\b(?:20|23|24|27|30|33|34)-\d{8}-\d\b/g, sev: "critical" },
    { name: "RUC (PE)", re: /\b(?:10|15|17|20)\d{9}\b/g, sev: "high" },
    { name: "Aadhaar (IN)", re: /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g, sev: "critical" },
    { name: "PAN (IN)", re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, sev: "critical" },
    { name: "NRIC (SG)", re: /\b[STFGM]\d{7}[A-Z]\b/g, sev: "critical" },
    { name: "NHS (UK)", re: /\b\d{3}\s\d{3}\s\d{4}\b/g, sev: "critical" },
    { name: "NINO (UK)", re: /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/g, sev: "critical" },
    { name: "IBAN ES", re: /\bES\d{2}\s?\d{4}\s?\d{4}\s?\d{2}\s?\d{10}\b/g, sev: "critical" },
    { name: "IBAN MX", re: /\bMX\d{2}[A-Z0-9]{16,20}\b/g, sev: "critical" },
    { name: "Swift/BIC", re: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g, sev: "high" },
    { name: "MAC Address", re: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g, sev: "low" },
    { name: "IMEI", re: /\b\d{15}\b/g, sev: "high" },
    { name: "ICCID SIM", re: /\b89\d{17,18}\b/g, sev: "high" },
    { name: "Latitude/Longitude", re: /-?\d{1,3}\.\d{4,},\s?-?\d{1,3}\.\d{4,}/g, sev: "medium" },
    { name: "Medicare (AU)", re: /\b\d{4}\s\d{5}\s\d\b/g, sev: "critical" }
  ];
  function scanPII(text, source) {
    var out = []; if (!text || text.length < 7) return out;
    var seen = {};
    for (var i = 0; i < PII_PATTERNS.length; i++) {
      var p = PII_PATTERNS[i], re = new RegExp(p.re.source, p.re.flags), m, c = 0;
      while ((m = re.exec(text)) !== null && c < 20) {
        c++;
        var v = m[0];
        if (seen[v]) continue; seen[v] = 1;
        out.push({ name: p.name, value: v, severity: p.sev, source: source });
      }
    }
    return out;
  }

  // ═══════════════════════════════════════════════════════════
  //  ANTIBOT (base + v7.1)
  // ═══════════════════════════════════════════════════════════
  var ANTIBOT_PATTERNS = [
    { name: "Cloudflare", re: /(?:__cf_bm|__cfruid|cf_clearance|_cfuvid|cf_chl_|cdn-cgi\/challenge|cf-mitigated|cf_chl_opt|cf_chl_prog)/i, vendor: "Cloudflare", sev: "high" },
    { name: "Cloudflare Turnstile", re: /(?:challenges\.cloudflare\.com|turnstile)/i, vendor: "Cloudflare", sev: "high" },
    { name: "Akamai Bot Manager", re: /(?:_abck|bm_sz|ak_bmsc|akamai|_bm_cm|sensor_data)/i, vendor: "Akamai", sev: "high" },
    { name: "DataDome", re: /(?:datadome|dd_cookie|dd_ses|datadome_|x-dd-b)/i, vendor: "DataDome", sev: "critical" },
    { name: "PerimeterX / HUMAN", re: /(?:_pxhd|_pxvid|_px\d|px-captcha|perimeterx|humansecurity|human-challenge|px_)/i, vendor: "PerimeterX/HUMAN", sev: "critical" },
    { name: "Kasada", re: /(?:x-kpsdk-ct|x-kpsdk-cd|kasada|kp_uid)/i, vendor: "Kasada", sev: "critical" },
    { name: "Imperva / Incapsula", re: /(?:incap_ses|visid_incap|nlbi_|incapsula|imperva|_incap)/i, vendor: "Imperva", sev: "high" },
    { name: "AWS WAF", re: /(?:aws-waf-token|awswaf|awsWafCookieDomainList|captcha\.awswaf)/i, vendor: "AWS WAF", sev: "high" },
    { name: "AWS WAF Bot Control", re: /(?:awswaf-challenge|aws-waf-token|captcha\.awswaf)/i, vendor: "AWS WAF Bot", sev: "critical" },
    { name: "F5 / Shape", re: /(?:TS[0-9a-f]{8}|f5_cspm|f5_|BigIP|ShapeSecurity|x-shape)/i, vendor: "F5/Shape", sev: "high" },
    { name: "Radware", re: /(?:rbzid|radware|__uzm)/i, vendor: "Radware", sev: "high" },
    { name: "Distil Networks", re: /(?:distil|d\.distil|_d_id)/i, vendor: "Distil", sev: "high" },
    { name: "Forter", re: /(?:_fbp|_fbc|forter|ftr_)/i, vendor: "Forter", sev: "medium" },
    { name: "HUMAN Challenge", re: /(?:human-challenge|hcaptcha|challenges?\.human)/i, vendor: "HUMAN", sev: "medium" },
    { name: "Reblaze", re: /(?:reblaze|rbzid|_rbz)/i, vendor: "Reblaze", sev: "high" },
    { name: "Sucuri", re: /(?:sucuri|sucuri-cloudproxy|x-sucuri)/i, vendor: "Sucuri", sev: "medium" },
    { name: "Google Cloud Armor", re: /(?:cloud-armor|gca_)/i, vendor: "GCP Armor", sev: "medium" },
    { name: "Fastly Bot Mgmt", re: /(?:sigsc|signal[_-]?sciences|fastly-signal|fastly-client-ip|fastly-ssl)/i, vendor: "Fastly Bot", sev: "high" },
    { name: "Edgio Bot Manager", re: /(?:edgio|edg\.io|x-edg)/i, vendor: "Edgio", sev: "high" },
    { name: "Netacea", re: /(?:netacea|__na__)/i, vendor: "Netacea", sev: "high" },
    { name: "Queue-it", re: /(?:queue-it|queueittoken)/i, vendor: "Queue-it", sev: "medium" },
    { name: "Signifyd", re: /(?:signifyd)/i, vendor: "Signifyd", sev: "medium" },
    { name: "Sift Science", re: /(?:siftscience|_sift_sid)/i, vendor: "Sift", sev: "medium" },
    { name: "Kount", re: /(?:kount|ka_)/i, vendor: "Kount", sev: "medium" },
    { name: "Ravelin", re: /(?:ravelin)/i, vendor: "Ravelin", sev: "medium" },
    { name: "Riskified", re: /(?:riskified|_rs_)/i, vendor: "Riskified", sev: "medium" },
    { name: "NoFraud", re: /(?:nofraud|nf_token)/i, vendor: "NoFraud", sev: "medium" },
    { name: "Nexusguard", re: /(?:nexusguard)/i, vendor: "Nexusguard", sev: "high" },
    { name: "Bunny Shield", re: /(?:bunny\.net|b-cdn\.net.*challenge)/i, vendor: "Bunny Shield", sev: "medium" },
    { name: "Arkose Labs", re: /(?:arkoselabs|funcaptcha)/i, vendor: "Arkose Labs", sev: "high" },
    { name: "CHEQ", re: /(?:cheq|cq_)/i, vendor: "CHEQ", sev: "high" },
    { name: "GeoComply", re: /(?:geocomply|gc-)/i, vendor: "GeoComply", sev: "medium" },
    { name: "Iovation", re: /(?:iovation|io_)/i, vendor: "Iovation", sev: "medium" },
    { name: "ThreatMetrix", re: /(?:threatmetrix|tmx_)/i, vendor: "ThreatMetrix", sev: "medium" },
    { name: "BioCatch", re: /(?:biocatch|bc_)/i, vendor: "BioCatch", sev: "medium" },
    { name: "Feedzai", re: /(?:feedzai|fz_)/i, vendor: "Feedzai", sev: "medium" },
    { name: "White Ops", re: /(?:whiteops)/i, vendor: "White Ops", sev: "high" }
  ];
  function detectAntibot(haystack) {
    var s = String(haystack || ""), out = [];
    for (var i = 0; i < ANTIBOT_PATTERNS.length; i++) {
      if (ANTIBOT_PATTERNS[i].re.test(s)) out.push({ name: ANTIBOT_PATTERNS[i].name, vendor: ANTIBOT_PATTERNS[i].vendor, severity: ANTIBOT_PATTERNS[i].sev });
    }
    return out;
  }

  // ═══════════════════════════════════════════════════════════
  //  CAPTCHA (base + v7.1)
  // ═══════════════════════════════════════════════════════════
  var CAPTCHA_DETECT = [
    { kind: "Cloudflare Turnstile", re: /(?:challenges\.cloudflare\.com|turnstile)/i, sitekeyRe: /0x4[A-Za-z0-9_-]{15,}/ },
    { kind: "Cloudflare Challenge", re: /(?:cf_chl_|cf-chl-widget|cf-mitigated)/i, sitekeyRe: /0x4[A-Za-z0-9_-]{15,}/ },
    { kind: "reCAPTCHA", re: /(?:google\.com\/recaptcha|gstatic\.com\/recaptcha|grecaptcha|g-recaptcha)/i, sitekeyRe: /6L[0-9A-Za-z_-]{38}/ },
    { kind: "reCAPTCHA v3", re: /(?:grecaptcha\.execute|recaptcha\/api\.js\?render)/i, sitekeyRe: /6L[0-9A-Za-z_-]{38}/ },
    { kind: "reCAPTCHA Enterprise", re: /(?:recaptcha\/enterprise)/i, sitekeyRe: /6L[0-9A-Za-z_-]{38}/ },
    { kind: "hCaptcha", re: /(?:hcaptcha\.com|h-captcha)/i, sitekeyRe: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ },
    { kind: "Arkose / FunCaptcha", re: /(?:arkoselabs|funcaptcha|arkose\.com)/i, sitekeyRe: /[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}/ },
    { kind: "GeeTest v3", re: /(?:geetest|gt\.js|gt\.js\.v3)/i, sitekeyRe: /[a-f0-9]{32}/ },
    { kind: "GeeTest v4", re: /(?:gcaptcha4|gcaptcha4\.js|geetest\.com\/v4)/i, sitekeyRe: /[a-f0-9]{32}/ },
    { kind: "MTCaptcha", re: /(?:mtcaptcha|service\.mtcaptcha)/i, sitekeyRe: /MTPublic-[A-Za-z0-9_-]{30,}/ },
    { kind: "Friendly Captcha", re: /(?:friendlycaptcha|frc-captcha)/i, sitekeyRe: /FCM[A-Za-z0-9_-]{16,}/ },
    { kind: "Yandex SmartCaptcha", re: /(?:smartcaptcha|yandex\.ru\/captcha)/i, sitekeyRe: /ysc1_[A-Za-z0-9]{40,}/ },
    { kind: "AWS WAF Captcha", re: /(?:captcha\.awswaf|awswaf\.com\/captcha)/i, sitekeyRe: /[A-Za-z0-9+/=]{40,}/ },
    { kind: "VK Captcha", re: /(?:vk\.com\/captcha|api\.vk\.com\/captcha)/i, sitekeyRe: null },
    { kind: "DataDome Captcha", re: /(?:datadome.*captcha|ddv1_|geo\.captcha\.datadome)/i, sitekeyRe: null },
    { kind: "Prosopo Procaptcha", re: /(?:prosopo|procaptcha)/i, sitekeyRe: /5[A-Za-z0-9]{40,}/ },
    { kind: "Cloudflare JS Challenge", re: /(?:cf_clearance|jschl_vc|pass|jschl_answer)/i, sitekeyRe: null },
    { kind: "DDoS-Guard", re: /(?:ddos-guard|ddosguard)/i, sitekeyRe: null },
    { kind: "Qrator", re: /(?:qrator)/i, sitekeyRe: null },
    { kind: "Stormwall", re: /(?:stormwall)/i, sitekeyRe: null },
    { kind: "ServicePipe", re: /(?:servicepipe)/i, sitekeyRe: null },
    { kind: "Mail.ru Captcha", re: /(?:api\.captcha\.mail\.ru)/i, sitekeyRe: null }
  ];
  function detectCaptchaKind(url, body) {
    var s = String(url || "") + " " + String(body || "");
    for (var i = 0; i < CAPTCHA_DETECT.length; i++) {
      var c = CAPTCHA_DETECT[i];
      if (c.re.test(s)) {
        var sk = null;
        if (c.sitekeyRe) { var m = s.match(c.sitekeyRe); if (m) sk = m[0]; }
        return { kind: c.kind, sitekey: sk };
      }
    }
    return null;
  }
  var SITEKEY_URL_RE = [/[?&]sitekey=([^&]+)/i, /[?&]k=([^&]+)/i, /\/(0x4[A-Za-z0-9_-]{15,})\//i, /[?&]render=([A-Za-z0-9_-]{20,})/i, /\/(MTPublic-[A-Za-z0-9_-]+)\//i, /\/(ysc1_[A-Za-z0-9]+)\//i, /\/(FCM[A-Za-z0-9_-]+)/i];

  // ═══════════════════════════════════════════════════════════
  //  API heuristics
  // ═══════════════════════════════════════════════════════════
  var API_HINTS = ["/api/", "/ajax/", "/graphql", "/rest/", "/rpc/", "/v1/", "/v2/", "/v3/", ".json", "/gql", "/wp-json", "admin-ajax.php", "/_next/data/", "/_nuxt/", "/_payload", "/trpc", "/socket.io"];
  function isApi(url, method, ct) {
    if (JS_BUNDLE_EXT.test(url) || STATIC_EXT.test(url)) return false;
    if (["POST", "PUT", "DELETE", "PATCH"].indexOf(method) >= 0) return true;
    var u = url.toLowerCase();
    for (var i = 0; i < API_HINTS.length; i++) if (u.indexOf(API_HINTS[i]) >= 0) return true;
    if ((ct || "").toLowerCase().indexOf("json") >= 0) return true;
    return false;
  }
  function apiType(url) {
    var u = url.toLowerCase();
    if (u.indexOf("/graphql") >= 0 || u.indexOf("/gql") >= 0) return "graphql";
    if (u.indexOf("/trpc") >= 0) return "trpc";
    if (u.indexOf("/socket.io") >= 0) return "socketio";
    if (u.indexOf("/_next/data/") >= 0) return "next_data";
    if (u.indexOf("/_payload") >= 0) return "nuxt_payload";
    if (u.indexOf("/wp-json") >= 0) return "wp_rest";
    if (/\/api\/v?\d/.test(u)) return "versioned_api";
    if (u.indexOf("/api/") >= 0) return "generic_api";
    if (u.indexOf("/ajax/") >= 0 || u.indexOf("admin-ajax") >= 0) return "ajax";
    if (u.indexOf("/rest/") >= 0) return "rest";
    if (u.indexOf("download") >= 0) return "download_api";
    if (u.indexOf("stream") >= 0) return "stream_api";
    if (u.indexOf("search") >= 0) return "search_api";
    return "generic";
  }
  function analyzeAuth(headers) {
    var res = { required: false, type: "" };
    for (var k in (headers || {})) {
      var kl = k.toLowerCase(), v = String(headers[k] || "").toLowerCase();
      if (kl === "authorization") { res.required = true; res.type = v.indexOf("bearer") >= 0 ? "Bearer Token" : v.indexOf("basic") >= 0 ? "Basic Auth" : "Authorization"; return res; }
      if (kl === "x-api-key" || kl.indexOf("auth-token") >= 0 || kl.indexOf("access-token") >= 0 || kl === "x-csrf-token") { res.required = true; res.type = k; return res; }
    }
    return res;
  }
  function difficultyOf(auth, rate) { var s = 0; if (auth.required) s += 2; if (rate) s += 1; if (s <= 1) return "easy"; if (s <= 3) return "medium"; return "hard"; }

  // ═══════════════════════════════════════════════════════════
  //  CDN / TUNNEL / DOWNLOAD
  // ═══════════════════════════════════════════════════════════
  var CDN_HOST = [
    [/\.cloudfront\.net/i, "CloudFront"], [/\.akamaized\.net|akamaihd\.net/i, "Akamai"],
    [/\.fastly\.net/i, "Fastly"], [/\.b-cdn\.net|bunnycdn/i, "BunnyCDN"],
    [/\.cloudflarestream\.com|videodelivery\.net/i, "Cloudflare Stream"],
    [/\.googlevideo\.com/i, "Google Video"], [/\.vimeocdn\.com/i, "Vimeo"],
    [/\.mux\.com|litix\.io/i, "Mux"], [/\.jwpcdn\.com|jwplatform/i, "JW Player"],
    [/\.tiktokcdn(-us)?\.com|byteoversea|ibyteimg/i, "TikTok CDN"], [/\.azureedge\.net/i, "Azure CDN"],
    [/\.cdninstagram\.com|fbcdn\.net/i, "Meta CDN"], [/ttvnw\.net/i, "Twitch"],
    [/\.r2\.dev/i, "Cloudflare R2"], [/\.s3\.amazonaws\.com/i, "AWS S3"]
  ];
  function cdnOf(url) { for (var i = 0; i < CDN_HOST.length; i++) if (CDN_HOST[i][0].test(url)) return CDN_HOST[i][1]; return null; }

  var TUNNEL_PATTERNS = [
    [/\/tunnel\?/i, "tunnel"], [/\/share\/download/i, "terabox"], [/\/api\/download/i, "api_tunnel"],
    [/\/proxy[/_-]?download/i, "proxy_download"], [/\/stream[/_-]?proxy/i, "stream_proxy"],
    [/\/get[/_-]?file\?/i, "get_file"], [/\/download[/_-]?link/i, "download_link"],
    [/cdn\d*\.[^/]+\/[^?]+\?.*(?:token|sig|exp|key)/i, "cdn_token"],
    [/\/hls\/.*\.m3u8\?/i, "hls_tunnel"], [/\/video\/.*\?.*(?:token|key|sig)/i, "video_tunnel"],
    [/tiktokcdn.*(?:x-signature|x-expires)/i, "download_tunnel"],
    [/\/get\?[^"'\s]*(?:sig|signature|token|expires)=/i, "get_tunnel"],
    [/(?:media|dl|cdn|d)\d*\.[^/]+\/[^?]*\?[^"'\s]*(?:sig|signature|token|expires)=/i, "media_tunnel"]
  ];
  function detectTunnelType(url) { var u = url.toLowerCase(); for (var i = 0; i < TUNNEL_PATTERNS.length; i++) if (TUNNEL_PATTERNS[i][0].test(u)) return TUNNEL_PATTERNS[i][1]; return null; }
  var AUTH_Q = ["token", "sig", "signature", "key", "hash", "exp", "expires", "auth", "access", "x-signature", "x-expires", "refresh_token"];
  function hasAuthParams(url) { var u = url.toLowerCase(); for (var i = 0; i < AUTH_Q.length; i++) if (u.indexOf(AUTH_Q[i] + "=") >= 0) return true; return false; }

  var SEARCH_PARAMS = ["q", "s", "search", "query", "keyword", "term", "wd", "text"];
  function detectSearch(url) { try { var u = new URL(url); for (var i = 0; i < SEARCH_PARAMS.length; i++) { var v = u.searchParams.get(SEARCH_PARAMS[i]); if (v && v.length > 1 && v.length < 200) return { paramName: SEARCH_PARAMS[i], value: v, allParams: paramsObj(u) }; } } catch (e) {} return null; }
  function paramsObj(u) { var o = {}; try { u.searchParams.forEach(function (v, k) { o[k] = v; }); } catch (e) {} return o; }

  var DOWNLOAD_EXT = { video: [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m3u8", ".ts", ".flv", ".mpd"], audio: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".opus"], document: [".pdf", ".docx", ".xlsx", ".pptx", ".epub"], archive: [".zip", ".rar", ".7z", ".tar", ".gz"] };
  function detectDownload(url, ct) {
    var u = url.toLowerCase();
    for (var cat in DOWNLOAD_EXT) { var arr = DOWNLOAD_EXT[cat]; for (var i = 0; i < arr.length; i++) if (u.indexOf(arr[i]) >= 0) return cat; }
    if (ct) { var c = ct.toLowerCase(); if (c.indexOf("video/") >= 0) return "video"; if (c.indexOf("audio/") >= 0) return "audio"; if (c.indexOf("octet-stream") >= 0) return "data"; if (c.indexOf("/pdf") >= 0) return "document"; if (c.indexOf("zip") >= 0 || c.indexOf("rar") >= 0) return "archive"; }
    return null;
  }

  var MANIFEST_RE = /\.(m3u8|mpd)(\?|$)/i;
  var MEDIA_RE = /\.(ts|m4s|mp4|webm|m3u8|mpd|mp3|m4a|aac|flac|wav)(\?|$)/i;
  var DRM_RE = /(widevine|playready|fairplay|license|\/wv\/|\/drm\/|getlicense|acquirelicense)/i;

  function isJWT(v) { return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(v || ""); }
  function looksAuth(name, val) { var n = (name || "").toLowerCase(); if (/token|auth|session|sess|_sid|^sid$|jwt|access|secret|passwd|password|csrf|xsrf|login|bearer/.test(n)) return true; if (isJWT(val)) return true; if ((val || "").length > 40 && /^[A-Za-z0-9_.\-=]+$/.test(val)) return true; return false; }

  var SIG_HEADER_RE = /(^|-)(sign|signature|hmac|sig|digest|checksum|content-hash|amz-signature|hub-signature|cf-signature)($|-|256|1)/i;
  var SIG_PARAM_RE = /^(?:_{0,2})(sig|signature|hmac|hash|sign|nonce|ts|timestamp|expires|exp|s|sv|tsc|mac|checksum)$|^x-(?:signature|expires)$/i;
  function tokenLike(v) { v = String(v == null ? "" : v); if (v.length < 16 || v.length > 4000) return false; return isJWT(v) || /^[A-Za-z0-9._\-+/=%:]+$/.test(v); }

  function uniq(a) { var s = {}, o = []; for (var i = 0; i < a.length; i++) if (!s[a[i]]) { s[a[i]] = 1; o.push(a[i]); } return o; }
  function extractUrls(text) { var out = [], seen = {}, re = /https?:\/\/[^\s"'<>()\\]+/g, m; while ((m = re.exec(String(text == null ? "" : text))) !== null) { var u = m[0].replace(/[.,;)]+$/, ""); if (!seen[u]) { seen[u] = 1; out.push(u); } if (out.length > 120) break; } return out; }

  // ═══════════════════════════════════════════════════════════
  //  Security headers analysis
  // ═══════════════════════════════════════════════════════════
  function analyzeSecurityHeaders(respHeaders, url) {
    var h = {}; for (var k in (respHeaders || {})) h[k.toLowerCase()] = respHeaders[k];
    var out = { headers: {}, issues: [], score: 0, max: 0, flags: [] };

    function chk(name, label, weight, okTest, badVal) {
      out.max += weight;
      var v = h[name];
      if (v == null) { out.issues.push({ name: name, label: label, severity: "medium", msg: "ausente" }); return; }
      out.headers[name] = v;
      if (okTest && !okTest(v)) { out.issues.push({ name: name, label: label, severity: "high", msg: "débil: " + (badVal || v), value: v }); return; }
      out.score += weight;
    }
    chk("strict-transport-security", "HSTS", 2, function (v) { return /max-age=\d{5,}/i.test(v); }, "max-age demasiado corto");
    chk("content-security-policy", "CSP", 3, function (v) { return v && v.length > 20 && !/unsafe-inline|unsafe-eval/i.test(v.split("script-src")[1] || ""); }, "CSP con unsafe-inline/unsafe-eval");
    chk("x-frame-options", "X-Frame-Options", 1);
    chk("x-content-type-options", "X-Content-Type-Options", 1, function (v) { return /nosniff/i.test(v); }, "no nosniff");
    chk("referrer-policy", "Referrer-Policy", 1);
    chk("permissions-policy", "Permissions-Policy", 1);
    chk("cross-origin-opener-policy", "COOP", 1);
    chk("cross-origin-embedder-policy", "COEP", 1);
    chk("cross-origin-resource-policy", "CORP", 1);

    ["server", "x-powered-by", "x-aspnet-version", "x-aspnetmvc-version", "x-generator", "x-drupal-cache", "x-runtime"].forEach(function (name) {
      if (h[name]) out.flags.push({ name: name, label: "Versión/stack expuesto", value: h[name], severity: "low" });
    });

    var acao = h["access-control-allow-origin"];
    if (acao === "*") out.flags.push({ name: "cors-wildcard", label: "CORS abierto (*)", value: acao, severity: "medium" });
    if (acao === "*" && h["access-control-allow-credentials"] === "true") out.flags.push({ name: "cors-creds-wildcard", label: "CORS * + credentials (❗peligroso)", value: acao, severity: "critical" });

    var sc = h["set-cookie"];
    if (sc) {
      var cookies = Array.isArray(sc) ? sc : [sc];
      cookies.forEach(function (c) {
        var parts = String(c).split(";").map(function (x) { return x.trim().toLowerCase(); });
        var name = String(c).split("=")[0].trim();
        var flags = { secure: false, httpOnly: false, sameSite: null };
        parts.forEach(function (p) { if (p === "secure") flags.secure = true; if (p === "httponly") flags.httpOnly = true; var m = p.match(/^samesite=(strict|lax|none)$/); if (m) flags.sameSite = m[1]; });
        var issues = [];
        if (!flags.secure) issues.push("sin Secure");
        if (!flags.httpOnly) issues.push("sin HttpOnly");
        if (flags.sameSite === "none" && !flags.secure) issues.push("SameSite=None sin Secure");
        if (issues.length) out.flags.push({ name: "cookie:" + name, label: "Cookie " + name, value: issues.join(", "), severity: "medium" });
      });
    }

    if (h["cf-mitigated"]) out.flags.push({ name: "cf-mitigated", label: "Cloudflare MITIGATED", value: h["cf-mitigated"], severity: "high" });
    if (h["cf-ray"]) out.flags.push({ name: "cf-ray", label: "Cloudflare Ray (IP + colo)", value: h["cf-ray"], severity: "info" });
    if (h["cf-cache-status"]) out.headers["cf-cache-status"] = h["cf-cache-status"];

    var ab = detectAntibot(JSON.stringify(h));
    ab.forEach(function (a) { out.flags.push({ name: "antibot:" + a.vendor, label: a.name, value: a.vendor, severity: a.severity }); });

    return out;
  }

  // ═══════════════════════════════════════════════════════════
  //  Classify entry
  // ═══════════════════════════════════════════════════════════
  function classify(e) {
    var tags = [];
    if (isNoise(e.url)) { tags.push("NOISE"); e.noiseCat = categorizeNoise(e.url); }
    var cdn = cdnOf(e.url); if (cdn) { tags.push("CDN"); e.cdn = cdn; }
    if (MANIFEST_RE.test(e.url)) { tags.push("MEDIA"); e.manifest = /\.m3u8/i.test(e.url) ? "HLS" : "DASH"; }
    else if (MEDIA_RE.test(e.url)) tags.push("MEDIA");
    if (DRM_RE.test(e.url + " " + (e.respCT || ""))) tags.push("DRM");
    var tt = detectTunnelType(e.url); if (tt && (hasAuthParams(e.url) || (e.tags && e.tags.indexOf("TUNNEL") >= 0))) { tags.push("TUNNEL"); e.tunnelType = tt; }
    var dl = detectDownload(e.url, e.respCT); if (dl) { tags.push("DOWNLOAD"); e.download = dl; }
    if (e.forceDownload && tags.indexOf("DOWNLOAD") < 0) { tags.push("DOWNLOAD"); e.download = e.download || "file"; }
    var sq = detectSearch(e.url); if (sq) { tags.push("SEARCH"); e.search = sq; }
    var cap = detectCaptchaKind(e.url, e.reqBody || e.respBody);
    if (cap) { tags.push("CAPTCHA"); e.captcha = cap.kind; if (cap.sitekey) e.sitekey = cap.sitekey; }
    for (var i = 0; i < SITEKEY_URL_RE.length; i++) { var m = SITEKEY_URL_RE[i].exec(e.url); if (m && m[1] && m[1].length >= 15) { tags.push("CAPTCHA"); e.sitekey = m[1]; break; } }
    if (isApi(e.url, e.method, e.respCT)) { tags.push("API"); e.apiType = apiType(e.url); }
    var abHay = [e.url, JSON.stringify(e.reqHeaders || {}), JSON.stringify(e.respHeaders || {}), e.reqBody || "", (e.respBody || "").substring(0, 5000)].join("\n");
    var ab = detectAntibot(abHay);
    if (ab.length) { tags.push("ANTIBOT"); e.antibot = ab; }
    var blob = [e.url, JSON.stringify(e.reqHeaders || {}), JSON.stringify(e.respHeaders || {}), e.reqBody || "", (e.respBody || "").substring(0, 20000)].join("\n");
    var secrets = scanSecrets(blob, e.url);
    if (secrets.length) { tags.push("SECRET"); e.secrets = secrets; }
    var piiTxt = (e.reqBody || "") + "\n" + (e.respBody || "").substring(0, 20000);
    var pii = scanPII(piiTxt, e.url);
    if (pii.length) { tags.push("PII"); e.pii = pii; }
    if (analyzeAuth(e.reqHeaders).required) tags.push("AUTH");
    if (hasAuthParams(e.url) || analyzeAuth(e.reqHeaders).required) e.signed = true;
    if (e.respHeaders && Object.keys(e.respHeaders).length && !e.passive) {
      try { e.security = analyzeSecurityHeaders(e.respHeaders, e.url); } catch (x) {}
    }
    e.tags = uniq(tags);
    return e;
  }

  // ═══════════════════════════════════════════════════════════
  //  Sitekey collector
  // ═══════════════════════════════════════════════════════════
  function sitekeyType(cls, k) {
    if (/turnstile|cf-/i.test(cls) || /^0x4/.test(k)) return "Cloudflare Turnstile";
    if (/h-?captcha/i.test(cls) || /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(k)) return "hCaptcha";
    if (/g-?recaptcha|recaptcha/i.test(cls) || /^6L/.test(k)) return "reCAPTCHA";
    if (/arkose|funcaptcha/i.test(cls)) return "Arkose/FunCaptcha";
    if (/geetest|gt/i.test(cls)) return "GeeTest";
    if (/mtcaptcha|MTPublic/i.test(cls) || /^MTPublic-/.test(k)) return "MTCaptcha";
    if (/friendlycaptcha|FCM/i.test(cls) || /^FCM/.test(k)) return "Friendly Captcha";
    if (/smartcaptcha|ysc1/i.test(cls) || /^ysc1_/.test(k)) return "Yandex SmartCaptcha";
    if (/awswaf|aws-waf/i.test(cls)) return "AWS WAF Captcha";
    if (/^[A-Fa-f0-9]{40,}$/.test(k)) return "HEX key";
    return "Unknown CAPTCHA";
  }
  function validKey(k) { if (!k || k.length < 15 || k.length > 200) return false; if (/^(undefined|null|true|false|function|return|https?|var |const |let )/i.test(k)) return false; if (/^[0-9]+$/.test(k)) return false; return true; }
  function collectSitekeys() {
    var out = [], seen = {};
    function add(k, type, src) { k = (k || "").trim(); if (!validKey(k) || seen[k]) return; seen[k] = 1; out.push({ key: k, type: type || sitekeyType("", k), source: src, confidence: /^0x4|^6L|^MTPublic|^ysc1|^FCM/.test(k) ? 1 : 0.85 }); }
    function walk(o, d) { if (d > 5 || !o || typeof o !== "object") return; for (var key in o) { try { var v = o[key]; if (typeof v === "string" && (/^0x4|^6L|^MTPublic-|^ysc1_|^FCM/.test(v) || /sitekey|turnstile/i.test(key))) add(v, null, "global:" + key); else if (v && typeof v === "object") walk(v, d + 1); } catch (e) {} } }
    try {
      var sels = ["[data-sitekey]", ".g-recaptcha", ".h-captcha", ".cf-turnstile", "[data-cf-sitekey]", "[id^='cf-chl-widget']", ".frc-captcha", ".mtcaptcha", "[data-p-key]"];
      for (var i = 0; i < sels.length; i++) { var els = document.querySelectorAll(sels[i]); for (var j = 0; j < els.length; j++) { var el = els[j], k = el.getAttribute("data-sitekey") || el.getAttribute("data-cf-sitekey") || el.getAttribute("data-p-key"); if (k) add(k, sitekeyType((el.className || "") + " " + (el.id || ""), k), "dom:" + sels[i]); } }
      var html = document.documentElement ? document.documentElement.innerHTML.slice(0, 500000) : "";
      [/data-sitekey=["']([^"']+)["']/gi, /data-cf-sitekey=["']([^"']+)["']/gi, /['"]?sitekey['"]?\s*[:=]\s*['"]([^'"]{15,})['"]/gi, /['"](0x4[A-Fa-f0-9]{15,})['"]/g, /['"](6L[0-9A-Za-z_-]{38})['"]/g, /['"](MTPublic-[A-Za-z0-9_-]+)['"]/g, /['"](ysc1_[A-Za-z0-9]{40,})['"]/g, /['"](FCM[A-Za-z0-9_-]{16,})['"]/g, /grecaptcha\.(?:enterprise\.)?render\([^,]+,\s*\{[^}]*['"]?sitekey['"]?\s*:\s*['"]([^'"]+)['"]/gi, /\bturnstile\.render\([^,]+,\s*\{[^}]*['"]?sitekey['"]?\s*:\s*['"]([^'"]+)['"]/gi].forEach(function (re) { var r = new RegExp(re.source, re.flags), m; while ((m = r.exec(html)) !== null) add(m[2] || m[1] || m[0], null, "inline"); });
      ["__NEXT_DATA__", "__NUXT__", "__RSC_DATA__", "__INITIAL_STATE__", "__APOLLO_STATE__", "___grecaptcha_cfg", "_cf_chl_opt", "__cf_chl_opt", "_cf_chl_ctx"].forEach(function (g) { try { if (window[g]) walk(window[g], 0); } catch (e) {} });
      try { var cfo = window._cf_chl_opt || window.__cf_chl_opt; if (cfo) { if (cfo.sitekey) add(cfo.sitekey, "Cloudflare Turnstile", "_cf_chl_opt.sitekey"); if (cfo.cRay && /0x4/.test(String(cfo.cRay))) { var rm = String(cfo.cRay).match(/0x4[A-Za-z0-9_-]{15,}/); if (rm) add(rm[0], "Cloudflare Turnstile", "_cf_chl_opt.cRay"); } } } catch (e) {}
      ["localStorage", "sessionStorage"].forEach(function (t) { try { var st = window[t]; if (!st) return; for (var i2 = 0; i2 < st.length; i2++) { var v = st.getItem(st.key(i2)); if (v && (/^0x4|^6L|^MTPublic|^ysc1|^FCM/.test(v) || /sitekey/i.test(v))) { var m = v.match(/0x4[A-Za-z0-9_-]{15,}|6L[0-9A-Za-z_-]{38}|MTPublic-[A-Za-z0-9_-]+|ysc1_[A-Za-z0-9]+|FCM[A-Za-z0-9_-]+/); if (m) add(m[0], null, t); } } } catch (e) {} });
      for (var e2 = 0; e2 < store.entries.length; e2++) { var u = store.entries[e2].url || "", m2, re2 = /[?&](?:sitekey|k|render)=([^&]+)/gi; while ((m2 = re2.exec(u)) !== null) { try { add(decodeURIComponent(m2[1]), null, "network"); } catch (x) { add(m2[1], null, "network"); } } var ukm = u.match(/0x4[A-Za-z0-9_-]{15,}|6L[0-9A-Za-z_-]{38}|MTPublic-[A-Za-z0-9_-]+|ysc1_[A-Za-z0-9]+/); if (ukm) add(ukm[0], null, "network-url"); }
      try { document.querySelectorAll("script[src]").forEach(function (s) { var src = s.getAttribute("src") || ""; var km = src.match(/(0x4[A-Fa-f0-9]{15,}|6L[0-9A-Za-z_-]{38}|MTPublic-[A-Za-z0-9_-]+)/); if (km) add(km[1], null, "script-src"); }); } catch (e) {}
      try { if (typeof deepData !== "undefined" && deepData.jsSitekeys) deepData.jsSitekeys.forEach(function (k) { add(k, null, "js-bundle"); }); } catch (e) {}
      try { document.querySelectorAll("iframe").forEach(function (f) { var src = f.getAttribute("src") || ""; if (!src) return; var t = src.match(/(0x4[A-Za-z0-9_-]{15,})/); if (t) add(t[1], "Cloudflare Turnstile", "iframe"); var g = src.match(/[?&#]k=([^&#]+)/) || src.match(/(6L[0-9A-Za-z_-]{38})/); if (g) { try { add(decodeURIComponent(g[1]), /recaptcha/i.test(src) ? "reCAPTCHA" : null, "iframe"); } catch (x) { add(g[1], null, "iframe"); } } var hc = src.match(/sitekey=([0-9a-f-]{20,})/i); if (hc) add(hc[1], "hCaptcha", "iframe"); }); } catch (e) {}
    } catch (e) {}
    return out;
  }
  function detectCaptchaWidgets() {
    var out = [], seen = {};
    function addW(type, sitekey, src) { var key = type + "|" + (sitekey || ""); if (seen[key]) return; seen[key] = 1; out.push({ type: type, sitekey: sitekey || null, action: null, source: src }); }
    try {
      document.querySelectorAll(".cf-turnstile,.g-recaptcha,.h-captcha,.frc-captcha,.mtcaptcha,[data-sitekey],[data-cf-sitekey],[data-p-key],[id^='cf-chl-widget']").forEach(function (el) { var sk = el.getAttribute("data-sitekey") || el.getAttribute("data-cf-sitekey") || el.getAttribute("data-p-key"); var cls = (el.className || "") + " " + (el.id || ""); if (sk) addW(sitekeyType(cls, sk), sk, "dom"); else if (/cf-chl-widget|cf-turnstile/.test(cls)) addW("Cloudflare Turnstile", null, "dom-cf"); });
      document.querySelectorAll("iframe").forEach(function (f) {
        var src = f.getAttribute("src") || ""; if (!src) return;
        if (/challenges\.cloudflare\.com/i.test(src)) { var m = src.match(/(0x4[A-Za-z0-9_-]{15,})/); addW("Cloudflare Turnstile", m ? m[1] : null, "iframe"); }
        else if (/recaptcha/i.test(src)) { var m2 = src.match(/[?&]k=([^&]+)/); addW("reCAPTCHA", m2 ? decodeURIComponent(m2[1]) : null, "iframe"); }
        else if (/hcaptcha/i.test(src)) { var m3 = src.match(/sitekey=([0-9a-f-]{20,})/i); addW("hCaptcha", m3 ? m3[1] : null, "iframe"); }
        else if (/arkoselabs|funcaptcha/i.test(src)) { var m4 = src.match(/([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})/i); addW("Arkose/FunCaptcha", m4 ? m4[1] : null, "iframe"); }
      });
    } catch (e) {}
    return out;
  }

  function cookieIntel() {
    var out = [];
    try { var cs = (document.cookie || "").split(";"); for (var i = 0; i < cs.length; i++) { var idx = cs[i].indexOf("="); if (idx < 0) continue; var n = cs[i].slice(0, idx).trim(), v = cs[i].slice(idx + 1).trim(); if (!n) continue; out.push({ name: n, value: v, isAuth: looksAuth(n, v), isJWT: isJWT(v), length: v.length }); } } catch (e) {}
    return out;
  }
  function storageIntel() {
    var out = [];
    ["localStorage", "sessionStorage"].forEach(function (type) {
      try { var st = window[type]; if (!st) return; for (var i = 0; i < st.length; i++) { var k = st.key(i), v = st.getItem(k) || ""; out.push({ key: k, value: v.slice(0, 300), isAuth: looksAuth(k, v), isJWT: isJWT(v), length: v.length, type: type }); } } catch (e) {}
    });
    return out;
  }

  function b64d(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
  function jwtInfo(t) {
    try {
      var p = String(t).split(".");
      if (p.length < 2) return null;
      var header = JSON.parse(b64d(p[0])), payload = JSON.parse(b64d(p[1]));
      var exp = payload.exp ? new Date(payload.exp * 1000) : null;
      return { header: header, payload: payload, exp: exp, expired: exp ? exp.getTime() < Date.now() : false, alg: header.alg || "?", sub: payload.sub != null ? payload.sub : null, iss: payload.iss || null, aud: payload.aud || null };
    } catch (e) { return null; }
  }

  var TOKEN_CLASS = [
    [/refresh/i, "Refresh Token", "♻️"],
    [/access|bearer|id[_-]?token|jwt|auth|sanctum|next-?auth|machine|session[_-]?token/i, "Access Token", "🎟️"],
    [/csrf|xsrf/i, "CSRF Token", "🛡️"],
    [/session|jsessionid|phpsessid|connect\.sid|_sid|^sid$/i, "Session ID", "🍪"],
    [/api[_-]?key|apikey|app[_-]?key|public[_-]?key|publishable|client[_-]?id/i, "API Key", "🗝️"],
    [/cf_clearance|__cf_bm|cfuvid/i, "Cloudflare", "☁️"],
    [/device|fingerprint|anon|guest|visitor|tracking/i, "Device ID", "📱"],
    [/password|passwd|secret/i, "Secret", "🔒"]
  ];
  function classifyTokenName(name, where, value) {
    if (isJWT(value)) return { type: "JWT", icon: "🔓" };
    if (/^Bearer\s/i.test(value)) return { type: "Bearer Token", icon: "🎟️" };
    if (/^Basic\s/i.test(value)) return { type: "Basic Auth", icon: "🔒" };
    var s = (name || "") + " " + (where || "");
    for (var i = 0; i < TOKEN_CLASS.length; i++) if (TOKEN_CLASS[i][0].test(s)) return { type: TOKEN_CLASS[i][1], icon: TOKEN_CLASS[i][2] };
    return null;
  }
  function collectTokens() {
    var out = [], seen = {};
    function add(name, value, where) {
      value = String(value == null ? "" : value).trim();
      if (value.length < 8 || value.length > 8000) return;
      if (/^(true|false|null|undefined|NaN|Infinity|\[object)/i.test(value)) return;
      var key = where + "|" + name + "|" + value;
      if (seen[key]) return; seen[key] = 1;
      var cls = classifyTokenName(name, where, value) || { type: "Token", icon: "🎟️" };
      var t = { name: String(name || cls.type), value: value, where: where, type: cls.type, icon: cls.icon };
      if (isJWT(value)) t.jwt = jwtInfo(value);
      out.push(t);
    }
    try { cookieIntel().forEach(function (c) { if (c.isAuth || c.isJWT) add(c.name, c.value, "cookie"); }); } catch (e) {}
    try { storageIntel().forEach(function (s) { if (s.isAuth || s.isJWT) add(s.key, s.value, s.type); }); } catch (e) {}
    try {
      var html = document.documentElement ? document.documentElement.innerHTML.slice(0, 300000) : "";
      var HRE = /"((?:access|refresh|id|auth|session|api|csrf|xsrf|machine|device|guest|anonymous)[_-]?(?:token|key))"\s*:\s*"([^"\\]{10,4000})"/gi, hm;
      while ((hm = HRE.exec(html)) !== null) add(hm[1], hm[2], "inline-html");
    } catch (e) {}
    var E = store.entries, from = Math.max(0, E.length - 500);
    for (var i = from; i < E.length; i++) {
      var e = E[i];
      try {
        var rh = e.reqHeaders || {};
        for (var k in rh) {
          var kl = k.toLowerCase(), hv = String(rh[k]);
          if (kl === "authorization") { var m = hv.match(/^(\w+)\s+(\S+)$/); if (m) add("authorization-" + m[1].toLowerCase(), m[2], "header:" + String(e.url).split("?")[0].slice(0, 60)); }
          else if (/token|api[-_]?key|x-api|session|secret|bearer/i.test(kl) && hv.length >= 8) add(k, hv, "header:" + String(e.url).split("?")[0].slice(0, 60));
        }
      } catch (x) {}
      if (e.respBody) {
        var FRE = /"([A-Za-z0-9_.\-]{2,40})"\s*:\s*"([^"\\]{10,4000})"/g, mm, src = String(e.respBody);
        while ((mm = FRE.exec(src)) !== null) {
          var nm = mm[1];
          if (!/token|jwt|secret|key/i.test(nm) || /keyword|monkey|hotkey|keyframe|keynote/i.test(nm)) continue;
          add(nm, mm[2], "response:" + String(e.url).split("?")[0].slice(0, 60));
          if (out.length > 450) break;
        }
      }
      try { var u = new URL(e.url); ["access_token", "id_token", "token", "refresh_token", "session_state"].forEach(function (pn) { var pv = u.searchParams.get(pn); if (pv && pv.length >= 8) add(pn, pv, "url-param"); }); } catch (x) {}
    }
    var uniqV = {}, res = [];
    for (var j = 0; j < out.length; j++) { var vk = out[j].type + "|" + out[j].value; if (uniqV[vk]) continue; uniqV[vk] = 1; res.push(out[j]); }
    return res.slice(0, 300);
  }

  function collectBrowserEnv() {
    var env = {};
    function t(fn) { try { return fn(); } catch (e) { return null; } }
    env.userAgent = t(function () { return navigator.userAgent; });
    env.platform = t(function () { return navigator.platform; });
    env.language = t(function () { return navigator.language; });
    env.languages = t(function () { return navigator.languages ? navigator.languages.slice(0, 10) : null; });
    env.acceptLanguage = t(function () { var ls = navigator.languages; if (!ls || !ls.length) return navigator.language || null; return ls.map(function (l, i) { return i === 0 ? l : l + ";q=" + Math.max(0.1, 1 - i * 0.1).toFixed(1); }).join(","); });
    env.referer = t(function () { return location.href; });
    env.origin = t(function () { return location.origin; });
    env.documentReferrer = t(function () { return document.referrer || null; });
    env.timezone = t(function () { return Intl.DateTimeFormat().resolvedOptions().timeZone; });
    env.screen = t(function () { return { width: screen.width, height: screen.height, dpr: window.devicePixelRatio }; });
    env.hardwareConcurrency = t(function () { return navigator.hardwareConcurrency; });
    env.deviceMemory = t(function () { return navigator.deviceMemory; });
    var uad = t(function () { return navigator.userAgentData; });
    if (uad) {
      env.uaMobile = !!uad.mobile;
      env.uaPlatform = uad.platform || null;
      env.secChUa = t(function () { return (uad.brands || []).map(function (b) { return '"' + b.brand + '";v="' + b.version + '"'; }).join(", "); });
    }
    var sh = {};
    if (env.userAgent) sh["User-Agent"] = env.userAgent;
    if (env.acceptLanguage) sh["Accept-Language"] = env.acceptLanguage;
    if (env.referer) sh["Referer"] = env.referer;
    if (env.origin) sh["Origin"] = env.origin;
    if (env.secChUa) { sh["sec-ch-ua"] = env.secChUa; sh["sec-ch-ua-mobile"] = env.uaMobile ? "?1" : "?0"; if (env.uaPlatform) sh["sec-ch-ua-platform"] = '"' + env.uaPlatform + '"'; }
    env.suggestedHeaders = sh;
    return env;
  }

  // ═══════════════════════════════════════════════════════════
  //  v7.1 — Collectors extra
  // ═══════════════════════════════════════════════════════════
  function collectJSONLD() {
    var out = [];
    try { document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) { try { out.push(JSON.parse(s.textContent)); } catch (e) {} }); } catch (e) {}
    return out;
  }
  function collectOpenGraph() {
    var out = {};
    try { document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[property^="article:"]').forEach(function (m) { out[m.getAttribute("property") || m.getAttribute("name")] = m.getAttribute("content"); }); } catch (e) {}
    return out;
  }
  function collectAnalyticsIDs() {
    var out = {}, html = "";
    try { html = document.documentElement.innerHTML.slice(0, 500000); } catch (e) {}
    function grab(re, key) { var m, s = {}, r = new RegExp(re.source, re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g"); while ((m = r.exec(html)) !== null) { s[m[1] || m[0]] = 1; if (Object.keys(s).length > 40) break; } out[key] = Object.keys(s); }
    grab(/\b(G|UA|AW|DC)-[A-Z0-9]{6,}-?\d*/g, "google");
    grab(/\b(GTM-[A-Z0-9]{6,})/g, "gtm");
    grab(/fbq\(['"]init['"],\s*['"](\d{15,16})['"]/g, "facebook_pixel");
    grab(/ttq\.load\(['"](\w{20})['"]/g, "tiktok_pixel");
    grab(/hj\(['"](\d{6,9})['"]/g, "hotjar");
    grab(/mixpanel\.init\(['"]([a-f0-9]{32})['"]/g, "mixpanel");
    grab(/phc_[A-Za-z0-9]{40,}/g, "posthog");
    grab(/_linkedin_partner_id\s*=\s*['"](\d{6,8})['"]/g, "linkedin");
    grab(/clarity\.ms\/tag\/([a-z0-9]{10})/gi, "clarity");
    return out;
  }
  function collectCacheStorage() {
    return new Promise(function (res) {
      try {
        if (!self.caches) return res([]);
        caches.keys().then(function (keys) {
          var out = [], pending = keys.length;
          if (!pending) return res(out);
          keys.forEach(function (k) {
            caches.open(k).then(function (c) { return c.keys(); }).then(function (reqs) {
              out.push({ name: k, entries: reqs.slice(0, 200).map(function (r) { return { url: r.url, method: r.method }; }) });
              if (--pending === 0) res(out);
            }).catch(function () { if (--pending === 0) res(out); });
          });
        }).catch(function () { res([]); });
      } catch (e) { res([]); }
    });
  }
  function collectIndexedDBDetail() {
    return new Promise(function (res) {
      try {
        if (!indexedDB || !indexedDB.databases) return res([]);
        indexedDB.databases().then(function (dbs) {
          var out = [], pending = dbs.length;
          if (!pending) return res(out);
          dbs.forEach(function (info) {
            try {
              var req = indexedDB.open(info.name);
              req.onsuccess = function () { var db = req.result; out.push({ name: db.name, version: db.version, stores: Array.from(db.objectStoreNames) }); db.close(); if (--pending === 0) res(out); };
              req.onerror = function () { if (--pending === 0) res(out); };
            } catch (e) { if (--pending === 0) res(out); }
          });
        }).catch(function () { res([]); });
      } catch (e) { res([]); }
    });
  }
  var workerURLs = [];
  (function () {
    try {
      if (window.Worker && !window.Worker.__spyderx_spied) {
        var W = window.Worker;
        window.Worker = function (url, opts) { try { workerURLs.push({ type: "worker", url: String(url), opts: opts || null }); } catch (e) {} return new W(url, opts); };
        window.Worker.prototype = W.prototype;
        window.Worker.__spyderx_spied = true;
      }
      if (window.SharedWorker && !window.SharedWorker.__spyderx_spied) {
        var SW = window.SharedWorker;
        window.SharedWorker = function (url, opts) { try { workerURLs.push({ type: "shared", url: String(url) }); } catch (e) {} return new SW(url, opts); };
        window.SharedWorker.prototype = SW.prototype;
        window.SharedWorker.__spyderx_spied = true;
      }
    } catch (e) {}
  })();
  var sseURLs = [];
  (function () {
    try {
      if (window.EventSource && !window.EventSource.__spyderx_spied) {
        var ES = window.EventSource;
        window.EventSource = function (url, opts) {
          sseURLs.push(url);
          var es = new ES(url, opts);
          try { store.add({ kind: "sse", url: absURL(url), method: "SSE", status: 200, pending: false, respHeaders: {} }); } catch (e) {}
          return es;
        };
        window.EventSource.prototype = ES.prototype;
        window.EventSource.__spyderx_spied = true;
      }
    } catch (e) {}
  })();
  function collectPerformanceDetail() {
    var out = {};
    try {
      var entries = performance.getEntriesByType("resource") || [];
      out.total = entries.length;
      out.byType = {};
      entries.forEach(function (e) { out.byType[e.initiatorType] = (out.byType[e.initiatorType] || 0) + 1; });
      out.navigation = (performance.getEntriesByType("navigation")[0] || {}).toJSON ? performance.getEntriesByType("navigation")[0].toJSON() : null;
      out.paint = performance.getEntriesByType("paint").map(function (p) { return { name: p.name, start: Math.round(p.startTime) }; });
      out.largestContentfulPaint = (performance.getEntriesByType("largest-contentful-paint")[0] || {}).startTime || null;
      out.firstInputDelay = (performance.getEntriesByType("first-input")[0] || {}).processingStart || null;
      var layoutShift = 0;
      (performance.getEntriesByType("layout-shift") || []).forEach(function (l) { if (!l.hadRecentInput) layoutShift += l.value; });
      out.cumulativeLayoutShift = Math.round(layoutShift * 10000) / 10000;
      out.memory = performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize, totalJSHeapSize: performance.memory.totalJSHeapSize, jsHeapSizeLimit: performance.memory.jsHeapSizeLimit } : null;
    } catch (e) {}
    return out;
  }
  function detectWebAuthn() {
    var out = [];
    try { if (window.PublicKeyCredential) out.push("WebAuthn disponible"); } catch (e) {}
    try { if (navigator.credentials) out.push("Credentials API disponible"); } catch (e) {}
    try { if (window.PasswordCredential) out.push("PasswordCredential disponible"); } catch (e) {}
    return out;
  }
  function detectCapabilities() {
    var out = {};
    try {
      out.webRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
      out.camera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      out.screenShare = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
      out.geolocation = !!navigator.geolocation;
      out.bluetooth = !!navigator.bluetooth;
      out.usb = !!navigator.usb;
      out.serial = !!navigator.serial;
      out.hid = !!navigator.hid;
      out.clipboard = !!navigator.clipboard;
      out.share = !!navigator.share;
      out.vibration = !!navigator.vibrate;
      out.battery = !!navigator.getBattery;
      out.gamepads = !!navigator.getGamepads;
      out.speech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      out.notifications = !!window.Notification;
      out.push = "PushManager" in window;
      out.serviceWorker = "serviceWorker" in navigator;
      out.wakeLock = "wakeLock" in navigator;
      out.fileSystem = !!window.showOpenFilePicker;
      out.payment = !!window.PaymentRequest;
      out.credentials = !!navigator.credentials;
      out.webAuthn = !!window.PublicKeyCredential;
      out.webGL = !!document.createElement("canvas").getContext("webgl");
      out.webGL2 = !!document.createElement("canvas").getContext("webgl2");
      out.webGPU = "gpu" in navigator;
      out.wasm = typeof WebAssembly === "object";
      out.sharedArrayBuffer = typeof SharedArrayBuffer === "function";
      out.atomics = typeof Atomics === "object";
      out.OffscreenCanvas = typeof OffscreenCanvas === "function";
      out.fullscreen = !!document.documentElement.requestFullscreen;
      out.pictureInPicture = !!document.pictureInPictureEnabled;
      out.encryptedMedia = !!navigator.requestMediaKeySystemAccess;
      out.webXr = !!navigator.xr;
      out.idleDetection = "IdleDetector" in window;
      out.eyeDropper = "EyeDropper" in window;
    } catch (e) {}
    return out;
  }
  function detectWebRTCLeak() {
    return new Promise(function (res) {
      try {
        var RTCPeer = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        if (!RTCPeer) return res(null);
        var pc = new RTCPeer({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        var ips = [];
        pc.createDataChannel("");
        pc.onicecandidate = function (e) {
          if (!e.candidate) { try { pc.close(); } catch (x) {} return res({ candidates: ips }); }
          var c = e.candidate.candidate || "";
          var m = c.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-f0-9:]{6,})/i);
          if (m) ips.push(m[1]);
        };
        pc.createOffer().then(function (o) { pc.setLocalDescription(o); }).catch(function () { res(null); });
        setTimeout(function () { try { pc.close(); } catch (x) {} res({ candidates: ips, timeout: true }); }, 3500);
      } catch (e) { res(null); }
    });
  }
  function collectStorageKeysDetail() {
    var out = { localStorage: [], sessionStorage: [] };
    try {
      ["localStorage", "sessionStorage"].forEach(function (t) {
        var st = window[t]; if (!st) return;
        for (var i = 0; i < st.length; i++) {
          var k = st.key(i), v = st.getItem(k) || "";
          out[t].push({ key: k, valuePreview: v.slice(0, 80), length: v.length, isJWT: isJWT(v), looksAuth: looksAuth(k, v) });
        }
      });
    } catch (e) {}
    return out;
  }
  function collectSetCookiesFromTraffic() {
    var out = [], seen = {};
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i], sc = (e.respHeaders || {})["set-cookie"];
      if (!sc) continue;
      var arr = Array.isArray(sc) ? sc : [sc];
      arr.forEach(function (c) {
        var name = String(c).split("=")[0].trim();
        if (!name || seen[name]) return; seen[name] = 1;
        var parts = String(c).split(";").map(function (x) { return x.trim(); });
        var attrs = { secure: false, httpOnly: false, sameSite: null, domain: null, path: null };
        parts.slice(1).forEach(function (p) {
          var low = p.toLowerCase();
          if (low === "secure") attrs.secure = true;
          else if (low === "httponly") attrs.httpOnly = true;
          else if (/^samesite=/.test(low)) attrs.sameSite = low.split("=")[1];
          else if (/^domain=/.test(low)) attrs.domain = p.split("=")[1];
          else if (/^path=/.test(low)) attrs.path = p.split("=")[1];
        });
        out.push({ name: name, raw: String(c).slice(0, 300), attrs: attrs, url: e.url });
      });
    }
    return out;
  }
  function collectDeepLinks() {
    var out = [], seen = {};
    try {
      var html = document.documentElement.innerHTML.slice(0, 500000);
      var re = /(?:intent:\/\/[^\s"'<>]+|myapp:\/\/[^\s"'<>]+|[a-z][a-z0-9-]*:\/\/[^\s"'<>]+)/g, m;
      while ((m = re.exec(html)) !== null) {
        var u = m[0];
        if (/^https?:|^data:|^blob:|^javascript:|^about:|^chrome:/.test(u)) continue;
        if (seen[u]) continue; seen[u] = 1;
        out.push(u);
        if (out.length > 60) break;
      }
    } catch (e) {}
    return out;
  }
  function collectResourceHints() {
    var out = { prefetch: [], preload: [], dnsPrefetch: [], preconnect: [], modulePreload: [], prerender: [] };
    try {
      document.querySelectorAll('link[rel]').forEach(function (l) {
        var rel = (l.getAttribute("rel") || "").toLowerCase();
        var href = l.getAttribute("href") || "";
        if (!href) return;
        if (rel === "prefetch") out.prefetch.push(href);
        else if (rel === "preload") out.preload.push({ href: href, as: l.getAttribute("as") });
        else if (rel === "dns-prefetch") out.dnsPrefetch.push(href);
        else if (rel === "preconnect") out.preconnect.push(href);
        else if (rel === "modulepreload") out.modulePreload.push(href);
        else if (rel === "prerender") out.prerender.push(href);
      });
    } catch (e) {}
    return out;
  }
  function collectAlternates() {
    var out = [];
    try { document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (l) { out.push({ hreflang: l.getAttribute("hreflang"), href: l.getAttribute("href") }); }); } catch (e) {}
    return out;
  }
  function collectInlineScripts() {
    var out = [];
    try {
      document.querySelectorAll("script:not([src])").forEach(function (s, i) {
        var t = (s.textContent || "").trim();
        if (t.length < 20) return;
        out.push({ index: i, size: t.length, preview: t.slice(0, 500), secrets: scanSecrets(t, "inline-script") });
      });
    } catch (e) {}
    return out.slice(0, 60);
  }
  function collectCSSExternalRefs() {
    var out = [], seen = {};
    try {
      for (var i = 0; i < document.styleSheets.length && i < 60; i++) {
        var ss = document.styleSheets[i];
        try {
          if (!ss.cssRules) continue;
          for (var j = 0; j < ss.cssRules.length; j++) {
            var r = ss.cssRules[j], txt = r.cssText || "", m;
            var re = /url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/gi;
            while ((m = re.exec(txt)) !== null) {
              var u = m[1] || m[2];
              if (!u || seen[u]) continue; seen[u] = 1;
              out.push({ url: u, from: ss.href || "inline" });
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
    return out.slice(0, 200);
  }
  function collectFormsDeep() {
    var out = [];
    try {
      document.querySelectorAll("form").forEach(function (f) {
        var fields = [];
        f.querySelectorAll("input,select,textarea,button").forEach(function (el) {
          fields.push({ tag: el.tagName.toLowerCase(), name: el.name || null, id: el.id || null, type: el.type || null, required: el.required || false, pattern: el.pattern || null, placeholder: el.placeholder || null, value: el.type === "hidden" || el.type === "password" ? null : (el.value || null) });
        });
        out.push({ action: f.getAttribute("action") || f.action || location.href, method: (f.getAttribute("method") || "GET").toUpperCase(), enctype: f.getAttribute("enctype") || "application/x-www-form-urlencoded", fields: fields });
      });
    } catch (e) {}
    return out;
  }
  function collectAllMeta() {
    var out = [];
    try { document.querySelectorAll("meta").forEach(function (m) { var o = {}; for (var i = 0; i < m.attributes.length; i++) o[m.attributes[i].name] = m.attributes[i].value; out.push(o); }); } catch (e) {}
    return out;
  }
  function collectRedirects() {
    var out = [];
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i];
      if (e.redirected && e.finalUrl) out.push({ from: e.url, to: e.finalUrl, status: e.status });
      if (e.status >= 300 && e.status < 400) {
        var loc = (e.respHeaders || {})["location"];
        if (loc) out.push({ from: e.url, to: loc, status: e.status, via: "header" });
      }
    }
    return out.slice(0, 300);
  }
  function collectCORS() {
    var out = [];
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i], h = e.respHeaders || {};
      var acao = h["access-control-allow-origin"];
      if (!acao) continue;
      out.push({ url: e.url, acao: acao, acac: h["access-control-allow-credentials"] || null, acam: h["access-control-allow-methods"] || null, acah: h["access-control-allow-headers"] || null, wildcard: acao === "*", danger: acao === "*" && h["access-control-allow-credentials"] === "true" });
    }
    return out.slice(0, 200);
  }
  function collectSSRFCandidates() {
    var out = [], seen = {};
    var re = /[?&](?:url|redirect|return|returnUrl|next|target|dest|destination|continue|callback|forward|goto|out|link|to|from|r|u|ref|reference)=([^&\s"'<>]+)/gi;
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i], m;
      var rr = new RegExp(re.source, re.flags);
      while ((m = rr.exec(e.url)) !== null) {
        var v = "";
        try { v = decodeURIComponent(m[1]); } catch (x) { v = m[1]; }
        var key = e.url.split("?")[0] + "|" + m[0];
        if (seen[key]) continue; seen[key] = 1;
        out.push({ url: e.url, param: m[0], value: v.slice(0, 200) });
      }
    }
    return out.slice(0, 100);
  }
  function collectOperationNames() {
    var out = { graphql: [], rest: [] };
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i];
      try {
        var u = new URL(e.url);
        var seg = u.pathname.split("/").filter(Boolean).pop() || "";
        if (seg && /^[a-z][a-z0-9_-]{2,}$/i.test(seg) && out.rest.indexOf(seg) < 0 && out.rest.length < 200) out.rest.push(seg);
      } catch (x) {}
      if (e.reqBody && /graphql|gql/i.test(e.url || "")) {
        var m = e.reqBody.match(/\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
        if (m && out.graphql.indexOf(m[1]) < 0) out.graphql.push(m[1]);
      }
    }
    return out;
  }
  function collectTrackingPixels() {
    var out = [], seen = {};
    try { document.querySelectorAll("img").forEach(function (img) { var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height; if (w <= 2 && h <= 2 && img.src && !seen[img.src]) { seen[img.src] = 1; out.push({ src: img.src, w: w, h: h }); } }); } catch (e) {}
    return out;
  }
  function collectCSPs() {
    var out = { meta: null, header: null };
    try { var m = document.querySelector('meta[http-equiv="Content-Security-Policy"]'); if (m) out.meta = m.content; } catch (e) {}
    for (var i = 0; i < store.entries.length; i++) { var h = store.entries[i].respHeaders || {}; if (h["content-security-policy"]) { out.header = h["content-security-policy"]; break; } }
    return out;
  }
  function detectFramebusting() {
    var out = { inIframe: false, framebustingJS: false };
    try { out.inIframe = window.top !== window.self; } catch (e) { out.inIframe = true; }
    try { var html = document.documentElement.innerHTML.slice(0, 200000); if (/top\.location\s*[!=]=?\s*(?:self|window)|top\.location\.href\s*=/i.test(html)) out.framebustingJS = true; } catch (e) {}
    return out;
  }
  function detectSessionReplay() {
    var out = [], html = "";
    try { html = document.documentElement.innerHTML.slice(0, 500000); } catch (e) {}
    var sigs = [
      ["Hotjar", /hotjar\.com|hj\(/i], ["FullStory", /fullstory\.com|_fs_org/i], ["LogRocket", /logrocket\.com/i],
      ["Smartlook", /smartlook\.com/i], ["Mouseflow", /mouseflow\.com/i], ["Lucky Orange", /luckyorange\.com/i],
      ["Crazy Egg", /crazyegg\.com/i], ["ClickTale", /clicktale\.com/i], ["Inspectlet", /inspectlet\.com/i],
      ["Quantum Metric", /quantummetric\.com/i], ["ContentSquare", /contentsquare\.net/i], ["Glassbox", /glassbox/i],
      ["Clarity", /clarity\.ms/i], ["FingerprintJS", /fingerprintjs|fpjs/i], ["CreepJS", /creepjs/i],
      ["Stripe.js", /js\.stripe\.com/i], ["reCAPTCHA", /google\.com\/recaptcha|gstatic\.com\/recaptcha/i],
      ["hCaptcha", /hcaptcha\.com/i], ["Turnstile", /challenges\.cloudflare\.com/i]
    ];
    sigs.forEach(function (s) { if (s[1].test(html)) out.push(s[0]); });
    return uniq(out);
  }

  // ═══════════════════════════════════════════════════════════
  //  Store
  // ═══════════════════════════════════════════════════════════
  var store = {
    entries: [], byId: {}, max: 5000, seq: 0, listeners: [],
    add: function (e) {
      e.id = ++this.seq; e.ts = e.ts || Date.now(); e.at = e.ts; classify(e);
      this.entries.push(e); this.byId[e.id] = e;
      if (this.entries.length > this.max) { var old = this.entries.shift(); delete this.byId[old.id]; }
      this.emit(e); return e;
    },
    update: function (id, patch) { var e = this.byId[id]; if (!e) return; for (var k in patch) e[k] = patch[k]; classify(e); this.emit(e); },
    emit: function (e) { for (var i = 0; i < this.listeners.length; i++) { try { this.listeners[i](e); } catch (x) {} } },
    on: function (fn) { this.listeners.push(fn); }
  };

  var PERSIST_KEY = "__spyderx_flow_v1";
  function slimEntry(e) {
    return { method: e.method, url: e.url, kind: e.kind, status: e.status || null, at: e.at, ms: e.ms != null ? e.ms : null, via: e.via || null, forceDownload: !!e.forceDownload, restored: true, fromPage: e.fromPage || location.href, reqHeaders: e.reqHeaders || {}, reqBody: e.reqBody ? String(e.reqBody).slice(0, 3000) : null, respHeaders: e.respHeaders || {}, respBody: e.respBody ? String(e.respBody).slice(0, 3000) : null, secrets: e.secrets || null, captchaToken: e.captchaToken || null, sitekey: e.sitekey || null };
  }
  function saveSession() { try { var arr = store.entries.slice(-500).map(slimEntry); var s = JSON.stringify(arr); if (s.length > 4000000) s = JSON.stringify(arr.slice(-250)); sessionStorage.setItem(PERSIST_KEY, s); } catch (e) {} }
  function restoreSession() { try { var raw = sessionStorage.getItem(PERSIST_KEY); if (!raw) return; var arr = JSON.parse(raw); if (!Array.isArray(arr)) return; for (var i = 0; i < arr.length; i++) { arr[i].restored = true; store.add(arr[i]); } } catch (e) {} }
  function clearSession() { try { sessionStorage.removeItem(PERSIST_KEY); } catch (e) {} }
  restoreSession();
  var _saveT = 0;
  store.on(function () { clearTimeout(_saveT); _saveT = setTimeout(saveSession, 400); });
  ["pagehide", "beforeunload", "visibilitychange"].forEach(function (ev) { try { window.addEventListener(ev, saveSession); } catch (e) {} });

  function payloadShape(body) {
    if (!body) return null;
    try { var d = JSON.parse(body); if (d && typeof d === "object") { if (Array.isArray(d)) return { _type: "array", length: d.length }; var o = {}; for (var k in d) o[k] = Array.isArray(d[k]) ? "array" : (d[k] === null ? "null" : typeof d[k]); return o; } } catch (e) {}
    if (/=/.test(body) && body.indexOf(" ") < 0) { var o2 = {}; body.split("&").forEach(function (pair) { var k = pair.split("=")[0]; if (k) { try { o2[decodeURIComponent(k)] = "string"; } catch (x) { o2[k] = "string"; } } }); return Object.keys(o2).length ? o2 : null; }
    return null;
  }
  function detectFrontendVersion() {
    try {
      var mg = document.querySelector('meta[name="generator"]'); if (mg && mg.content) return mg.content.slice(0, 60);
      var html = document.documentElement ? document.documentElement.innerHTML : "";
      var v = html.match(/["']?version["']?\s*[:=]\s*["']([0-9]+\.[0-9]+\.[0-9]+)["']/i); if (v) return v[1];
      var v2 = html.match(/[?&]ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/); if (v2) return v2[1];
    } catch (e) {}
    return null;
  }
  var reconData = { robots: null, disallow: [], sitemaps: [], sitemapUrls: [], done: false };
  function reconFetch(cb) {
    var origin = ""; try { origin = location.origin; } catch (e) { return; }
    reconData.done = true;
    var pending = 2;
    var fin = function () { pending--; if (pending <= 0 && cb) cb(); };
    try {
      setTimeout(function () {
      ORIG_FETCH(origin + "/robots.txt").then(function (r) { return r.text().then(function (t) {
        store.add({ kind: "recon", url: origin + "/robots.txt", method: "GET", status: r.status, pending: false, respBody: t.slice(0, 40000), respCT: "text/plain" });
        if (r.status < 400) {
          reconData.robots = t.slice(0, 4000);
          (t.match(/Disallow:\s*(\S+)/gi) || []).forEach(function (l) { var p = l.replace(/Disallow:\s*/i, "").trim(); if (p && reconData.disallow.indexOf(p) < 0) reconData.disallow.push(p); });
          (t.match(/Sitemap:\s*(\S+)/gi) || []).forEach(function (l) { var s = l.replace(/Sitemap:\s*/i, "").trim(); if (s && reconData.sitemaps.indexOf(s) < 0) reconData.sitemaps.push(s); });
        }
        fin();
      }); }).catch(fin);
      }, 300);
      setTimeout(function () {
      ORIG_FETCH(origin + "/sitemap.xml").then(function (r) { return r.text().then(function (t) {
        store.add({ kind: "recon", url: origin + "/sitemap.xml", method: "GET", status: r.status, pending: false, respBody: t.slice(0, 40000), respCT: "application/xml" });
        if (r.status < 400) { (t.match(/<loc>([^<]+)<\/loc>/gi) || []).forEach(function (m) { var u = m.replace(/<\/?loc>/gi, "").trim(); if (u && reconData.sitemapUrls.indexOf(u) < 0 && reconData.sitemapUrls.length < 500) reconData.sitemapUrls.push(u); }); }
        fin();
      }); }).catch(fin);
      }, 900);
    } catch (e) {}
  }

  function decodeObfuscated(text) {
    var out = [], seen = {};
    function add(kind, decoded, enc) { decoded = String(decoded); if (decoded.length < 6 || decoded.length > 2000) return; if (!/[ -~]/.test(decoded)) return; if (seen[decoded]) return; seen[decoded] = 1; out.push({ kind: kind, decoded: decoded.slice(0, 400), enc: String(enc || "").slice(0, 50) }); }
    try {
      var m, re1 = /atob\(\s*['"]([A-Za-z0-9+/=]{12,})['"]\s*\)/g;
      while ((m = re1.exec(text)) !== null && out.length < 200) { try { var d = atob(m[1]); if (/[ -~]/.test(d) && /[a-zA-Z0-9/._:?=&-]/.test(d)) add("base64", d, m[1]); } catch (e) {} }
      var re2 = /String\.fromCharCode(?:\.apply\([^,]*,)?\s*\[?\s*([\d\s,]+)\]?\s*\)/g;
      while ((m = re2.exec(text)) !== null && out.length < 200) { try { var codes = m[1].split(",").map(function (x) { return parseInt(x.trim(), 10); }).filter(function (x) { return x > 0 && x < 65536; }); if (codes.length > 3) add("charCode", String.fromCharCode.apply(null, codes), m[1].slice(0, 40)); } catch (e) {} }
      var re3 = /"((?:\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}){3,})"/g;
      while ((m = re3.exec(text)) !== null && out.length < 200) { try { var dec = m[1].replace(/\\x([0-9a-fA-F]{2})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); }).replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); }); add("hex/unicode", dec, m[1]); } catch (e) {} }
    } catch (e) {}
    return out;
  }
  function smartDecode(s) {
    s = String(s == null ? "" : s).trim(); var out = [];
    function add(method, val) { if (val == null) return; val = String(val); if (val && val !== s && /[ -~]/.test(val)) out.push({ method: method, result: val.slice(0, 6000) }); }
    try { var ud = decodeURIComponent(s.replace(/\+/g, "%20")); if (ud !== s) add("URL-decode", ud); } catch (e) {}
    try { if (/^[A-Za-z0-9+/=_-]{8,}$/.test(s)) { var b = s.replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; add("base64", decodeURIComponent(escape(atob(b)))); } } catch (e) {}
    try { if (/^[0-9a-fA-F]{8,}$/.test(s) && s.length % 2 === 0) { var hd = ""; for (var i = 0; i < s.length; i += 2) hd += String.fromCharCode(parseInt(s.substr(i, 2), 16)); add("hex", hd); } } catch (e) {}
    try { if (/\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}/.test(s)) { add("escapes \\x/\\u", s.replace(/\\x([0-9a-fA-F]{2})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); }).replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })); } } catch (e) {}
    try { if (isJWT(s)) { var p = s.split("."), dd = function (x) { x = x.replace(/-/g, "+").replace(/_/g, "/"); while (x.length % 4) x += "="; return decodeURIComponent(escape(atob(x))); }; add("JWT", "HEADER: " + dd(p[0]) + "\nPAYLOAD: " + dd(p[1])); } } catch (e) {}
    try { var j = JSON.parse(s); add("JSON (formateado)", JSON.stringify(j, null, 2)); } catch (e) {}
    return out;
  }
  function beautifyJS(code) {
    try {
      var s = String(code || ""), out = "", ind = 0, inStr = false, q = "", i, ch, prev;
      var pad = function (n) { return new Array(n * 2 + 1).join(" "); };
      for (i = 0; i < s.length && i < 200000; i++) {
        ch = s[i]; prev = s[i - 1];
        if (inStr) { out += ch; if (ch === q && prev !== "\\") inStr = false; continue; }
        if (ch === '"' || ch === "'" || ch === "`") { inStr = true; q = ch; out += ch; continue; }
        if (ch === "{" || ch === "[") { ind++; out += ch + "\n" + pad(ind); }
        else if (ch === "}" || ch === "]") { ind = Math.max(0, ind - 1); out = out.replace(/\s+$/, "") + "\n" + pad(ind) + ch; }
        else if (ch === ";") { out += ch + "\n" + pad(ind); }
        else if (ch === ",") { out += ch + "\n" + pad(ind); }
        else out += ch;
      }
      return out.replace(/\n\s*\n/g, "\n");
    } catch (e) { return String(code || ""); }
  }

  // ═══════════════════════════════════════════════════════════
  //  deepData
  // ═══════════════════════════════════════════════════════════
  var deepData = {
    bundlesMined: 0, jsEndpoints: [], jsSecrets: [], graphql: [], sourceMaps: [], jsSitekeys: [], jsFiles: [],
    crypto: [], decoded: [], done: false, probes: [], globals: [], idb: [], postMessages: [], meta: [], pii: [],
    broadcast: [], cryptoRuntime: [], workers: [], sse: [], cacheStorage: [], idbDetail: [], perf: null,
    webrtc: null, capabilities: null, storageKeys: null, setCookies: [], deepLinks: [], resourceHints: null,
    alternates: [], inlineScripts: [], cssRefs: [], formsDeep: [], allMeta: [], redirects: [], cors: [],
    ssrf: [], operationNames: null, trackingPixels: [], csp: null, framebusting: null, sessionReplay: [],
    jsonld: [], openGraph: null, analyticsIDs: null, webAuthn: null
  };
  var swData = [];
  var API_PATH_RE = /\/(api|graphql|ajax|rest|v\d|gql|auth|token|login|logout|user|users|account|download|stream|upload|search|oauth|session|profile|checkout|cart|payment)\b/i;
  function mineBundles(cb) {
    var origin = ""; try { origin = location.origin; } catch (e) {}
    var srcs = []; try { srcs = Array.prototype.map.call(document.scripts, function (s) { return s.src; }).filter(Boolean); } catch (e) {}
    try { document.querySelectorAll('link[rel="modulepreload"],link[rel="preload"][as="script"]').forEach(function (l) { if (l.href) srcs.push(l.href); }); } catch (e) {}
    try {
      var inl = "";
      Array.prototype.forEach.call(document.scripts, function (s2) { if (!s2.src && s2.textContent) inl += s2.textContent.slice(0, 80000) + "\n"; });
      discoverBundlePaths(inl, srcs);
    } catch (e) {}
    srcs = uniq(srcs).filter(function (u) { try { return new URL(u).origin === origin; } catch (e) { return false; } }).slice(0, 60);
    deepData.jsFiles = [];
    if (!srcs.length) { deepData.done = true; if (cb) cb(); return; }
    var epSeen = {}, secSeen = {}, inQueue = {};
    srcs.forEach(function (u) { inQueue[u] = 1; });
    var done = 0, idx = 0;
    function finOne() {
      done++;
      if (done >= srcs.length && idx >= srcs.length) { deepData.done = true; deepData.bundlesMined = done; if (cb) cb(); return; }
      setTimeout(pump, 0); // cede el hilo principal: la página nunca se congela
    }
    function analyze(u, t) {
      var found = 0;
      scanSecrets(t, "js:" + u).forEach(function (s) { var k = s.name + "|" + s.value; if (!secSeen[k]) { secSeen[k] = 1; deepData.jsSecrets.push(s); found++; } });
      scanPII(t, "js:" + u).forEach(function (p) { var k = p.name + "|" + p.value; if (!secSeen[k]) { secSeen[k] = 1; deepData.pii.push(p); found++; } });
      var re = /["'`](\/[a-zA-Z0-9_\-.\/]{2,}(?:\?[^"'`\s]*)?)["'`]/g, m;
      while ((m = re.exec(t)) !== null) { var pth = m[1]; if (API_PATH_RE.test(pth) && !epSeen[pth]) { epSeen[pth] = 1; found++; if (deepData.jsEndpoints.length < 500) deepData.jsEndpoints.push({ path: pth, source: u.split("/").pop() }); } }
      var gre = /\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)\s*[({]/g, g;
      while ((g = gre.exec(t)) !== null) { var op = g[1] + " " + g[2]; if (deepData.graphql.indexOf(op) < 0 && deepData.graphql.length < 200) deepData.graphql.push(op); }
      var sm = t.match(/\/\/#\s*sourceMappingURL=(\S+)/); if (sm && deepData.sourceMaps.length < 50) { var smu = sm[1]; try { smu = new URL(smu, u).href; } catch (e) {} if (smu.indexOf("data:") !== 0 && deepData.sourceMaps.indexOf(smu) < 0) deepData.sourceMaps.push(smu); }
      [/0x4[A-Fa-f0-9]{15,}/g, /6L[0-9A-Za-z_-]{38}/g, /MTPublic-[A-Za-z0-9_-]+/g, /ysc1_[A-Za-z0-9]+/g, /FCM[A-Za-z0-9_-]{16,}/g].forEach(function (kre) { var km, kr = new RegExp(kre.source, "g"); while ((km = kr.exec(t)) !== null) { if (deepData.jsSitekeys.indexOf(km[0]) < 0 && deepData.jsSitekeys.length < 200) deepData.jsSitekeys.push(km[0]); } });
      [/CryptoJS\.(Hmac[A-Za-z0-9]+)/g, /crypto\.subtle\.(sign|digest|deriveKey|importKey|deriveBits|encrypt)/g, /createHmac\(\s*['"]([a-z0-9-]+)['"]/gi, /\b(HMAC-?SHA-?(?:1|256|384|512))\b/gi].forEach(function (cre) { var cm, cr = new RegExp(cre.source, cre.flags.indexOf("g") >= 0 ? cre.flags : cre.flags + "g"); while ((cm = cr.exec(t)) !== null) { var sig = (cm[0] || "").slice(0, 40); if (deepData.crypto.indexOf(sig) < 0 && deepData.crypto.length < 40) deepData.crypto.push(sig); } });
      decodeObfuscated(t).forEach(function (dc) {
        if (deepData.decoded.length < 200 && !deepData.decoded.some(function (x) { return x.decoded === dc.decoded; })) deepData.decoded.push({ source: u.split("/").pop(), kind: dc.kind, decoded: dc.decoded });
        scanSecrets(dc.decoded, "js-decoded").forEach(function (s) { var kk = s.name + "|" + s.value; if (!secSeen[kk]) { secSeen[kk] = 1; deepData.jsSecrets.push(s); found++; } });
      });
      return found;
    }
    function pump() {
      if (idx >= srcs.length) return;
      var u = srcs[idx++];
      var rec = { url: u, name: (u.split(/[?#]/)[0].split("/").pop() || u), size: 0, found: 0, error: false };
      deepData.jsFiles.push(rec);
      ORIG_FETCH(u).then(function (r) {
        return r.text().then(function (t) {
          rec.size = t.length;
          try {
            // archivos gigantes: se escanea un bloque amplio sin bloquear el hilo
            rec.found = analyze(u, t.length > 5000000 ? t.slice(0, 5000000) : t);
            // descubre bundles referenciados desde routers/chunks (rutas dinámicas)
            var extra = [];
            discoverBundlePaths(t.slice(0, 400000), extra);
            for (var q = 0; q < extra.length && srcs.length < 80; q++) {
              var eu = extra[q];
              if (inQueue[eu]) continue;
              try { if (new URL(eu).origin !== origin) continue; } catch (e2) { continue; }
              inQueue[eu] = 1; srcs.push(eu);
            }
          } catch (e) {}
          finOne();
        });
      }).catch(function () { rec.error = true; finOne(); });
    }
    var lanes = Math.min(3, srcs.length);
    for (var l = 0; l < lanes; l++) pump();
  }
  function discoverBundlePaths(text, out) {
    try {
      var m, re = /import\(\s*["']([^"']+\.(?:js|mjs|cjs|jsx|ts|tsx))(?:\?[^"']*)?["']\s*\)|["']([^"'`\s]{1,140}?[\/.][^"'`\s]{0,120}?\.(?:js|mjs|cjs|jsx|ts|tsx))(?:\?[^"'`]*)?["']/gi;
      while ((m = re.exec(text)) !== null && out.length < 400) {
        var p = m[1] || m[2];
        if (!p || p.length > 150) continue;
        if (/^(?:https?:)?\/\//.test(p)) { if (/^\/\//.test(p)) p = location.protocol + p; else if (p.indexOf(location.origin) !== 0) continue; }
        else if (p.charAt(0) !== "/" && p.charAt(0) !== ".") p = "/" + p;
        try { var abs = new URL(p, location.href).href; if (out.indexOf(abs) < 0) out.push(abs); } catch (e) {}
      }
    } catch (e) {}
    return out;
  }

  var PROBE_PATHS = ["/.well-known/security.txt", "/.well-known/openid-configuration", "/.well-known/oauth-authorization-server", "/.well-known/assetlinks.json", "/.well-known/apple-app-site-association", "/.well-known/change-password", "/.well-known/ai-plugin.json", "/.well-known/nodeinfo", "/.well-known/webfinger", "/manifest.json", "/browserconfig.xml", "/swagger.json", "/swagger/v1/swagger.json", "/openapi.json", "/v3/api-docs", "/api-docs", "/redoc", "/graphiql", "/version", "/api/version", "/health", "/status", "/api/health", "/api/config", "/config.json", "/app-config.json", "/settings.json", "/env.json", "/info.json", "/actuator", "/actuator/health", "/actuator/info", "/actuator/env", "/actuator/beans", "/actuator/mappings", "/actuator/configprops", "/.env", "/.git/HEAD", "/server-status", "/server-info", "/phpinfo.php", "/admin", "/admin/login", "/api", "/api/v1", "/api/v2", "/graphql", "/.well-known/host-meta"];
  function runProbes(cb) {
    var origin = ""; try { origin = location.origin; } catch (e) { if (cb) cb(); return; }
    var list = PROBE_PATHS.slice(), pending = list.length;
    if (!pending) { if (cb) cb(); return; }
    function fin() { pending--; if (pending <= 0 && cb) cb(); }
    list.forEach(function (p) {
      try {
        ORIG_FETCH(origin + p, { credentials: "omit" }).then(function (r) {
          var ct = (r.headers.get("content-type") || "").toLowerCase();
          var interesting = r.status < 400 && !/image\/|font\/|video\//.test(ct);
          if (!interesting) { fin(); return; }
          r.text().then(function (t) {
            if (!t || t.length < 2) { fin(); return; }
            deepData.probes.push({ path: p, status: r.status, contentType: ct || "?", size: t.length, preview: t.slice(0, 1500) });
            try { store.add({ kind: "probe", url: origin + p, method: "GET", status: r.status, pending: false, respCT: ct, respBody: t.slice(0, 20000), via: "deep-scan" }); } catch (x) {}
            fin();
          }).catch(fin);
        }).catch(fin);
      } catch (e) { fin(); }
    });
  }
  var GLOBAL_INTEREST_RE = /token|secret|key|config|auth|session|user|api|env|state|store|credential|setting|app|data/i;
  function enumerateGlobals() {
    var out = [];
    try {
      Object.keys(window).forEach(function (k) {
        if (k === "__snifffer" || k === "__spyderx" || k === "__ryffer") return;
        if (!GLOBAL_INTEREST_RE.test(k)) return;
        try {
          var v = window[k], tp = typeof v, pv = "";
          if (tp === "string") pv = v.slice(0, 200);
          else if (tp === "object" && v) { try { pv = JSON.stringify(v).slice(0, 200); } catch (e) { pv = String(v).slice(0, 200); } }
          else if (tp !== "function") pv = String(v).slice(0, 200);
          if (pv) out.push({ name: k, type: tp, preview: pv });
        } catch (e) {}
      });
    } catch (e) {}
    return out.slice(0, 150);
  }
  function listIDB() {
    return new Promise(function (res) {
      try { if (indexedDB && indexedDB.databases) { indexedDB.databases().then(function (d) { res(d || []); }).catch(function () { res([]); }); return; } } catch (e) {}
      res([]);
    });
  }
  function metaIntel() {
    var out = [];
    try { document.querySelectorAll("meta").forEach(function (m) { var n = m.getAttribute("name") || m.getAttribute("property") || m.getAttribute("http-equiv"), c = m.getAttribute("content"); if (n && c && c.length > 0) out.push({ name: n, content: c.slice(0, 300) }); }); } catch (e) {}
    return out;
  }

  function detectTech() {
    var t = [], add = function (n, v) { if (n) t.push(v ? n + " " + v : n); };
    try {
      if (window.__NEXT_DATA__ || document.getElementById("__next")) add("Next.js", (window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId) ? ("build " + window.__NEXT_DATA__.buildId) : "");
      else if (window.React || document.querySelector("[data-reactroot]")) add("React");
      if (window.__NUXT__ || window.$nuxt) add("Nuxt");
      else if (window.Vue || document.querySelector("[data-server-rendered]")) add("Vue");
      var nv = document.querySelector("[ng-version]"); if (nv) add("Angular", nv.getAttribute("ng-version"));
      if (window.jQuery && window.jQuery.fn) add("jQuery", window.jQuery.fn.jquery);
      if (window.Shopify) add("Shopify");
      if (document.querySelector('link[href*="wp-content"],link[href*="wp-includes"]') || window.wp) add("WordPress");
      if (window.__APOLLO_STATE__ || window.__APOLLO_CLIENT__) add("Apollo GraphQL");
      if (window.dataLayer || window.gtag) add("GTM/GA");
      if (window.astro || document.querySelector("astro-island")) add("Astro");
      if (document.querySelector("script[type='module'][src*='svelte']") || window.__svelte) add("Svelte");
      if (window.__remixContext) add("Remix");
      var mg = document.querySelector('meta[name="generator"]'); if (mg && mg.content) add(mg.content.slice(0, 40));
    } catch (e) {}
    return uniq(t);
  }
  function extractAppState() {
    var out = {}, pick = ["__NEXT_DATA__", "__NUXT__", "__INITIAL_STATE__", "__APOLLO_STATE__", "__PRELOADED_STATE__", "ENV", "CONFIG", "APP_CONFIG", "__ENV__", "__remixContext", "__svelte", "__astroPage"];
    pick.forEach(function (k) { try { if (window[k] != null) { var s = JSON.stringify(window[k]); if (s && s.length > 2) out[k] = s.slice(0, 12000); } } catch (e) {} });
    return out;
  }
  function extractForms() {
    var out = [];
    try { var fs = document.querySelectorAll("form"); for (var i = 0; i < fs.length && i < 40; i++) { var f = fs[i], fields = [], ins = f.querySelectorAll("input,select,textarea"); for (var j = 0; j < ins.length; j++) { var el = ins[j]; fields.push({ name: el.name || el.id || null, type: (el.type || el.tagName || "").toLowerCase(), hidden: el.type === "hidden" }); } out.push({ action: f.getAttribute("action") || location.href, method: (f.getAttribute("method") || "GET").toUpperCase(), fields: fields }); } } catch (e) {}
    return out;
  }
  function extractHtmlEndpoints() {
    var out = [], seen = {};
    try { var html = document.documentElement ? document.documentElement.innerHTML.slice(0, 400000) : "", re = /["'`](\/[a-zA-Z0-9_\-./]{2,}(?:\?[^"'`\s]*)?)["'`]/g, m; while ((m = re.exec(html)) !== null) { var p = m[1]; if (API_PATH_RE.test(p) && !seen[p]) { seen[p] = 1; out.push(p); if (out.length > 300) break; } } } catch (e) {}
    return out;
  }
  function extractCSP() { try { var m = document.querySelector('meta[http-equiv="Content-Security-Policy"]'); if (m) return m.content; } catch (e) {} return null; }
  function extractHiddenLinks() {
    var out = [], seen = {};
    function push(url, why) { if (!url) return; url = String(url).trim(); if (url.length < 3 || seen[url]) return; seen[url] = 1; out.push({ url: url, why: why }); }
    try {
      var as = document.querySelectorAll("a[href]");
      for (var i = 0; i < as.length && i < 1500; i++) {
        var a = as[i], href = a.getAttribute("href"); if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) continue;
        var r = a.getBoundingClientRect();
        if (a.hidden || (r.width === 0 && r.height === 0) || a.offsetParent === null) push(absURL(href), "a oculto");
      }
      try { var it = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_COMMENT), node, c = 0; while ((node = it.nextNode()) && c < 3000) { c++; var txt = node.nodeValue || ""; var mm; var re = /(https?:\/\/[^\s"'<>]+)|["'](\/[a-zA-Z0-9_\-./?=&%]{3,})["']/g; while ((mm = re.exec(txt)) !== null) push(mm[1] || mm[2], "comentario HTML"); } } catch (e) {}
      var all = document.querySelectorAll("*");
      for (var j = 0; j < all.length && j < 2500; j++) { var el = all[j], at = el.attributes; for (var b = 0; b < at.length; b++) { var nm = at[b].name, v = at[b].value; if (!v) continue; if (/^(data-|href$|src$|data$)/.test(nm) && (/^https?:\/\//.test(v) || /^\/[a-zA-Z0-9]/.test(v)) && /(test|dev|stag|debug|hidden|preview|sandbox|demo|download|\.mp4|\.zip|\.json|\/api\/|token)/i.test(v)) push(v, "attr:" + nm); } }
      document.querySelectorAll('input[type="hidden"]').forEach(function (el) { var v = el.value || ""; if (/^https?:\/\//.test(v) || /^\/[a-zA-Z0-9]/.test(v)) push(v, "input hidden " + (el.name || "")); });
    } catch (e) {}
    return out.slice(0, 200);
  }
  var APIKEY_NAME_RE = /^(?:x-)?(?:api[_-]?key|apikey|access[_-]?key|app[_-]?key|app[_-]?id|appid|client[_-]?id|client[_-]?secret|api[_-]?token|access[_-]?token|auth[_-]?token|x-auth-token|subscription-key|ocp-apim-subscription-key|key)$/i;
  function collectApiKeys() {
    var out = [], seen = {};
    function add(name, value, where, url) { value = String(value == null ? "" : value); if (value.length < 8 || value.length > 400) return; var k = name + "|" + value; if (seen[k]) return; seen[k] = 1; out.push({ name: name, value: value, where: where, url: url }); }
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i];
      try { var u = new URL(e.url); u.searchParams.forEach(function (v, name) { if (APIKEY_NAME_RE.test(name)) add(name, v, "query", e.url); }); } catch (x) {}
      var rh = e.reqHeaders || {};
      for (var k in rh) { var kl = k.toLowerCase(); if (APIKEY_NAME_RE.test(k) || kl === "authorization" || kl === "x-api-key") add(k, rh[k], "header", e.url); }
      if (e.reqBody) { try { var jb = JSON.parse(e.reqBody); if (jb && typeof jb === "object") { for (var jk in jb) { if (APIKEY_NAME_RE.test(jk) && jb[jk] != null && typeof jb[jk] !== "object") add(jk, jb[jk], "body", e.url); } } } catch (x) {} }
    }
    return out.slice(0, 200);
  }
  function extractSignatures() {
    var out = [], seen = {};
    for (var i = 0; i < store.entries.length; i++) {
      var e = store.entries[i], rh = e.reqHeaders || {};
      for (var k in rh) { if (SIG_HEADER_RE.test(k)) { var kk = "H|" + k + "|" + e.url; if (!seen[kk]) { seen[kk] = 1; out.push({ url: e.url, method: e.method, kind: "header", name: k, sample: String(rh[k]).slice(0, 80) }); } } }
      try { var u = new URL(e.url); u.searchParams.forEach(function (v, name) { if (SIG_PARAM_RE.test(name) && v && v.length >= 6) { var pk = "P|" + name + "|" + e.url; if (!seen[pk]) { seen[pk] = 1; out.push({ url: e.url, method: e.method, kind: "param", name: name, sample: String(v).slice(0, 80) }); } } }); } catch (x) {}
      if (e.reqBody) {
        var handled = false;
        try { var jb = JSON.parse(e.reqBody); if (jb && typeof jb === "object" && !Array.isArray(jb)) { handled = true; for (var jk in jb) { if (SIG_PARAM_RE.test(jk) && jb[jk] != null && String(jb[jk]).length >= 6) { var jbk = "J|" + jk + "|" + e.url; if (!seen[jbk]) { seen[jbk] = 1; out.push({ url: e.url, method: e.method, kind: "body-json", name: jk, sample: String(jb[jk]).slice(0, 80) }); } } } } } catch (x) {}
        if (!handled && /=/.test(e.reqBody) && e.reqBody.charAt(0) !== "{") { e.reqBody.split("&").forEach(function (pair) { var nm = pair.split("=")[0]; if (SIG_PARAM_RE.test(nm)) { var bk = "B|" + nm + "|" + e.url; if (!seen[bk]) { seen[bk] = 1; out.push({ url: e.url, method: e.method, kind: "body", name: nm, sample: (pair.split("=")[1] || "").slice(0, 80) }); } } }); }
      }
    }
    return out.slice(0, 300);
  }
  function buildFlowMap() {
    var E = store.entries, valueSrc = {};
    function setSrc(v, src) { if (v && tokenLike(v) && !valueSrc[v]) valueSrc[v] = src; }
    try { cookieIntel().forEach(function (c) { setSrc(c.value, { type: "cookie", name: c.name }); }); } catch (e) {}
    try { storageIntel().forEach(function (s) { setSrc(s.value, { type: s.type, name: s.key }); }); } catch (e) {}
    for (var i = 0; i < E.length; i++) { var e = E[i]; if (e.respBody) { var toks = String(e.respBody).match(/[A-Za-z0-9._\-]{20,}/g) || []; for (var t = 0; t < toks.length && t < 60; t++) setSrc(toks[t], { type: "response", url: e.url, method: e.method, at: e.at }); } }
    var flows = [], seen = {};
    function tokensIn(str) { return (String(str || "").match(/[A-Za-z0-9._\-]{20,}/g) || []); }
    for (var j = 0; j < E.length; j++) {
      var en = E[j], used = [], rh = en.reqHeaders || {};
      for (var k in rh) { var hv = String(rh[k]); if (tokenLike(hv)) used.push({ via: "header:" + k, val: hv }); else tokensIn(hv).forEach(function (x) { if (tokenLike(x)) used.push({ via: "header:" + k, val: x }); }); }
      try { var u = new URL(en.url); u.searchParams.forEach(function (v, name) { if (tokenLike(v)) used.push({ via: "param:" + name, val: v }); }); } catch (x) {}
      if (en.reqBody) tokensIn(en.reqBody).forEach(function (x) { if (tokenLike(x)) used.push({ via: "body", val: x }); });
      for (var uu = 0; uu < used.length; uu++) {
        var us = used[uu], src = valueSrc[us.val];
        if (!src) continue;
        if (src.type === "response" && src.url === en.url) continue;
        if (src.type === "response" && src.at && en.at && src.at > en.at) continue;
        var key = en.method + "|" + en.url + "|" + us.via + "|" + us.val.slice(0, 12);
        if (seen[key]) continue; seen[key] = 1;
        flows.push({ consumer: { method: en.method, url: en.url, reqHeaders: en.reqHeaders || {}, reqBody: en.reqBody || null }, via: us.via, value: us.val.slice(0, 18) + "…", fullValue: us.val, source: src });
      }
    }
    return flows.slice(0, 200);
  }
  function collectSW() { try { if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) return navigator.serviceWorker.getRegistrations().then(function (regs) { regs.forEach(function (reg) { var s = reg.active || reg.installing || reg.waiting; if (s && s.scriptURL && swData.indexOf(s.scriptURL) < 0) swData.push(s.scriptURL); }); }).catch(function () {}); } catch (e) {} return Promise.resolve(); }
  collectSW();

  // Spy crypto.subtle
  (function () {
    try {
      if (!window.crypto || !window.crypto.subtle || window.crypto.subtle.__spyderx_spied) return;
      var orig = {};
      ["encrypt", "decrypt", "sign", "verify", "digest", "deriveBits", "deriveKey", "importKey", "exportKey", "generateKey"].forEach(function (m) {
        if (typeof crypto.subtle[m] === "function") {
          orig[m] = crypto.subtle[m].bind(crypto.subtle);
          crypto.subtle[m] = function () {
            try {
              var args = Array.prototype.slice.call(arguments);
              var info = { op: m, alg: (args[0] && args[0].name) || args[0] || "?", t: Date.now() };
              deepData.cryptoRuntime.push(info);
              if (deepData.cryptoRuntime.length > 100) deepData.cryptoRuntime.shift();
            } catch (e) {}
            return orig[m].apply(crypto.subtle, arguments);
          };
        }
      });
      crypto.subtle.__spyderx_spied = true;
    } catch (e) {}
  })();

  // Spy BroadcastChannel
  (function () {
    try {
      if (!window.BroadcastChannel || window.BroadcastChannel.__spyderx_spied) return;
      var Orig = window.BroadcastChannel;
      window.BroadcastChannel = function (name) {
        var ch = new Orig(name);
        try {
          var origPost = ch.postMessage.bind(ch);
          ch.postMessage = function (msg) {
            try { deepData.broadcast.push({ name: name, dir: "↑", data: String(JSON.stringify(msg)).slice(0, 500), t: Date.now() }); if (deepData.broadcast.length > 100) deepData.broadcast.shift(); } catch (e) {}
            return origPost(msg);
          };
          ch.addEventListener("message", function (ev) { try { deepData.broadcast.push({ name: name, dir: "↓", data: String(JSON.stringify(ev.data)).slice(0, 500), t: Date.now() }); } catch (e) {} });
        } catch (e) {}
        return ch;
      };
      window.BroadcastChannel.prototype = Orig.prototype;
      window.BroadcastChannel.__spyderx_spied = true;
    } catch (e) {}
  })();

  function deepRun(cb) {
    var pending = 12, fin = function () { pending--; if (pending <= 0 && cb) cb(); };
    collectSW().then(fin);
    mineBundles(fin);
    runProbes(fin);
    try {
      deepData.globals = enumerateGlobals();
      deepData.meta = metaIntel();
      deepData.perf = collectPerformanceDetail();
      deepData.capabilities = detectCapabilities();
      deepData.webAuthn = detectWebAuthn();
      deepData.storageKeys = collectStorageKeysDetail();
      deepData.setCookies = collectSetCookiesFromTraffic();
      deepData.deepLinks = collectDeepLinks();
      deepData.resourceHints = collectResourceHints();
      deepData.alternates = collectAlternates();
      deepData.inlineScripts = collectInlineScripts();
      deepData.cssRefs = collectCSSExternalRefs();
      deepData.formsDeep = collectFormsDeep();
      deepData.allMeta = collectAllMeta();
      deepData.redirects = collectRedirects();
      deepData.cors = collectCORS();
      deepData.ssrf = collectSSRFCandidates();
      deepData.operationNames = collectOperationNames();
      deepData.trackingPixels = collectTrackingPixels();
      deepData.csp = collectCSPs();
      deepData.framebusting = detectFramebusting();
      deepData.sessionReplay = detectSessionReplay();
      deepData.jsonld = collectJSONLD();
      deepData.openGraph = collectOpenGraph();
      deepData.analyticsIDs = collectAnalyticsIDs();
      deepData.workers = workerURLs.slice();
      deepData.sse = sseURLs.slice();
    } catch (e) {}
    listIDB().then(function (d) { deepData.idb = d || []; fin(); }).catch(function () { fin(); });
    collectIndexedDBDetail().then(function (d) { deepData.idbDetail = d; fin(); }).catch(function () { fin(); });
    collectCacheStorage().then(function (d) { deepData.cacheStorage = d; fin(); }).catch(function () { fin(); });
    detectWebRTCLeak().then(function (d) { deepData.webrtc = d; fin(); }).catch(function () { fin(); });
  }

  var srcCache = {};
  function listSourceFiles() {
    var out = [], seen = {};
    function add(url, type) { if (!url || seen[url] || url.indexOf("data:") === 0) return; seen[url] = 1; out.push({ url: url, type: type, name: (url.split(/[?#]/)[0].split("/").pop() || url), same: sameOrigin(url) }); }
    try { Array.prototype.forEach.call(document.scripts, function (s) { if (s.src) add(s.src, "js"); }); } catch (e) {}
    try { document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { if (l.href) add(l.href, "css"); }); } catch (e) {}
    try { document.querySelectorAll('link[rel="modulepreload"],link[rel="preload"][as="script"]').forEach(function (l) { if (l.href) add(l.href, "js"); }); } catch (e) {}
    try { document.querySelectorAll('script[type="importmap"]').forEach(function (s2) { try { var mp = JSON.parse(s2.textContent || "{}"), im = mp.imports || {}; for (var k in im) { var v = im[k]; if (typeof v === "string" && JS_BUNDLE_EXT.test(v)) add(new URL(v, location.href).href, "js"); } } catch (e2) {} }); } catch (e) {}
    try { (deepData.sourceMaps || []).forEach(function (u) { add(u, "map"); }); } catch (e) {}
    out.sort(function (a, b) { return (b.same - a.same) || a.name.localeCompare(b.name); });
    return out;
  }
  function sameOrigin(url) { try { return new URL(url, location.href).origin === location.origin ? 1 : 0; } catch (e) { return 0; } }
  function fetchSource(url) {
    return new Promise(function (res) {
      if (srcCache.hasOwnProperty(url)) return res(srcCache[url]);
      try { ORIG_FETCH(url).then(function (r) { return r.text(); }).then(function (t) { srcCache[url] = t; res(t); }).catch(function () { srcCache[url] = null; res(null); }); }
      catch (e) { srcCache[url] = null; res(null); }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  REPORT
  // ═══════════════════════════════════════════════════════════
  function buildReport() {
    var E = store.entries;
    var secretsMap = {}, secrets = [];
    var piiMap = {}, pii = [];
    var apis = [], tunnels = [], downloads = [], searchQueries = [], ws = [], signed = [], noiseByCat = {}, noiseTotal = 0, graphql = [];
    var antibotMap = {}, antibots = [];
    var securityIssues = [], securityFlags = [];
    var captchaAll = [];
    for (var i = 0; i < E.length; i++) {
      var e = E[i];
      if (e.secrets) for (var s = 0; s < e.secrets.length; s++) { var sk = e.secrets[s].name + "|" + e.secrets[s].value; if (!secretsMap[sk]) { secretsMap[sk] = 1; secrets.push(e.secrets[s]); } }
      if (e.pii) for (var pi = 0; pi < e.pii.length; pi++) { var pk = e.pii[pi].name + "|" + e.pii[pi].value; if (!piiMap[pk]) { piiMap[pk] = 1; pii.push(e.pii[pi]); } }
      if (e.antibot) for (var ab = 0; ab < e.antibot.length; ab++) { var ak = e.antibot[ab].vendor; if (!antibotMap[ak]) { antibotMap[ak] = 1; antibots.push(e.antibot[ab]); } }
      if (e.security) { (e.security.issues || []).forEach(function (x) { securityIssues.push(Object.assign({ url: e.url }, x)); }); (e.security.flags || []).forEach(function (x) { securityFlags.push(Object.assign({ url: e.url }, x)); }); }
      if (e.captcha || e.sitekey) captchaAll.push({ url: e.url, kind: e.captcha || "unknown", sitekey: e.sitekey || null });
      if (e.tags.indexOf("NOISE") >= 0) { noiseTotal++; var c = e.noiseCat || "other"; noiseByCat[c] = (noiseByCat[c] || 0) + 1; }
      if (e.tags.indexOf("API") >= 0 && e.tags.indexOf("NOISE") < 0) {
        var auth = analyzeAuth(e.reqHeaders);
        apis.push({ url: e.url, method: e.method, type: e.apiType || "generic", authRequired: auth.required, authType: auth.type, difficulty: difficultyOf(auth, false), status: e.status || null, notes: auth.required ? ["🔐 Requires " + (auth.type || "auth")] : (e.method === "GET" ? ["✅ Public endpoint — no auth required"] : ["📤 Requires " + e.method + " payload"]) });
        if (e.apiType === "graphql") graphql.push({ url: e.url, method: e.method });
      }
      if (e.tags.indexOf("TUNNEL") >= 0) tunnels.push({ url: e.url, method: e.method, type: e.tunnelType || "tunnel", timestamp: new Date(e.at).toISOString() });
      if (e.tags.indexOf("DOWNLOAD") >= 0) downloads.push({ url: e.url, category: e.download, contentType: e.respCT || null });
      if (e.search) searchQueries.push({ url: e.url, method: e.method, paramName: e.search.paramName, value: e.search.value, allParams: e.search.allParams, timestamp: new Date(e.at).toISOString() });
      if (e.kind === "ws") ws.push({ url: e.url, timestamp: new Date(e.at).toISOString(), messages: (e.wsMessages || []).length });
      if (e.signed) signed.push({ url: e.url, method: e.method, at: e.at, headers: e.reqHeaders || {} });
    }
    var cookies = cookieIntel(), storage = storageIntel(), sitekeys = collectSitekeys(), tokens = collectTokens();

    function trimReq(e) {
      return { method: e.method, url: e.url, kind: e.kind, status: e.status || null, ms: e.ms != null ? e.ms : null, via: e.via || null, tags: e.tags || [], apiType: e.apiType || null, tunnelType: e.tunnelType || null, download: e.download || null, cdn: e.cdn || null, manifest: e.manifest || null, captcha: e.captcha || null, sitekey: e.sitekey || null, signed: !!e.signed, contentType: e.respCT || null, antibot: e.antibot || null, pii: e.pii || null, reqHeaders: e.reqHeaders || {}, reqBody: e.reqBody ? String(e.reqBody).slice(0, 4000) : null, respHeaders: e.respHeaders || {}, respBody: e.respBody ? String(e.respBody).slice(0, 6000) : null };
    }
    var requests = [];
    var groups = { api: [], firstPartyApi: [], tunnels: [], downloads: [], media: [], cdn: [], other: [], noise: [], antibot: [] };
    var apiQueryParams = [], payloadAnalyses = [], redirects = [], cdnHosts = {};
    var seenEp = {}, host = ""; try { host = location.host; } catch (e) {}
    for (var r = 0; r < E.length; r++) {
      var en = E[r];
      requests.push(trimReq(en));
      try { var eh = new URL(en.url).host; if (!cdnHosts[eh]) cdnHosts[eh] = cdnOf(en.url) || en.cdn || "unknown"; } catch (x) {}
      if (en.redirected && en.finalUrl) redirects.push({ from: en.url, to: en.finalUrl, status: en.status || null });
      var key = en.method + " " + en.url; if (seenEp[key]) continue; seenEp[key] = 1;
      var au = analyzeAuth(en.reqHeaders);
      var qp = null; try { var uu = new URL(en.url); if (uu.search) { qp = {}; uu.searchParams.forEach(function (v, k) { qp[k] = v.length > 120 ? v.slice(0, 120) + "…" : v; }); } } catch (x) {}
      var ep = { method: en.method, url: en.url, status: en.status || null, difficulty: difficultyOf(au, false), authRequired: au.required, apiType: en.apiType || null, contentType: en.respCT || null, responsePreview: en.respBody ? String(en.respBody).slice(0, 200) : null, queryParams: qp, tags: en.tags };
      var tg = en.tags;
      var isNoiseEp = tg.indexOf("NOISE") >= 0;
      if (isNoiseEp) groups.noise.push(ep);
      else if (tg.indexOf("TUNNEL") >= 0) groups.tunnels.push(ep);
      else if (tg.indexOf("DOWNLOAD") >= 0) groups.downloads.push(ep);
      else if (tg.indexOf("MEDIA") >= 0) groups.media.push(ep);
      else if (tg.indexOf("API") >= 0) { groups.api.push(ep); try { if (new URL(en.url).host === host) groups.firstPartyApi.push(ep); } catch (x) {} }
      else if (tg.indexOf("CDN") >= 0) groups.cdn.push(ep);
      else groups.other.push(ep);
      if (tg.indexOf("ANTIBOT") >= 0) groups.antibot.push(Object.assign({}, ep, { antibot: en.antibot }));
      if (!isNoiseEp && qp) apiQueryParams.push({ method: en.method, url: en.url, params: qp });
      if (["POST", "PUT", "PATCH"].indexOf(en.method) >= 0 && en.reqBody) { var shape = payloadShape(en.reqBody); if (shape) payloadAnalyses.push({ method: en.method, url: en.url, fields: shape }); }
    }
    var cdnMap = {}; for (var ch in cdnHosts) { var prov = cdnHosts[ch]; (cdnMap[prov] = cdnMap[prov] || []).push(ch); }

    return {
      meta: { version: "9.0", engine: "NexusScope Pro (in-browser)", url: location.href, host: host, timestamp: new Date().toISOString(), durationSeconds: Math.round((Date.now() - START) / 1000), uniqueEndpoints: Object.keys(seenEp).length, frontendVersion: detectFrontendVersion(), lastModified: (function () { try { return document.lastModified || null; } catch (e) { return null; } })(), reverseEngineeringEnabled: true },
      statistics: {
        totalRequests: E.length, hiddenApis: apis.length, secretsFound: secrets.length, tokensFound: tokens.length,
        piiFound: pii.length, antibotsDetected: antibots.length, securityIssues: securityIssues.length, securityFlags: securityFlags.length,
        tunnels: tunnels.length, downloads: downloads.length, sitekeys: sitekeys.length,
        searchQueries: searchQueries.length, webSockets: ws.length, graphqlEndpoints: graphql.length,
        noiseFiltered: noiseTotal, cookies: cookies.length, authCookiesFound: cookies.filter(function (c) { return c.isAuth; }).length,
        storageItems: storage.length, authStorageFound: storage.filter(function (c) { return c.isAuth; }).length,
        signedRequests: signed.length,
        webrtcLeaks: (deepData.webrtc && deepData.webrtc.candidates || []).length,
        corsMisconfigs: (deepData.cors || []).filter(function (c) { return c.danger; }).length,
        ssrfCandidates: (deepData.ssrf || []).length,
        cacheStorageEntries: (deepData.cacheStorage || []).reduce(function (a, c) { return a + (c.entries ? c.entries.length : 0); }, 0),
        workers: (deepData.workers || []).length,
        sse: (deepData.sse || []).length,
        broadcastMsgs: (deepData.broadcast || []).length,
        cryptoOps: (deepData.cryptoRuntime || []).length,
        inlineScripts: (deepData.inlineScripts || []).length,
        cssRefs: (deepData.cssRefs || []).length,
        analyticsPixels: Object.keys(deepData.analyticsIDs || {}).length,
        sessionReplayScripts: (deepData.sessionReplay || []).length
      },
      browserEnv: collectBrowserEnv(),
      secrets: secrets,
      tokens: tokens,
      pii: pii,
      antibots: antibots,
      securityIssues: securityIssues,
      securityFlags: securityFlags,
      sitekeys: sitekeys,
      cookieIntel: cookies,
      storageIntel: storage,
      searchQueries: searchQueries,
      webSockets: ws,
      graphqlEndpoints: graphql,
      noiseFiltered: { total: noiseTotal, byCategory: noiseByCat },
      capturedTunnelUrls: tunnels,
      downloads: downloads,
      hiddenApis: apis,
      signedRequestLog: signed,
      endpoints: groups,
      apiQueryParams: apiQueryParams,
      payloadAnalyses: payloadAnalyses,
      redirects: redirects,
      cdnMap: cdnMap,
      recon: { robots: reconData.robots, disallow: reconData.disallow, sitemaps: reconData.sitemaps, sitemapUrls: reconData.sitemapUrls, done: reconData.done },
      apiKeys: collectApiKeys(),
      signatures: extractSignatures(),
      flowMap: buildFlowMap(),
      captcha: (function () {
        var hooked = (typeof captchaData !== "undefined" ? captchaData.widgets : []) || [];
        var dom = detectCaptchaWidgets(), all = hooked.concat(dom), seenW = {}, widgets = [];
        all.forEach(function (w) { var k = w.type + "|" + (w.sitekey || ""); if (!seenW[k]) { seenW[k] = 1; widgets.push({ type: w.type, sitekey: w.sitekey, action: w.action, source: w.source }); } });
        widgets.forEach(function (w) { if (!w.sitekey) { var mt = sitekeys.filter(function (k) { return (/Turnstile/.test(w.type) && /^0x4/.test(k.key)) || (/reCAPTCHA/.test(w.type) && /^6L/.test(k.key)) || (/hCaptcha/.test(w.type) && /^[0-9a-f]{8}-/.test(k.key)) || (/Arkose/.test(w.type) && /^[A-F0-9-]{20,}/i.test(k.key)); }); if (mt.length) w.sitekey = mt[0].key; } });
        return { sitekeys: sitekeys, widgets: widgets, tokens: (typeof captchaData !== "undefined" ? captchaData.tokens : []), allDetections: captchaAll };
      })(),
      reverseEngineering: {
        tech: detectTech(),
        appState: extractAppState(),
        forms: extractForms(),
        htmlEndpoints: extractHtmlEndpoints(),
        serviceWorkers: swData.slice(),
        csp: extractCSP(),
        hiddenLinks: extractHiddenLinks(),
        crypto: deepData.crypto.slice(),
        decoded: deepData.decoded.slice(),
        jsMining: { bundlesMined: deepData.bundlesMined, files: deepData.jsFiles || [], endpoints: deepData.jsEndpoints, secrets: deepData.jsSecrets, pii: deepData.pii, graphql: deepData.graphql, sourceMaps: deepData.sourceMaps, done: deepData.done }
      },
      fingerprint: { capabilities: deepData.capabilities, webAuthn: deepData.webAuthn, webrtc: deepData.webrtc, framebusting: deepData.framebusting },
      fingerprint_v7: { analyticsIDs: deepData.analyticsIDs, trackingPixels: deepData.trackingPixels, sessionReplay: deepData.sessionReplay, jsonld: deepData.jsonld, openGraph: deepData.openGraph },
      exploration: { deepLinks: deepData.deepLinks, resourceHints: deepData.resourceHints, alternates: deepData.alternates, formsDeep: deepData.formsDeep, allMeta: deepData.allMeta },
      securityExtra: { cors: deepData.cors, ssrf: deepData.ssrf, csp: deepData.csp, redirects: deepData.redirects, setCookies: deepData.setCookies },
      runtime: { workers: deepData.workers, sse: deepData.sse, broadcast: deepData.broadcast, cryptoRuntime: deepData.cryptoRuntime, perf: deepData.perf, storageKeys: deepData.storageKeys, cacheStorage: deepData.cacheStorage, indexedDBDetail: deepData.idbDetail, inlineScripts: deepData.inlineScripts, cssRefs: deepData.cssRefs, operationNames: deepData.operationNames },
      deepScan: { probes: deepData.probes.slice(0, 200), globals: deepData.globals.slice(0, 150), indexedDB: deepData.idb.slice(0, 60), postMessages: deepData.postMessages.slice(-60), meta: deepData.meta.slice(0, 80), done: deepData.done },
      requests: requests
    };
  }

  function buildPlanMarkdown() {
    var rep = buildReport();
    var L = [];
    L.push("# Plan de scraping — NexusScope Pro v9.0 · " + rep.meta.url);
    L.push("");
    L.push("Generado: " + rep.meta.timestamp + " · " + rep.meta.uniqueEndpoints + " endpoints únicos · " + rep.statistics.totalRequests + " requests");
    L.push(""); L.push("> Creado por **David Zuniga** · Editado y mejorado por **José**");
    L.push("");
    var key = [];
    if (rep.secrets.length) key.push("- 🔐 **Secrets (" + rep.secrets.length + ")**: " + rep.secrets.slice(0, 8).map(function (s) { return s.name + "=`" + s.value + "`"; }).join(", "));
    if (rep.tokens.length) key.push("- 🎟️ **Tokens (" + rep.tokens.length + ")**: " + rep.tokens.slice(0, 8).map(function (t) { return t.type + " `" + String(t.value).slice(0, 40) + "…`"; }).join(", "));
    if (rep.pii && rep.pii.length) key.push("- 👤 **PII (" + rep.pii.length + ")**: " + rep.pii.slice(0, 8).map(function (p) { return p.name + "=`" + String(p.value).slice(0, 40) + "`"; }).join(", "));
    if (rep.antibots && rep.antibots.length) key.push("- 🛡️ **Antibot**: " + rep.antibots.map(function (a) { return a.vendor; }).join(", "));
    if (rep.sitekeys.length) key.push("- 🧩 **Sitekeys**: " + rep.sitekeys.map(function (s) { return s.type + " `" + s.key + "`"; }).join(", "));
    if (key.length) { L.push("## 🔑 Hallazgos clave"); L.push(""); key.forEach(function (k) { L.push(k); }); L.push(""); }
    var ds = rep.deepScan || {};
    if (ds.probes && ds.probes.length) { L.push("## 📡 Archivos internos expuestos"); L.push(""); ds.probes.forEach(function (p) { L.push("- `GET " + p.path + "` — " + p.status); }); L.push(""); }
    var fe = rep.fingerprint || {};
    if (fe.webrtc && fe.webrtc.candidates && fe.webrtc.candidates.length) { L.push("## 📡 WebRTC leaks"); L.push(""); fe.webrtc.candidates.forEach(function (c) { L.push("- `" + c + "`"); }); L.push(""); }
    var se = rep.securityExtra || {};
    if (se.cors && se.cors.length) { L.push("## 🛡️ CORS"); L.push(""); se.cors.forEach(function (c) { L.push("- " + (c.danger ? "⚠️ " : "") + "`" + c.acao + "` " + c.url.slice(0, 80)); }); L.push(""); }
    if (se.ssrf && se.ssrf.length) { L.push("## 🎯 SSRF/Open Redirect"); L.push(""); se.ssrf.forEach(function (s) { L.push("- `" + s.param + "=" + s.value + "`"); }); L.push(""); }
    var rt = rep.runtime || {};
    if (rt.workers && rt.workers.length) { L.push("## ⚙️ Workers"); L.push(""); rt.workers.forEach(function (w) { L.push("- " + w.type + ": " + w.url); }); L.push(""); }
    return L.join("\n");
  }

  function headersToObj(h) {
    var o = {};
    try {
      if (!h) return o;
      if (typeof h.forEach === "function") h.forEach(function (v, k) { o[k] = v; });
      else if (Array.isArray(h)) h.forEach(function (p) { o[p[0]] = p[1]; });
      else for (var k in h) o[k] = h[k];
    } catch (e) {}
    return o;
  }
  function parseRespHeaders(str) {
    var o = {}, lines = (str || "").trim().split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) { var idx = lines[i].indexOf(":"); if (idx > 0) o[lines[i].slice(0, idx).trim().toLowerCase()] = lines[i].slice(idx + 1).trim(); }
    return o;
  }
  function bodyToText(body) {
    return new Promise(function (res) {
      try {
        if (body == null) return res("");
        if (typeof body === "string") return res(body.slice(0, 20000));
        if (body instanceof URLSearchParams) return res(body.toString().slice(0, 20000));
        if (typeof FormData !== "undefined" && body instanceof FormData) { var p = []; body.forEach(function (v, k) { p.push(k + "=" + (typeof v === "string" ? v : "[file]")); }); return res(p.join("&").slice(0, 20000)); }
        if (typeof Blob !== "undefined" && body instanceof Blob) return res("[Blob " + body.size + "b]");
        if (body instanceof ArrayBuffer) return res("[ArrayBuffer " + body.byteLength + "b]");
        return res(String(body).slice(0, 20000));
      } catch (e) { res(""); }
    });
  }
  function absURL(u) { try { return new URL(u, location.href).href; } catch (e) { return String(u); } }

  // ═══════════════════════════════════════════════════════════
  //  HOOKS
  // ═══════════════════════════════════════════════════════════
  var origFetch = window.fetch;
  if (origFetch && !origFetch.__snifffed) {
    var wrapped = function (input, init) {
      var url = "", method = "GET", reqHeaders = {};
      try {
        if (typeof input === "string") url = input;
        else if (typeof Request !== "undefined" && input instanceof Request) { url = input.url; method = input.method; reqHeaders = headersToObj(input.headers); }
        else if (input && input.url) url = input.url;
        if (init) { if (init.method) method = init.method; if (init.headers) { var ih = headersToObj(init.headers); for (var k in ih) reqHeaders[k] = ih[k]; } }
        url = absURL(url);
      } catch (e) {}
      var started = (performance && performance.now) ? performance.now() : Date.now();
      var entry = store.add({ kind: "fetch", url: url, method: (method || "GET").toUpperCase(), reqHeaders: reqHeaders, pending: true });
      var p = origFetch.apply(this, arguments);
      if (init && init.body) bodyToText(init.body).then(function (t) { store.update(entry.id, { reqBody: t }); });
      p.then(function (res) {
        try {
          var clone = res.clone(), respHeaders = headersToObj(clone.headers), respCT = respHeaders["content-type"] || "";
          if (/json|text|xml|javascript|mpegurl|dash|application\/x-www/i.test(respCT) || MANIFEST_RE.test(url)) {
            clone.text().then(function (tx) { store.update(entry.id, { respBody: tx.slice(0, 40000) }); }).catch(function () {});
          }
          store.update(entry.id, { status: res.status, pending: false, respHeaders: respHeaders, respCT: respCT, redirected: !!res.redirected, finalUrl: (res.redirected && res.url && res.url !== url) ? res.url : null, ms: Math.round(((performance && performance.now) ? performance.now() : Date.now()) - started) });
        } catch (e) { store.update(entry.id, { pending: false, status: res && res.status }); }
      }).catch(function (err) { store.update(entry.id, { pending: false, error: String(err && err.message || err) }); });
      return p;
    };
    wrapped.__snifffed = true; window.fetch = wrapped;
  }

  var XP = XMLHttpRequest.prototype;
  if (XP.open && !XP.open.__snifffed) {
    var origOpen = XP.open, origSend = XP.send, origSetH = XP.setRequestHeader;
    XP.open = function (method, url) { try { this.__sniff = { method: (method || "GET").toUpperCase(), url: absURL(url), reqHeaders: {} }; } catch (e) { this.__sniff = { method: method, url: url, reqHeaders: {} }; } return origOpen.apply(this, arguments); };
    XP.setRequestHeader = function (k, v) { try { if (this.__sniff) this.__sniff.reqHeaders[k] = v; } catch (e) {} return origSetH.apply(this, arguments); };
    XP.send = function (body) {
      var s = this.__sniff, self = this;
      if (s) {
        var started = (performance && performance.now) ? performance.now() : Date.now();
        var entry = store.add({ kind: "xhr", url: s.url, method: s.method, reqHeaders: s.reqHeaders, pending: true });
        bodyToText(body).then(function (t) { if (t) store.update(entry.id, { reqBody: t }); });
        this.addEventListener("loadend", function () {
          try {
            var respHeaders = parseRespHeaders(self.getAllResponseHeaders()), respCT = respHeaders["content-type"] || "", respBody = "";
            try { if (self.responseType === "" || self.responseType === "text") respBody = (self.responseText || "").slice(0, 40000); } catch (e) {}
            store.update(entry.id, { status: self.status, pending: false, respHeaders: respHeaders, respCT: respCT, respBody: respBody, ms: Math.round(((performance && performance.now) ? performance.now() : Date.now()) - started) });
          } catch (e) { store.update(entry.id, { pending: false, status: self.status }); }
        });
      }
      return origSend.apply(this, arguments);
    };
    XP.open.__snifffed = true;
  }

  if (navigator.sendBeacon && !navigator.sendBeacon.__snifffed) {
    var origBeacon = navigator.sendBeacon.bind(navigator);
    var bfn = function (url, data) { try { bodyToText(data).then(function (t) { store.add({ kind: "beacon", url: absURL(url), method: "POST", reqBody: t, status: 0, pending: false }); }); } catch (e) {} return origBeacon(url, data); };
    bfn.__snifffed = true; navigator.sendBeacon = bfn;
  }

  var OrigWS = window.WebSocket;
  if (OrigWS && !OrigWS.__snifffed) {
    var WS = function (url, protocols) {
      var ws = protocols !== undefined ? new OrigWS(url, protocols) : new OrigWS(url);
      var entry = store.add({ kind: "ws", url: absURL(url), method: "WS", status: 101, pending: false, wsMessages: [] });
      var log = function (dir, data) { try { var txt = typeof data === "string" ? data : "[binary]"; entry.wsMessages.push({ dir: dir, txt: txt.slice(0, 2000), t: Date.now() }); if (entry.wsMessages.length > 200) entry.wsMessages.shift(); store.update(entry.id, {}); } catch (e) {} };
      ws.addEventListener("message", function (ev) { log("↓", ev.data); });
      var origWSSend = ws.send.bind(ws);
      ws.send = function (d) { log("↑", d); return origWSSend(d); };
      return ws;
    };
    WS.prototype = OrigWS.prototype;
    WS.CONNECTING = OrigWS.CONNECTING; WS.OPEN = OrigWS.OPEN; WS.CLOSING = OrigWS.CLOSING; WS.CLOSED = OrigWS.CLOSED;
    WS.__snifffed = true; window.WebSocket = WS;
  }

  try { window.addEventListener("message", function (ev) { try { var d = typeof ev.data === "string" ? ev.data.slice(0, 600) : (function () { try { return JSON.stringify(ev.data).slice(0, 600); } catch (e) { return String(ev.data).slice(0, 600); } })(); deepData.postMessages.push({ origin: ev.origin || "", data: d, at: Date.now() }); if (deepData.postMessages.length > 150) deepData.postMessages.shift(); } catch (e) {} }); } catch (e) {}

  var DL_EXT_RE = /\.(mp4|mkv|webm|m3u8|mpd|mp3|m4a|aac|flac|wav|ogg|opus|zip|rar|7z|apk|xapk|ipa|pdf|ts|mov|avi|flv|epub|docx|xlsx|pptx)(\?|$)/i;
  var navSeen = {};
  function recordNav(url, via) {
    try { url = absURL(url); } catch (e) { return; }
    if (!url || url.indexOf("javascript:") === 0 || url === "about:blank" || url.charAt(0) === "#" || url.indexOf("blob:") === 0) return;
    if (navSeen[url]) return; navSeen[url] = 1;
    var force = DL_EXT_RE.test(url) || !!detectTunnelType(url) || !!cdnOf(url) || via === "a[download]";
    store.add({ kind: "nav", url: url, method: "OPEN", status: 0, pending: false, via: via, forceDownload: force });
  }
  if (window.open && !window.open.__snifffed) {
    var origWinOpen = window.open;
    var wo = function (u) { if (u) recordNav(u, "window.open"); return origWinOpen.apply(this, arguments); };
    wo.__snifffed = true; try { window.open = wo; } catch (e) {}
  }
  try { document.addEventListener("click", function (ev) { try { var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null; if (!a) return; var href = a.getAttribute("href"); if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return; var abs = null; try { abs = new URL(href, location.href); } catch (e) {} var crossHost = !!(abs && /^https?:$/.test(abs.protocol) && abs.host !== location.host); var dl = a.hasAttribute("download") || DL_EXT_RE.test(href) || !!detectTunnelType(href) || !!detectDownload(href, "") || !!cdnOf(href); if (dl || crossHost) recordNav(href, a.hasAttribute("download") ? "a[download]" : (a.target === "_blank" || a.getAttribute("target") === "_blank") ? "a[_blank]" : crossHost ? "a[external]" : "a[link]"); } catch (e) {} }, true); } catch (e) {}

  var captchaData = { widgets: [], tokens: [] };
  function pushToken(type, token, sitekey) {
    if (!token || String(token).length < 20) return;
    token = String(token);
    if (captchaData.tokens.some(function (t) { return t.token === token; })) return;
    captchaData.tokens.push({ type: type, token: token, sitekey: sitekey || null, at: Date.now() });
    try { store.add({ kind: "captcha", url: "🧩 " + type + " token capturado", method: "TOKEN", status: 200, pending: false, captcha: type, captchaToken: token, sitekey: sitekey || null }); } catch (e) {}
    if (refreshUI) refreshUI();
  }
  function readCaptchaInputs() {
    var map = [["cf-turnstile-response", "Turnstile"], ["g-recaptcha-response", "reCAPTCHA"], ["h-captcha-response", "hCaptcha"], ["turnstileToken", "Turnstile"], ["captchaToken", "Captcha"], ["grecaptchatoken", "reCAPTCHA"], ["fc-token", "Friendly Captcha"], ["mtcaptcha-verifiedtoken", "MTCaptcha"], ["smart-token", "Yandex SmartCaptcha"], ["FunCaptcha-Token", "Arkose/FunCaptcha"]];
    map.forEach(function (m) { try { var els = document.querySelectorAll('[name="' + m[0] + '"],textarea[id="' + m[0] + '"],input[id="' + m[0] + '"],input[name="' + m[0] + '"]'); for (var i = 0; i < els.length; i++) { var v = els[i].value; if (v && v.length > 20) pushToken(m[1], v, els[i].getAttribute("data-sitekey") || null); } } catch (e) {} });
    return captchaData.tokens.slice();
  }
  try { setInterval(readCaptchaInputs, 1200); } catch (e) {}

  try {
    var seenPerf = {};
    var po = new PerformanceObserver(function (list) {
      var arr = list.getEntries();
      for (var i = 0; i < arr.length; i++) {
        var r = arr[i];
        if (!r.name || seenPerf[r.name]) continue; seenPerf[r.name] = 1;
        if (r.initiatorType === "fetch" || r.initiatorType === "xmlhttprequest") continue;
        store.add({ kind: "res", url: r.name, method: "GET", status: 0, pending: false, respCT: "", initiator: r.initiatorType, passive: true, ms: Math.round(r.duration) });
      }
    });
    po.observe({ type: "resource", buffered: true });
  } catch (e) {}

  function scanDOMSecrets() {
    try {
      var html = document.documentElement ? document.documentElement.innerHTML.slice(0, 500000) : "";
      var secrets = scanSecrets(html, "inline-html");
      if (secrets.length) store.add({ kind: "dom", url: location.href + "  (inline HTML/scripts)", method: "SCAN", status: 0, pending: false, secrets: secrets, respBody: "" });
      var piis = scanPII(html, "inline-html");
      if (piis.length) store.add({ kind: "dom-pii", url: location.href + "  (PII en HTML)", method: "SCAN", status: 0, pending: false, pii: piis, respBody: "" });
    } catch (e) {}
  }

  window.__snifffer = {
    store: store, push: function (e) { return store.add(e); },
    report: buildReport, export: function () { return JSON.stringify(buildReport(), null, 2); },
    exportRaw: function () { return JSON.stringify(store.entries, null, 2); },
    plan: buildPlanMarkdown, scan: scanDOMSecrets, recon: reconFetch, deep: deepRun, mine: mineBundles, deepScan: deepRun,
    tokens: collectTokens, decode: smartDecode, beautify: beautifyJS, __ui: true
  };
  window.__ryffer = window.__snifffer;
  window.__spyderx = window.__snifffer;

  function hlEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function highlightJSON(str) {
    return hlEsc(str).replace(/("(?:\\.|[^"\\])*"(\s*:)?)|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g, function (m, s1, colon, kw, num) {
      if (s1 != null) return '<span class="t-' + (colon ? 'key' : 'str') + '">' + m + '</span>';
      if (kw != null) return '<span class="t-' + (/null/.test(m) ? 'null' : 'bool') + '">' + m + '</span>';
      if (num != null) return '<span class="t-num">' + m + '</span>';
      return m;
    });
  }
  function highlightHTML(str) {
    var s = hlEsc(str);
    s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="t-com">$1</span>');
    s = s.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:[^&]|&(?!gt;))*?)(\/?&gt;)/g, function (m, open, name, attrs, close) {
      var a = attrs.replace(/([a-zA-Z_:][\w:-]*)(=)("[^"]*"|'[^']*')/g, '<span class="t-attr">$1</span>$2<span class="t-str">$3</span>');
      return '<span class="t-punct">' + open + '</span><span class="t-tag">' + name + '</span>' + a + '<span class="t-punct">' + close + '</span>';
    });
    return s;
  }
  function highlightGeneric(str) {
    var s = hlEsc(str);
    s = s.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '<span class="t-str">$1</span>');
    s = s.replace(/\b(function|return|const|let|var|await|async|new|fetch|true|false|null|if|else|for|curl)\b/g, '<span class="t-key">$1</span>');
    s = s.replace(/(https?:\/\/[^\s"'<)]+)/g, '<span class="t-url">$1</span>');
    return s;
  }
  function hl(text, ct) {
    var t = String(text == null ? "" : text), c = (ct || "").toLowerCase();
    if (c.indexOf("json") >= 0 || /^\s*[{\[]/.test(t)) return highlightJSON(t);
    if (c.indexOf("html") >= 0 || c.indexOf("xml") >= 0 || /^\s*<(!doctype|html|\?xml|urlset|[a-z])/i.test(t)) return highlightHTML(t);
    return highlightGeneric(t);
  }

  function spiderSVG(s) {
    return '<svg style="width:' + s + 'px;height:' + s + 'px;display:block;flex:none" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="8" y="9" width="48" height="42" rx="6" stroke="#fff" stroke-opacity=".5" stroke-width="2.4"/>' +
      '<line x1="8" y1="19" x2="56" y2="19" stroke="#fff" stroke-opacity=".5" stroke-width="2.4"/>' +
      '<circle cx="15.5" cy="14" r="2" fill="#ff5f9e"/><circle cx="22.5" cy="14" r="2" fill="#ffd166"/><circle cx="29.5" cy="14" r="2" fill="#3ee89a"/>' +
      '<g stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none">' +
      '<path d="M25 34 Q14 28 10 21"/><path d="M24 39 Q12 38 6 33"/><path d="M24 44 Q12 48 8 55"/><path d="M26 47 Q21 54 21 60"/>' +
      '<path d="M39 34 Q50 28 54 21"/><path d="M40 39 Q52 38 58 33"/><path d="M40 44 Q52 48 56 55"/><path d="M38 47 Q43 54 43 60"/>' +
      '</g>' +
      '<ellipse cx="32" cy="41" rx="7.5" ry="9.5" fill="#8b5cf6"/>' +
      '<circle cx="32" cy="29" r="5.2" fill="#ff5f9e"/>' +
      '<circle cx="30" cy="27.8" r="1.1" fill="#fff"/><circle cx="34.2" cy="27.8" r="1.1" fill="#fff"/>' +
      '</svg>';
  }

  // ═══════════════════════════════════════════════════════════
  //  TECH ATLAS · detección pasiva de stack completo
  //  (NexusScope Pro · David Zuniga & José) — no modifica la página
  // ═══════════════════════════════════════════════════════════
  var ATLAS_STATE = { probes: null, probing: false };
  // Rutas sensibles / endpoints ocultos a comprobar bajo demanda
  var ATLAS_PATHS = ["/admin", "/administrator", "/wp-admin", "/wp-login.php", "/cpanel", "/phpmyadmin", "/api/internal", "/api/v1", "/graphql", "/rest", "/swagger", "/swagger.json", "/swagger-ui.html", "/api-docs", "/openapi.json", "/redoc", "/debug", "/actuator", "/actuator/env", "/actuator/health", "/health", "/metrics", "/status", "/.env", "/.git/config", "/.git/HEAD", "/backup.zip", "/backup.sql", "/db.sql", "/config.php.bak", "/config.json", "/package.json", "/composer.json", "/robots.txt", "/sitemap.xml", "/manifest.json", "/.well-known/security.txt", "/server-status", "/server-info", "/web.config", "/.DS_Store"];
  // ── helpers de detección ──
  function atlasText() { try { return document.documentElement.outerHTML.slice(0, 500000); } catch (e) { return ""; } }
  function atlasHas(re) { try { return re.test(atlasText()); } catch (e) { return false; } }
  function atlasTag(t) { try { return document.getElementsByTagName(t).length; } catch (e) { return 0; } }
  function atlasQ(sel) { try { return document.querySelectorAll(sel).length; } catch (e) { return 0; } }
  function atlasAPI(p) { try { var o = window, a = p.split("."); for (var i = 0; i < a.length; i++) { o = o[a[i]]; if (o == null) return false; } return true; } catch (e) { return false; } }
  function atlasCSS(prop) { try { for (var i = 0; i < document.styleSheets.length; i++) { var rs; try { rs = document.styleSheets[i].cssRules; } catch (e) { continue; } if (!rs) continue; for (var j = 0; j < rs.length; j++) { var st = rs[j].style; if (st && st.getPropertyValue && st.getPropertyValue(prop)) return true; } } } catch (e) {} return false; }
  function atlasHdr(name) { try { var es = store.entries; for (var i = es.length - 1; i >= 0; i--) { var h = es[i].respHeaders; if (h) for (var k in h) if (k.toLowerCase() === name) return h[k]; } } catch (e) {} return null; }
  function atlasHdrHas(re) { try { var es = store.entries; for (var i = es.length - 1; i >= 0; i--) { var h = es[i].respHeaders; if (!h) continue; for (var k in h) { if (re.test(k) || re.test(String(h[k]))) return true; } } } catch (e) {} return false; }
  function atlasLink(re) { try { var as = document.querySelectorAll("a[href]"); for (var i = 0; i < as.length; i++) { if (re.test(as[i].getAttribute("href") || "") || re.test(as[i].textContent || "")) return true; } } catch (e) {} return false; }
  function atlasNet(re) { try { var es = store.entries; for (var i = 0; i < es.length; i++) { if (re.test(es[i].url || "")) return true; } } catch (e) {} return false; }
  function atlasRep(key) { try { var r = window.__snifffer.report(); var v = r[key]; return (v && v.length) ? v.length : null; } catch (e) { return null; } }
  function I(l, f) { return { l: l, f: f || null }; }
  var ATLAS_GROUPS = [
    { t: "1 · Lenguajes & formatos", items: [
      I("HTML", function () { return !!document.documentElement; }),
      I("CSS", function () { return document.styleSheets.length || atlasTag("style"); }),
      I("JavaScript", function () { return atlasTag("script"); }),
      I("TypeScript"), I("JSX"), I("TSX"),
      I("JSON", function () { return atlasQ('script[type="application/json"],script[type="application/ld+json"]') || atlasHas(/application\/json/); }),
      I("XML", function () { return /xml/i.test(document.contentType || ""); }),
      I("YAML"), I("Markdown") ] },
    { t: "2 · Estructura HTML", items: [
      I("Header", function () { return atlasTag("header"); }), I("Nav", function () { return atlasTag("nav"); }),
      I("Main", function () { return atlasTag("main"); }), I("Footer", function () { return atlasTag("footer"); }),
      I("Section", function () { return atlasTag("section"); }), I("Article", function () { return atlasTag("article"); }),
      I("Aside", function () { return atlasTag("aside"); }), I("Div", function () { return atlasTag("div"); }),
      I("Span", function () { return atlasTag("span"); }), I("Iframe", function () { return atlasTag("iframe"); }) ] },
    { t: "3 · Contenido & texto", items: [
      I("H1", function () { return atlasTag("h1"); }), I("H2", function () { return atlasTag("h2"); }),
      I("H3", function () { return atlasTag("h3"); }), I("H4", function () { return atlasTag("h4"); }),
      I("H5", function () { return atlasTag("h5"); }), I("H6", function () { return atlasTag("h6"); }),
      I("P", function () { return atlasTag("p"); }), I("A", function () { return atlasTag("a"); }),
      I("Img", function () { return atlasTag("img"); }), I("Video", function () { return atlasTag("video"); }) ] },
    { t: "4 · Multimedia & formularios", items: [
      I("Audio", function () { return atlasTag("audio"); }), I("Canvas", function () { return atlasTag("canvas"); }),
      I("SVG", function () { return atlasTag("svg"); }), I("Form", function () { return atlasTag("form"); }),
      I("Input", function () { return atlasTag("input"); }), I("Button", function () { return atlasTag("button"); }),
      I("Select", function () { return atlasTag("select"); }), I("Textarea", function () { return atlasTag("textarea"); }),
      I("Label", function () { return atlasTag("label"); }), I("Fieldset", function () { return atlasTag("fieldset"); }) ] },
    { t: "5 · Tablas, listas & meta", items: [
      I("Legend", function () { return atlasTag("legend"); }), I("Table", function () { return atlasTag("table"); }),
      I("Thead", function () { return atlasTag("thead"); }), I("Tbody", function () { return atlasTag("tbody"); }),
      I("Tr", function () { return atlasTag("tr"); }), I("Th", function () { return atlasTag("th"); }),
      I("Td", function () { return atlasTag("td"); }), I("Ul", function () { return atlasTag("ul"); }),
      I("Ol", function () { return atlasTag("ol"); }), I("Li", function () { return atlasTag("li"); }),
      I("Dl", function () { return atlasTag("dl"); }), I("Dt", function () { return atlasTag("dt"); }),
      I("Dd", function () { return atlasTag("dd"); }), I("Script", function () { return atlasTag("script"); }),
      I("Style", function () { return atlasTag("style"); }), I("Link", function () { return atlasTag("link"); }),
      I("Meta", function () { return atlasTag("meta"); }), I("Title", function () { return atlasTag("title"); }),
      I("Base", function () { return atlasTag("base"); }), I("Br", function () { return atlasTag("br"); }),
      I("Hr", function () { return atlasTag("hr"); }) ] },
    { t: "6 · Propiedades CSS en uso", items: ("color background margin padding border display flex grid position top left right bottom z-index width height max-width min-width font-family font-size font-weight text-align line-height letter-spacing box-shadow border-radius transition transform animation opacity overflow cursor visibility float clear object-fit filter backdrop-filter").split(" ").map(function (p) { return I(p, function () { return atlasCSS(p); }); }).concat([
      I("Variables CSS", function () { return atlasHas(/--[a-z0-9-]+\s*:/i); }),
      I("Media Queries", function () { return atlasHas(/@media/); }), I("Keyframes", function () { return atlasHas(/@keyframes/); }),
      I("clamp()", function () { return atlasHas(/clamp\(/); }), I("calc()", function () { return atlasHas(/calc\(/); }),
      I("CSS Grid/Flex (ref)"), I("Container Queries (ref)"), I("Pseudo-clases/elementos (ref)"), I("Blend modes (ref)"), I("Clip-path / Mask (ref)") ]) },
    { t: "7 · APIs del navegador", items: [
      I("DOM", function () { return !!document; }), I("Fetch", function () { return atlasAPI("fetch"); }),
      I("LocalStorage", function () { return atlasAPI("localStorage"); }), I("SessionStorage", function () { return atlasAPI("sessionStorage"); }),
      I("IndexedDB", function () { return atlasAPI("indexedDB"); }), I("Geolocation", function () { return atlasAPI("navigator.geolocation"); }),
      I("Notifications", function () { return atlasAPI("Notification"); }), I("Canvas API", function () { return atlasAPI("HTMLCanvasElement"); }),
      I("WebGL", function () { return atlasAPI("WebGLRenderingContext"); }), I("WebGPU", function () { return atlasAPI("navigator.gpu"); }),
      I("Audio API", function () { return atlasAPI("AudioContext") || atlasAPI("webkitAudioContext"); }), I("Video API", function () { return atlasAPI("HTMLVideoElement"); }),
      I("Clipboard API", function () { return atlasAPI("navigator.clipboard"); }), I("Drag and Drop", function () { return atlasAPI("DataTransfer"); }),
      I("History API", function () { return atlasAPI("history.pushState"); }), I("Navigator", function () { return atlasAPI("navigator"); }),
      I("Window", function () { return atlasAPI("window"); }), I("Document", function () { return atlasAPI("document"); }),
      I("setTimeout", function () { return atlasAPI("setTimeout"); }), I("setInterval", function () { return atlasAPI("setInterval"); }),
      I("Promise", function () { return atlasAPI("Promise"); }) ] },
    { t: "8 · JS avanzado & DOM en código", items: [
      I("Async/await", function () { return atlasHas(/async\s*(function|\()/); }),
      I("addEventListener", function () { return atlasHas(/addEventListener\s*\(/); }),
      I("querySelector", function () { return atlasHas(/querySelector\s*\(/); }),
      I("querySelectorAll", function () { return atlasHas(/querySelectorAll\s*\(/); }),
      I("getElementById", function () { return atlasHas(/getElementById\s*\(/); }),
      I("createElement", function () { return atlasHas(/createElement\s*\(/); }),
      I("appendChild", function () { return atlasHas(/appendChild\s*\(/); }),
      I("innerHTML", function () { return atlasHas(/innerHTML/); }),
      I("textContent", function () { return atlasHas(/textContent/); }),
      I("classList", function () { return atlasHas(/classList/); }),
      I("Módulos ES (import/export)", function () { return atlasHas(/type=["']module["']/) || atlasHas(/\bimport\s*\(/); }),
      I("Optional chaining (?.)", function () { return atlasHas(/\?\./); }),
      I("Nullish coalescing (??)", function () { return atlasHas(/\?\?/); }),
      I("Template literals / spread / destructuring (ref)"), I("Generators / iterators (ref)"), I("Top-level await (ref)") ] },
    { t: "9 · Frameworks & librerías UI", items: [
      I("React", function () { return atlasAPI("React") || atlasAPI("__REACT_DEVTOOLS_GLOBAL_HOOK__") || atlasQ("[data-reactroot],[data-reactid]") || atlasHas(/react(?:\.production)?(?:\.min)?\.js/); }),
      I("Vue", function () { return atlasAPI("Vue") || atlasAPI("__VUE__") || atlasQ("[data-v-app]") || atlasHas(/data-v-[a-f0-9]{6,}/); }),
      I("Angular", function () { return atlasAPI("ng") || atlasQ("[ng-version],[_nghost]"); }),
      I("Svelte", function () { return atlasAPI("__svelte") || atlasHas(/svelte/); }),
      I("Solid"), I("Preact", function () { return atlasAPI("preact") || atlasHas(/preact/); }), I("Lit"),
      I("Alpine", function () { return atlasQ("[x-data]"); }),
      I("jQuery", function () { return atlasAPI("jQuery") || atlasAPI("$"); }),
      I("Bootstrap", function () { return atlasHas(/bootstrap/) || atlasNet(/bootstrap/); }),
      I("Tailwind", function () { return atlasHas(/tailwind/) || atlasNet(/tailwind/); }),
      I("Material UI", function () { return atlasHas(/material-ui|\bMui[A-Z]/) || atlasNet(/mui/); }),
      I("Chakra UI", function () { return atlasHas(/chakra/); }),
      I("Ant Design", function () { return atlasQ('[class*="ant-"]'); }) ] },
    { t: "10 · Meta-frameworks & tooling", items: [
      I("Next.js", function () { return atlasAPI("__NEXT_DATA__") || atlasHas(/\/_next\//); }),
      I("Nuxt", function () { return atlasAPI("__NUXT__") || atlasHas(/\/_nuxt\//); }),
      I("Gatsby", function () { return atlasAPI("___gatsby") || atlasHas(/gatsby/); }),
      I("Remix", function () { return atlasAPI("__remixManifest") || atlasHas(/remix/); }),
      I("Astro", function () { return atlasQ("astro-island") || atlasHas(/astro/); }),
      I("Vite", function () { return atlasHas(/\/@vite\/|vite\.js|data-vite/); }),
      I("Webpack", function () { return atlasAPI("webpackJsonp") || atlasAPI("webpackChunk") || atlasHas(/webpack/); }),
      I("Rollup"), I("Parcel"), I("Babel", function () { return atlasHas(/babel/); }),
      I("ESLint"), I("Prettier"), I("TypeScript"), I("Sass"), I("Less"), I("PostCSS") ] },
    { t: "11 · Backend & servidor", items: [
      I("Node.js", function () { return atlasHdrHas(/x-powered-by/i) && atlasHdrHas(/node|express/i); }),
      I("Express", function () { var p = atlasHdr("x-powered-by"); return p && /express/i.test(p) ? p : null; }),
      I("NestJS"), I("Koa"), I("Fastify"),
      I("Python", function () { return atlasHdrHas(/gunicorn|uvicorn|werkzeug|python/i); }),
      I("Django", function () { return atlasHas(/csrfmiddlewaretoken/) || (document.cookie || "").indexOf("csrftoken") >= 0; }),
      I("Flask", function () { return atlasHdrHas(/werkzeug/i); }), I("FastAPI"),
      I("Ruby"), I("Rails", function () { return atlasHdr("x-runtime") || (document.cookie || "").indexOf("_session_id") >= 0; }),
      I("PHP", function () { return atlasHdrHas(/php/i) || (document.cookie || "").indexOf("PHPSESSID") >= 0; }),
      I("Laravel", function () { return (document.cookie || "").indexOf("laravel_session") >= 0 || atlasHas(/laravel_session/); }),
      I("Symfony"), I("Java", function () { return (document.cookie || "").indexOf("JSESSIONID") >= 0; }),
      I("Spring", function () { return atlasHdr("x-application-context") || (document.cookie || "").indexOf("JSESSIONID") >= 0; }),
      I(".NET", function () { return atlasHdrHas(/asp\.net/i) || (document.cookie || "").indexOf("ASP.NET") >= 0; }),
      I("Go"), I("Gin"), I("Rust"), I("Actix") ] },
    { t: "12 · Bases de datos (indicios en cliente)", items: [
      I("MySQL", function () { return atlasHas(/mysql:\/\//); }), I("PostgreSQL", function () { return atlasHas(/postgres(ql)?:\/\//); }),
      I("SQLite"), I("MongoDB", function () { return atlasHas(/mongodb(\+srv)?:\/\//); }),
      I("Redis", function () { return atlasHas(/redis(s)?:\/\//); }), I("Cassandra"), I("DynamoDB"),
      I("Firebase", function () { return atlasNet(/firebaseio|firestore|firebaseapp/) || atlasHas(/firebase/); }),
      I("Supabase", function () { return atlasNet(/supabase/) || atlasHas(/supabase/); }) ] },
    { t: "13 · APIs & protocolos", items: [
      I("REST", function () { return atlasNet(/\/api\/|\/rest\//i); }),
      I("GraphQL", function () { return atlasNet(/\/graphql/i) || atlasHas(/__schema|graphql/i); }),
      I("gRPC"), I("WebSockets", function () { try { var es = store.entries; for (var i = 0; i < es.length; i++) { if (/^wss?:/i.test(es[i].url || "")) return true; } } catch (e) {} return false; }),
      I("WebRTC", function () { return atlasAPI("RTCPeerConnection"); }),
      I("SOAP", function () { return atlasHas(/soap/i); }),
      I("OpenAPI", function () { return atlasNet(/openapi|api-docs/i) || atlasHas(/openapi/i); }),
      I("Swagger", function () { return atlasNet(/swagger/i) || atlasHas(/swagger/i); }),
      I("Postman"), I("Insomnia") ] },
    { t: "14 · Seguridad", items: [
      I("HTTPS", function () { return location.protocol === "https:"; }),
      I("TLS / TLS 1.3 (ref)"), I("HSTS", function () { return atlasHdr("strict-transport-security"); }),
      I("CSP", function () { return atlasHdr("content-security-policy"); }),
      I("CORS", function () { return atlasHdr("access-control-allow-origin"); }),
      I("X-Frame-Options", function () { return atlasHdr("x-frame-options"); }),
      I("CSRF token", function () { return atlasQ('input[name*="csrf"],input[name*="token"],meta[name*="csrf"]') || atlasHas(/csrf/i); }),
      I("XSS / SQLi (patrones)"), I("JWT", function () { return atlasHas(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./); }),
      I("OAuth2", function () { return atlasHas(/oauth|authorize\?/i) || atlasNet(/oauth/i); }),
      I("OIDC", function () { return atlasNet(/\.well-known\/openid/i) || atlasHas(/openid/i); }),
      I("SAML"), I("MFA / 2FA"), I("SSO"),
      I("WAF", function () { return atlasHdrHas(/cloudflare|akamai|imperva|sucuri|aws.?waf/i); }),
      I("DDoS protection", function () { return atlasHdrHas(/cloudflare|akamai|incapsula/i); }),
      I("Rate limiting (429 visto)", function () { try { var es = store.entries; for (var i = 0; i < es.length; i++) { if (es[i].status === 429) return true; } } catch (e) {} return false; }),
      I("Captcha", function () { return atlasRep("sitekeys"); }),
      I("RBAC / ABAC / Scopes (ref)"), I("Refresh/Access/ID token (ref)"),
      I("API key expuesta", function () { return atlasRep("secrets"); }),
      I("CSRF token en headers", function () { return atlasHdrHas(/x-csrf|x-xsrf/i); }),
      I("Signed URL", function () { return atlasNet(/[?&](sig|signature|expires|X-Amz-Signature)=/i); }),
      I("mTLS"), I("Vault") ] },
    { t: "15 · SEO & metadatos", items: [
      I("Title tag", function () { return document.title; }),
      I("Meta description", function () { var m = document.querySelector('meta[name="description"]'); return m ? m.getAttribute("content") : null; }),
      I("Canonical", function () { return atlasQ('link[rel="canonical"]'); }),
      I("Robots.txt (probar abajo)"), I("Sitemap.xml (probar abajo)"),
      I("Structured data / JSON-LD", function () { return atlasQ('script[type="application/ld+json"]'); }),
      I("Open Graph", function () { return atlasQ('meta[property^="og:"]'); }),
      I("Twitter Cards", function () { return atlasQ('meta[name^="twitter:"]'); }),
      I("Hreflang", function () { return atlasQ("link[hreflang]"); }),
      I("Meta tags", function () { return atlasTag("meta"); }),
      I("Alt text", function () { var sin = document.querySelectorAll("img:not([alt])").length; return sin ? "faltan en " + sin + " img" : (atlasTag("img") ? "OK" : null); }),
      I("Semantic HTML", function () { return atlasTag("main") + atlasTag("article") + atlasTag("section"); }),
      I("Keyword research / On-page / Off-page / Backlinks (ref)"), I("Core Web Vitals (ref)") ] },
    { t: "16 · Rendimiento & PWA", items: [
      I("Lazy loading", function () { return atlasQ('img[loading="lazy"]'); }),
      I("Code splitting (ref)"), I("Minification (ref)"),
      I("Compression", function () { return atlasHdr("content-encoding"); }),
      I("Caching", function () { return atlasHdr("cache-control"); }),
      I("ETag", function () { return atlasHdr("etag"); }),
      I("CDN", function () { return atlasHdrHas(/cloudfront|cloudflare|fastly|akamai|cdn/i); }),
      I("Image optimization (ref)"), I("WebP", function () { return atlasHas(/\.webp/); }), I("AVIF", function () { return atlasHas(/\.avif/); }),
      I("Preload", function () { return atlasQ('link[rel="preload"]'); }),
      I("Prefetch", function () { return atlasQ('link[rel="prefetch"],link[rel="dns-prefetch"],link[rel="preconnect"]'); }),
      I("Service workers", function () { return atlasAPI("navigator.serviceWorker"); }),
      I("PWA", function () { return atlasAPI("navigator.serviceWorker") && atlasQ('link[rel="manifest"]'); }),
      I("Manifest.json", function () { return atlasQ('link[rel="manifest"]'); }),
      I("Favicon", function () { return atlasQ('link[rel*="icon"]'); }),
      I("Apple touch icon", function () { return atlasQ('link[rel="apple-touch-icon"]'); }),
      I("Theme color", function () { return atlasQ('meta[name="theme-color"]'); }),
      I("Splash screen (ref)"), I("HTTP/2 · HTTP/3 · QUIC (ref)"), I("SSR / SSG / ISR / CSR / Hydration (ref)") ] },
    { t: "17 · Accesibilidad", items: [
      I("ARIA", function () { return atlasQ("[aria-label],[aria-hidden],[aria-describedby],[aria-live]"); }),
      I("Roles", function () { return atlasQ("[role]"); }),
      I("Landmarks", function () { return atlasTag("nav") + atlasTag("main") + atlasTag("header") + atlasTag("footer") + atlasTag("aside"); }),
      I("Alt text", function () { return atlasTag("img") && !document.querySelectorAll("img:not([alt])").length; }),
      I("Lang attribute", function () { return document.documentElement.lang; }),
      I("Skip links", function () { return atlasLink(/skip|#main|#content/i); }),
      I("Focus / Contrast / Screen readers (ref)"), I("Keyboard navigation (ref)"), I("WCAG (ref)"), I("Live regions", function () { return atlasQ("[aria-live]"); }) ] },
    { t: "18 · Infraestructura & hosting", items: [
      I("Cloudflare", function () { return atlasHdrHas(/cloudflare|cf-ray/i) || atlasNet(/cloudflare/); }),
      I("Nginx", function () { return atlasHdrHas(/nginx/i); }), I("Apache", function () { return atlasHdrHas(/apache/i); }),
      I("Caddy", function () { return atlasHdrHas(/caddy/i); }), I("Traefik"),
      I("AWS", function () { return atlasHdrHas(/amazons3|cloudfront|x-amz|awselb/i) || atlasNet(/amazonaws/); }),
      I("Azure", function () { return atlasHdrHas(/x-ms-|azure/i); }),
      I("GCP", function () { return atlasHdrHas(/x-goog|\bgws\b/i) || atlasNet(/googleapis|gstatic/); }),
      I("Vercel", function () { return atlasHdrHas(/x-vercel|vercel/i) || atlasNet(/vercel/); }),
      I("Netlify", function () { return atlasHdrHas(/netlify|x-nf/i) || atlasNet(/netlify/); }),
      I("Heroku"), I("DigitalOcean"),
      I("DNS / Load balancer / Reverse proxy (ref)"), I("Containers / Docker / Kubernetes (ref)"), I("Serverless (ref)") ] },
    { t: "19 · Analítica & marketing", items: [
      I("Google Analytics", function () { return atlasNet(/google-analytics|gtag\/js/) || atlasAPI("ga") || atlasAPI("gtag"); }),
      I("Google Tag Manager", function () { return atlasNet(/googletagmanager/) || atlasAPI("dataLayer"); }),
      I("Matomo", function () { return atlasNet(/matomo/) || atlasAPI("_paq"); }),
      I("Hotjar", function () { return atlasNet(/hotjar/) || atlasAPI("hj"); }),
      I("Mixpanel", function () { return atlasNet(/mixpanel/) || atlasAPI("mixpanel"); }),
      I("Segment", function () { return atlasNet(/segment\.(io|com)/) || atlasAPI("analytics"); }),
      I("Plausible", function () { return atlasNet(/plausible/); }),
      I("Meta Pixel", function () { return atlasNet(/facebook\.com\/tr|fbevents/) || atlasAPI("fbq"); }),
      I("Cookies", function () { return (document.cookie || "").length; }),
      I("A/B testing (ref)"), I("Heatmaps (ref)"), I("CRM / Email marketing (ref)") ] },
    { t: "20 · Pagos & e-commerce", items: [
      I("Stripe", function () { return atlasNet(/js\.stripe\.com|stripe\.com/) || atlasAPI("Stripe") || atlasHas(/pk_(live|test)_/); }),
      I("PayPal", function () { return atlasNet(/paypal/) || atlasAPI("paypal"); }),
      I("Square", function () { return atlasNet(/squareup|square\.com/) || atlasAPI("SqPaymentForm"); }),
      I("Braintree"), I("Adyen", function () { return atlasNet(/adyen/); }), I("Klarna", function () { return atlasNet(/klarna/); }),
      I("Mercado Pago", function () { return atlasNet(/mercadopago|mercadolibre/) || atlasHas(/mercadopago/i); }),
      I("Shopify", function () { return atlasNet(/cdn\.shopify|myshopify/) || atlasAPI("Shopify"); }),
      I("WooCommerce", function () { return atlasHas(/woocommerce/); }),
      I("Magento"), I("PrestaShop"), I("BigCommerce"),
      I("Cart / Checkout / Wishlist (ref)"), I("Inventory / Shipping / Taxes / Coupons (ref)") ] },
    { t: "21 · CMS & contenido", items: [
      I("WordPress", function () { return atlasHas(/wp-content|wp-includes/) || atlasNet(/wp-json|wp-content/); }),
      I("Drupal", function () { return atlasHas(/\/sites\/default|Drupal\./); }),
      I("Joomla", function () { return atlasHas(/\/media\/jui|content="Joomla/); }),
      I("Ghost", function () { return atlasHas(/content="Ghost|\/ghost\//); }),
      I("Wix", function () { return atlasNet(/wixstatic|wix\.com/) || atlasHas(/X-Wix/); }),
      I("Squarespace", function () { return atlasNet(/squarespace/); }),
      I("Webflow", function () { return atlasHas(/webflow/) || atlasNet(/webflow/); }),
      I("Contentful", function () { return atlasNet(/contentful/); }), I("Strapi"), I("Sanity"), I("Prismic"),
      I("Notion / Medium / Substack (ref)") ] },
    { t: "22 · Funcionalidades detectadas", items: [
      I("Home", function () { return true; }),
      I("About", function () { return atlasLink(/about|nosotros|quienes/i); }),
      I("Services", function () { return atlasLink(/services|servicios/i); }),
      I("Products", function () { return atlasLink(/products?|tienda|shop/i); }),
      I("Blog", function () { return atlasLink(/blog|noticias|news/i); }),
      I("Contact", function () { return atlasLink(/contact|contacto/i); }),
      I("FAQ", function () { return atlasLink(/faq|ayuda|help/i); }),
      I("Terms", function () { return atlasLink(/terms|terminos|condiciones/i); }),
      I("Privacy", function () { return atlasLink(/privacy|privacidad/i); }),
      I("Cookies (banner)", function () { return atlasNet(/cookiebot|onetrust|cookieconsent/) || atlasHas(/cookie consent|aceptar cookies/i); }),
      I("Login", function () { return atlasLink(/login|signin|iniciar sesi/i) || atlasQ('input[type="password"]'); }),
      I("Register", function () { return atlasLink(/register|signup|registro|crear cuenta/i); }),
      I("Password reset (ref)"), I("Email verification (ref)"), I("2FA setup (ref)"),
      I("Search", function () { return atlasQ('input[type="search"],form[role="search"]') || atlasLink(/search|buscar/i); }),
      I("Filters / Sorting (ref)"),
      I("Pagination", function () { return atlasQ('[class*="pagination"],[aria-label*="pagination" i]'); }),
      I("Breadcrumbs", function () { return atlasQ('[class*="breadcrumb"],[aria-label*="breadcrumb" i]'); }),
      I("Tags / Categories (ref)"),
      I("Comments", function () { return atlasQ('#comments,[class*="comment"],#disqus_thread'); }),
      I("Ratings / Reviews", function () { return atlasQ('[class*="rating"],[class*="stars"],[itemprop="ratingValue"]'); }),
      I("User profiles / Avatars (ref)"),
      I("Notifications UI", function () { return atlasQ('[class*="notification"],[class*="toast"]'); }),
      I("Messages / Chat", function () { return atlasNet(/intercom|crisp|tawk|zendesk|drift|livechat/); }),
      I("Forums (ref)"), I("Dashboard / Admin panel (ref)"),
      I("Newsletter", function () { return atlasQ('input[type="email"]') && atlasHas(/newsletter|suscri/i); }),
      I("Popups / Modals", function () { return atlasQ('[class*="modal"],[class*="popup"],dialog'); }),
      I("404 / 500 / Maintenance / Coming soon (ref)") ] },
    { t: "23 · Cumplimiento & legal", items: [
      I("GDPR / CCPA (ref)"), I("Cookie consent", function () { return atlasNet(/cookiebot|onetrust|cookieconsent|iubenda/) || atlasHas(/onetrust|cookiebot/i); }),
      I("Privacy policy", function () { return atlasLink(/privacy|privacidad/i); }),
      I("Terms of service", function () { return atlasLink(/terms|terminos/i); }),
      I("Licenses (ref)"), I("Copyright", function () { return atlasHas(/&copy;|©|copyright/i); }),
      I("DMCA (ref)"), I("Accessibility statement (ref)"), I("Imprint", function () { return atlasLink(/imprint|impressum|aviso legal/i); }) ] },
    { t: "24 · APIs web modernas", items: [
      I("Web Bluetooth", function () { return atlasAPI("navigator.bluetooth"); }), I("Web USB", function () { return atlasAPI("navigator.usb"); }),
      I("Web Serial", function () { return atlasAPI("navigator.serial"); }), I("Web HID", function () { return atlasAPI("navigator.hid"); }),
      I("Web NFC", function () { return atlasAPI("NDEFReader"); }), I("WebXR", function () { return atlasAPI("navigator.xr"); }),
      I("WebAssembly", function () { return atlasAPI("WebAssembly"); }), I("Web Workers", function () { return atlasAPI("Worker"); }),
      I("Shared Workers", function () { return atlasAPI("SharedWorker"); }), I("Broadcast Channel", function () { return atlasAPI("BroadcastChannel"); }),
      I("MessageChannel", function () { return atlasAPI("MessageChannel"); }), I("MutationObserver", function () { return atlasAPI("MutationObserver"); }),
      I("IntersectionObserver", function () { return atlasAPI("IntersectionObserver"); }), I("ResizeObserver", function () { return atlasAPI("ResizeObserver"); }),
      I("PerformanceObserver", function () { return atlasAPI("PerformanceObserver"); }), I("ReportingObserver", function () { return atlasAPI("ReportingObserver"); }),
      I("AbortController", function () { return atlasAPI("AbortController"); }), I("URL API", function () { return atlasAPI("URL"); }),
      I("URLSearchParams", function () { return atlasAPI("URLSearchParams"); }), I("FormData", function () { return atlasAPI("FormData"); }),
      I("Blob", function () { return atlasAPI("Blob"); }), I("File", function () { return atlasAPI("File"); }),
      I("FileReader", function () { return atlasAPI("FileReader"); }), I("ArrayBuffer", function () { return atlasAPI("ArrayBuffer"); }),
      I("TypedArray", function () { return atlasAPI("Uint8Array"); }), I("DataView", function () { return atlasAPI("DataView"); }),
      I("TextEncoder", function () { return atlasAPI("TextEncoder"); }), I("TextDecoder", function () { return atlasAPI("TextDecoder"); }),
      I("Crypto API", function () { return atlasAPI("crypto"); }), I("SubtleCrypto", function () { return atlasAPI("crypto.subtle"); }),
      I("UUID", function () { return atlasAPI("crypto.randomUUID"); }), I("Push API", function () { return atlasAPI("PushManager"); }),
      I("Cache API", function () { return atlasAPI("caches"); }), I("Web Share API", function () { return atlasAPI("navigator.share"); }),
      I("Payment Request API", function () { return atlasAPI("PaymentRequest"); }),
      I("Intl", function () { return atlasAPI("Intl"); }), I("BigInt", function () { return atlasAPI("BigInt"); }),
      I("Reflect", function () { return atlasAPI("Reflect"); }), I("Proxy", function () { return atlasAPI("Proxy"); }),
      I("Map / Set", function () { return atlasAPI("Map") && atlasAPI("Set"); }), I("WeakMap / WeakSet", function () { return atlasAPI("WeakMap"); }),
      I("WeakRef / FinalizationRegistry", function () { return atlasAPI("WeakRef"); }),
      I("Atomics / SharedArrayBuffer", function () { return atlasAPI("SharedArrayBuffer"); }),
      I("Promise.all / race / allSettled / any", function () { return atlasAPI("Promise.allSettled") && atlasAPI("Promise.any"); }),
      I("SIMD (ref)") ] },
    { t: "25 · DevOps, testing & colaboración", items: [
      I("Git / GitHub / GitLab / Bitbucket (ref)"), I("CI/CD (ref)"), I("Jenkins / GitHub Actions / CircleCI (ref)"),
      I("Docker / Kubernetes / Helm / Terraform (ref)"), I("Ansible / Puppet / Chef (ref)"),
      I("Jest / Cypress / Playwright / Selenium / Vitest (ref)"), I("Storybook (ref)"),
      I("Sentry", function () { return atlasNet(/sentry\.io/) || atlasHas(/sentry/); }),
      I("Datadog", function () { return atlasNet(/datadoghq/) || atlasHas(/datadog/i); }),
      I("New Relic", function () { return atlasNet(/newrelic|nr-data/) || atlasAPI("newrelic"); }),
      I("LogRocket", function () { return atlasNet(/logrocket/) || atlasAPI("LogRocket"); }),
      I("Grafana / Prometheus / ELK / Splunk / CloudWatch (ref)"),
      I("Jira / Trello / Asana / Monday / ClickUp (ref)"), I("Slack / Discord / Teams / Zoom (ref)"),
      I("Figma / Sketch / Adobe XD / InVision (ref)"), I("Notion / Confluence / Miro (ref)"),
      I("Backups / Disaster recovery / HA / Failover (ref)"), I("Monorepo / Lerna / Nx / Turborepo (ref)"),
      I("npm / Yarn / pnpm / Bun (ref)"), I("Electron / Tauri / React Native / Flutter (ref)") ] },
    { t: "26 · Seguridad ofensiva & auditoría (referencia)", items: [
      I("OWASP Top 10"), I("SQL injection"), I("XSS"), I("CSRF"), I("SSRF"), I("IDOR"),
      I("Broken access control"), I("Security misconfiguration"), I("Insecure deserialization"), I("Vulnerable components"),
      I("Penetration testing"), I("Bug bounty / HackerOne / Bugcrowd"), I("CVE / CVSS / NVD"),
      I("OWASP ZAP / Burp Suite"), I("Nmap / Wireshark / Metasploit"), I("Sqlmap / Nikto / Hydra"),
      I("SSL Labs / Security Headers / Mozilla Observatory"), I("Lighthouse / Axe / WAVE / Pa11y") ] }
  ];

  var TABS = [
    { id: "all", label: "Net", match: function () { return true; } },
    { id: "res", label: "Resources", match: function (e) { return e.tags.indexOf("SECRET") >= 0 || e.tags.indexOf("TUNNEL") >= 0 || e.tags.indexOf("CAPTCHA") >= 0 || e.tags.indexOf("ANTIBOT") >= 0 || e.tags.indexOf("PII") >= 0; }, special: "res" },
    { id: "tokens", label: "Tokens", match: function () { return false; }, special: "tokens" },
    { id: "play", label: "Playground", match: function () { return false; }, special: "play" },
    { id: "source", label: "Source", match: function () { return false; }, special: "source" },
    { id: "html", label: "HTML", match: function () { return false; }, special: "html" },
    { id: "api", label: "APIs", match: function (e) { return e.tags.indexOf("API") >= 0 && e.tags.indexOf("NOISE") < 0; } },
    { id: "secret", label: "Secrets", match: function (e) { return e.tags.indexOf("SECRET") >= 0; } },
    { id: "pii", label: "PII", match: function (e) { return e.tags.indexOf("PII") >= 0; } },
    { id: "antibot", label: "Antibot", match: function (e) { return e.tags.indexOf("ANTIBOT") >= 0; } },
    { id: "security", label: "Security", match: function () { return false; }, special: "security" },
    { id: "fingerprint", label: "Fingerprint", match: function () { return false; }, special: "fingerprint" },
    { id: "cors", label: "CORS", match: function () { return false; }, special: "cors" },
    { id: "ssrf", label: "SSRF/Redir", match: function () { return false; }, special: "ssrf" },
    { id: "runtime", label: "Runtime", match: function () { return false; }, special: "runtime" },
    { id: "media", label: "Media", match: function (e) { return e.tags.indexOf("MEDIA") >= 0 || e.tags.indexOf("DRM") >= 0; } },
    { id: "download", label: "Downloads", match: function (e) { return e.tags.indexOf("DOWNLOAD") >= 0; } },
    { id: "tunnel", label: "Tunnels", match: function (e) { return e.tags.indexOf("TUNNEL") >= 0; } },
    { id: "ws", label: "WS", match: function (e) { return e.kind === "ws"; } },
    { id: "cdn", label: "CDN", match: function (e) { return e.tags.indexOf("CDN") >= 0; } },
    { id: "captcha", label: "Captcha", match: function (e) { return e.tags.indexOf("CAPTCHA") >= 0; }, special: "captcha" },
    { id: "cookie", label: "Cookies", match: function () { return false; }, special: "cookie" },
    { id: "store", label: "Storage", match: function () { return false; }, special: "store" },
    { id: "atlas", label: "🧭 Atlas", match: function () { return false; }, special: "atlas" }
  ];

  // ── NexusScope Pro · icono profesional hexágono/radar (David Zuniga · mejora José) ──
  function nexusSVG(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M12 1.6l8.97 5.18v10.36L12 22.32l-8.97-5.18V6.78L12 1.6z" fill="rgba(76,194,255,.10)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.2 15.8V8.2l7.6 7.6V8.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="12" cy="12" r="9.6" stroke="currentColor" stroke-width=".7" opacity=".35" stroke-dasharray="2.5 3.5"/>' +
      '</svg>';
  }

  function buildUI() {
    var host = document.createElement("div");
    host.id = "__snifffer_host";
    host.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
    (document.body || document.documentElement).appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var __html =
'<style>' +
':host{all:initial}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}' +
'.fab{position:fixed;right:14px;bottom:14px;width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg,#0b3a54 0%,#0e5a72 55%,#123c5e 100%);color:#7dd8ff;border:1px solid rgba(125,216,255,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;font-size:22px;box-shadow:0 10px 30px rgba(56,189,248,.35),0 3px 10px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;z-index:2147483647;touch-action:none}' +
'.fab .badge{position:absolute;top:-4px;right:-4px;background:#4cc2ff;color:#06283d;font-size:11px;min-width:19px;height:19px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 4px;font-weight:800}' +
'.panel{--bg:#0b1220;--pbg:linear-gradient(168deg,rgba(13,18,32,.96) 0%,rgba(9,13,24,.95) 52%,rgba(11,17,30,.96) 100%);--surf:rgba(148,163,184,.08);--surf2:rgba(148,163,184,.14);--bd:rgba(148,163,184,.16);--bd2:rgba(148,163,184,.28);--tx:#eef4ff;--tx2:#a9b8d8;--mut:#64748f;--ac:#4cc2ff;--acd:rgba(76,194,255,.13);--get:#41c8f5;--post:#3ee89a;--put:#ffc94d;--del:#ff6b81;--open:#ff9e64;--scan:#818cf8;--tok:#ffd166;--crit:#ff6b81;--warn:#ffd166;--ok:#3ee89a;--info:#41c8f5;--violet:#818cf8;position:fixed;left:0;right:0;bottom:0;width:100%;height:82vh;background:var(--pbg);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);color:var(--tx);border-top-left-radius:22px;border-top-right-radius:22px;box-shadow:0 -14px 50px rgba(2,8,23,.65);flex-direction:column;overflow:hidden;border:1px solid var(--bd2);border-bottom:none;display:flex;transform:translateY(107%);transition:transform .32s cubic-bezier(.32,.72,0,1);pointer-events:none;visibility:hidden}' +
'.panel.open{transform:translateY(0);pointer-events:auto;visibility:visible}' +
'@media(min-width:820px){.panel{left:auto;right:0;width:min(760px,100vw);height:min(90vh,920px);border-top-right-radius:0;transform:translateX(107%)}.panel.open{transform:translateX(0)}}' +
'.grip{width:38px;height:4px;background:var(--bd2);border-radius:99px;margin:9px auto 4px;flex:none}' +
'.hd{display:flex;align-items:center;gap:8px;padding:11px 12px;border-bottom:1px solid var(--bd);overflow-x:auto}' +
'.brand{font-weight:800;color:var(--tx);font-size:14px;letter-spacing:.6px;flex:none;display:flex;align-items:center;gap:8px;text-transform:uppercase}' +
'.hd .sp{flex:1}' +
'.hd button{background:var(--surf);color:var(--tx2);border:1px solid var(--bd);border-radius:8px;padding:7px 11px;cursor:pointer;font-size:12px;font-weight:600;flex:none}' +
'.hd button[data-act="export"]{background:var(--acd);color:var(--ac);border-color:transparent}' +
'.hd button.paused{background:rgba(255,209,102,.16);color:var(--warn)}' +
'.stat{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border-bottom:1px solid var(--bd);font-size:11px;color:var(--tx2)}' +
'.stat span{display:flex;align-items:center;gap:6px;padding:6px 11px;border:1px solid var(--bd);border-radius:10px;background:var(--surf)}.stat b{color:var(--tx);font-weight:700;font-size:13px}' +
'.tabs{display:flex;gap:3px;padding:8px 8px 10px;overflow-x:auto}' +
'.tab{padding:8px 13px;font-size:13px;font-weight:600;color:var(--tx2);cursor:pointer;border-radius:9px;white-space:nowrap;flex:none;border:none;background:transparent}' +
'.tab.active{color:var(--ac);background:var(--acd);font-weight:700}' +
'.tab .c{display:inline-block;margin-left:6px;color:var(--mut);font-size:10px;font-weight:700}.tab.active .c{color:var(--ac)}' +
'.toolbar{display:flex;gap:10px;padding:0 12px 12px;align-items:center}' +
'.toolbar input[type=text]{flex:1;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:10px;padding:9px 12px;font-size:13px}' +
'.toolbar label{font-size:12px;color:var(--tx2);display:flex;align-items:center;gap:5px;white-space:nowrap;font-weight:600}' +
'.list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;border-top:1px solid var(--bd)}' +
'.row{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--bd);cursor:pointer;font-size:12px}.row.noise{opacity:.42}' +
'.m{font-weight:700;min-width:46px;text-align:center;border-radius:6px;padding:3px 6px;font-size:10px;color:var(--tx2);background:var(--surf2);font-family:ui-monospace,Menlo,monospace}' +
'.m.GET{color:var(--get);background:rgba(65,200,245,.15)}.m.POST{color:var(--post);background:rgba(62,232,154,.15)}.m.PUT{color:var(--put)}.m.DELETE{color:var(--del)}.m.WS{color:var(--post)}.m.SCAN{color:var(--scan)}.m.OPEN{color:var(--open)}.m.TOKEN{color:var(--tok)}.m.CK{color:var(--tok)}' +
'.st{min-width:30px;text-align:center;font-weight:700;color:var(--tx2);font-family:ui-monospace,Menlo,monospace}.st.ok{color:var(--ok)}.st.err{color:var(--crit)}.st.pend{color:var(--warn)}' +
'.u{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx);font-family:ui-monospace,Menlo,monospace}.u .dom{color:var(--mut)}.u .pth{color:var(--tx)}' +
'.tg{display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}' +
'.chip{font-size:9px;padding:2.5px 6px;border-radius:6px;font-weight:700}' +
'.chip.API{color:var(--info);background:rgba(65,200,245,.15)}.chip.SECRET{color:var(--crit);background:rgba(255,107,129,.16)}.chip.MEDIA{color:var(--violet);background:rgba(199,146,234,.16)}.chip.CDN{color:var(--ok)}.chip.CAPTCHA{color:var(--warn)}.chip.AUTH{color:var(--violet)}.chip.DRM{color:var(--crit)}.chip.NOISE{color:var(--mut)}.chip.TUNNEL{color:var(--open)}.chip.DOWNLOAD{color:var(--ok)}.chip.SEARCH{color:var(--violet)}.chip.JWT{color:var(--crit)}.chip.PII{color:#e89a3e;background:rgba(232,154,62,.18)}.chip.ANTIBOT{color:var(--crit);background:rgba(255,107,129,.2)}' +
'.detail{position:absolute;inset:0;background:var(--pbg);display:none;flex-direction:column;z-index:50}.detail.open{display:flex}' +
'.detail .dh{display:flex;gap:9px;align-items:center;padding:12px;border-bottom:1px solid var(--bd)}.dtitle{color:var(--tx2);font-size:12px;overflow:hidden;white-space:nowrap;display:flex;align-items:center;gap:8px;font-family:ui-monospace,Menlo,monospace}' +
'.dback{width:34px;height:34px;padding:0!important;border-radius:50%!important;font-size:18px;display:flex;align-items:center;justify-content:center;flex:none}' +
'.dstatus{font-weight:800}.dstatus.ok{color:var(--ok)}.dstatus.err{color:var(--crit)}.dmeta{color:var(--mut);font-size:11px}' +
'.sec h4 .cnt2{color:var(--mut);font-weight:700;margin-left:7px;font-size:10px}.sec h4 .pv{color:var(--mut);font-weight:600;margin-left:7px;text-transform:none}' +
'.uq{color:var(--warn)}' +
'.scard{display:flex;gap:11px;align-items:flex-start;padding:12px;background:rgba(255,107,129,.15);border:1px solid rgba(255,107,129,.3);border-radius:12px}' +
'.scard .ico{width:36px;height:36px;flex:none;border-radius:10px;background:rgba(255,107,129,.2);display:flex;align-items:center;justify-content:center;font-size:16px}' +
'.scard .sb{flex:1;min-width:0}.scard .ttl{font-weight:800;color:var(--tx);font-size:12px;margin-bottom:5px}.scard .it{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--crit);word-break:break-all;line-height:1.5}.scard .it .v{color:var(--warn)}' +
'.detail .body{flex:1;overflow-y:auto;padding:12px 12px 24px;font-size:12px}' +
'.sec{margin-bottom:16px}.sec h4{margin:0 0 8px;font-size:11px;color:var(--tx2);text-transform:uppercase;letter-spacing:.9px;font-weight:700;border-left:2px solid var(--ac);padding-left:8px}' +
'.kv{display:grid;grid-template-columns:120px 1fr;gap:6px 10px;word-break:break-all}.kv .k{color:var(--tx2);font-weight:600}.kv .v{color:var(--tx);font-family:ui-monospace,Menlo,monospace}' +
'pre{background:var(--surf);border:1px solid var(--bd);border-radius:10px;padding:12px;overflow:auto;max-height:260px;margin:0;white-space:pre-wrap;word-break:break-all;color:var(--tx2);font-size:12px;font-family:ui-monospace,Menlo,monospace}' +
'pre.code{background:rgba(12,6,40,.55);color:#e6ddff;line-height:1.6}' +
'.sk{background:var(--surf);border:1px solid var(--bd);border-left:3px solid var(--crit);padding:8px 10px;border-radius:8px;margin-bottom:6px;word-break:break-all}.sk .n{color:var(--crit);font-weight:700}.sk .val{color:var(--warn)}' +
'.empty{text-align:center;color:var(--mut);padding:44px 30px;font-size:13px}' +
'.cpbtn{background:var(--surf);color:var(--tx2);border:1px solid var(--bd);border-radius:8px;padding:7px 11px;font-size:11px;font-weight:600;cursor:pointer;margin:0 6px 6px 0}' +
'.reswrap{padding:12px 12px 28px}' +
'.rsec{margin:0 0 14px;background:var(--surf);border:1px solid var(--bd);border-radius:14px;overflow:hidden}' +
'.rsec .rh{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;color:var(--tx2);font-weight:700;font-size:11px;letter-spacing:.7px;text-transform:uppercase}.rsec .rh.imp2{color:var(--ac)}' +
'.rsec .rh .rcount{background:var(--surf2);color:var(--tx2);border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700}' +
'.ri{padding:11px 14px;border-top:1px solid var(--bd);font-size:11px;word-break:break-all;cursor:pointer;color:var(--tx2);line-height:1.5;font-family:ui-monospace,Menlo,monospace}.ri.imp{color:var(--tx);font-weight:500}.ri.dim{opacity:.4}.ri.copied{background:rgba(62,232,154,.14);color:var(--ok)}' +
'.ri .rtag{float:right;font-size:9px;color:var(--ac);margin-left:8px;font-weight:700}' +
'.hl{background:var(--surf);border-top:1px solid var(--bd);border-left:3px solid var(--ac);padding:10px 12px;font-size:11px;word-break:break-all;color:var(--tx2);line-height:1.5;border-radius:0 8px 8px 0;font-family:ui-monospace,Menlo,monospace}.hl.red{border-left-color:var(--crit)}.hl b{color:var(--ac)}.hl.red b{color:var(--crit)}.hl.orange{border-left-color:#e89a3e}.hl.orange b{color:#e89a3e}' +
'.tiles{display:flex;flex-direction:column;gap:9px;padding:12px}' +
'.tile{display:flex;align-items:center;gap:11px;padding:12px 13px;background:var(--surf);border:1px solid var(--bd);border-radius:14px;cursor:pointer}' +
'.tico{width:38px;height:38px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px;background:var(--surf2)}' +
'.tbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}' +
'.tlabel{font-size:9px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;color:var(--tx2)}' +
'.tval{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--tx);word-break:break-all;line-height:1.35}' +
'.tile.crit{border-color:rgba(255,107,129,.25)}.tile.crit .tico{background:rgba(255,107,129,.14);color:var(--crit)}.tile.crit .tlabel{color:var(--crit)}' +
'.tile.warn .tico{background:rgba(255,209,102,.14);color:var(--warn)}.tile.warn .tlabel{color:var(--warn)}' +
'.tile.ok .tico{background:rgba(62,232,154,.14);color:var(--ok)}' +
'.tile.info .tico{background:rgba(65,200,245,.14);color:var(--info)}' +
'.tile.pii .tico{background:rgba(232,154,62,.18);color:#e89a3e}.tile.pii .tlabel{color:#e89a3e}' +
'.t-key{color:#9cdcfe}.t-str{color:#e8a1bf}.t-num{color:#ffd166}.t-bool{color:#7ee0ff}.t-null{color:#7ee0ff}.t-tag{color:#7ee0ff}.t-attr{color:#9cdcfe}.t-punct{color:#a79ac9}.t-com{color:#8fbf9f;font-style:italic}.t-url{color:#5fe3c8}' +
'.dv{display:flex;height:100%;font-size:12px}' +
'.dv-side{width:150px;flex:none;border-right:1px solid var(--bd);overflow-y:auto}' +
'.dv-side .eh{padding:10px 12px 6px;font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--mut)}' +
'.dv-grp{padding:9px 12px 3px;font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--tx2)}' +
'.dv-file{display:flex;align-items:center;gap:7px;padding:6px 12px;cursor:pointer;color:var(--tx2);white-space:nowrap;overflow:hidden}.dv-file.on{background:var(--acd);color:var(--tx)}' +
'.dv-file .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,Menlo,monospace;font-size:11.5px}' +
'.dv-file .dot{width:7px;height:7px;border-radius:50%;background:var(--crit);flex:none}' +
'.dv-main{flex:1;min-width:0;display:flex;flex-direction:column}' +
'.dv-crumb{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--bd)}' +
'.dv-crumb .cr{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx2);font-size:11px;font-family:ui-monospace,Menlo,monospace}.dv-crumb .cr b{color:var(--tx)}' +
'.dv-crumb input{width:150px;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:8px;padding:6px 10px;font-size:12px}' +
'.dv-code{flex:1;overflow:auto;background:rgba(10,5,34,.6);display:flex}' +
'.dv-gutter{flex:none;margin:0;padding:12px 8px 12px 12px;text-align:right;color:#8a7cc4;background:rgba(10,5,34,.6);border-right:1px solid var(--bd);font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6;white-space:pre;user-select:none}' +
'.dv-src{flex:1;margin:0;padding:12px 14px;white-space:pre;color:#e6ddff;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6}' +
'.dv-find{flex:none;max-height:34%;border-top:1px solid var(--bd);overflow-y:auto}' +
'.dv-find .fh{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--surf2);border-bottom:1px solid var(--bd);font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--tx2)}.dv-find .fh .n{color:var(--crit);font-weight:800}' +
'.dv-fi{display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:1px solid var(--bd);cursor:pointer;font-family:ui-monospace,Menlo,monospace}' +
'.dv-fi .bg{font-size:8.5px;font-weight:800;letter-spacing:.4px;padding:3px 7px;border-radius:5px;flex:none;text-transform:uppercase}.dv-fi .bg.ENDPOINT{background:rgba(62,232,154,.17);color:var(--ok)}.dv-fi .bg.SECRET{background:rgba(255,107,129,.17);color:var(--crit)}.dv-fi .bg.APIKEY{background:rgba(255,209,102,.17);color:var(--warn)}.dv-fi .bg.PII{background:rgba(232,154,62,.18);color:#e89a3e}' +
'.dv-fi .ll{color:var(--mut);font-size:10px;flex:none;min-width:20px}.dv-fi .vv{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx2);font-size:11px}' +
'.dv-status{flex:none;display:flex;align-items:center;gap:12px;padding:7px 12px;background:var(--ac);color:#fff;font-size:10px;font-weight:700}.dv-status .sp{flex:1}' +
'.dv-empty{padding:34px 20px;text-align:center;color:var(--mut);font-size:12px}' +
'mark.hit{background:rgba(255,209,102,.4);color:#fff;border-radius:2px}' +
'mark.imp{background:transparent;color:inherit;border-radius:0;text-decoration:underline;text-decoration-color:var(--ac);text-decoration-thickness:1.5px;text-underline-offset:3px}' +
'mark.impr{text-decoration-color:var(--crit)}' +
'mark.impp{text-decoration-color:#e89a3e}' +
'.impbar{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;border-bottom:1px solid var(--bd)}' +
'.impbar .ic{font-size:10px;font-weight:700;padding:5px 10px;border-radius:99px;border:1px solid var(--bd);color:var(--tx2)}.impbar .ic b{color:var(--ac)}' +
'.rp{padding:6px 0 24px}.rp label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--tx2);margin:14px 0 6px}' +
'.rp textarea,.rp input{width:100%;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px 11px;font-size:12px;font-family:ui-monospace,Menlo,monospace}.rp textarea{resize:vertical}' +
'.rp .row2{display:flex;gap:10px;align-items:flex-end}.rp input.rpm{width:96px}.rp .cbx{font-weight:600;text-transform:none;color:var(--tx2);display:flex;align-items:center;gap:6px;font-size:12px}' +
'.rp .send{background:linear-gradient(135deg,var(--ac),#6366f1);color:#fff;border:none;border-radius:11px;padding:12px 16px;font-weight:800;font-size:13px;cursor:pointer;margin-top:14px;width:100%}' +
'.rp .resp{margin-top:16px}.rst{display:flex;gap:8px;align-items:center;font-size:11px;margin-bottom:10px;flex-wrap:wrap}.rst .b{padding:4px 10px;border-radius:6px;font-weight:800}.rst .b.ok{background:rgba(62,232,154,.14);color:var(--ok)}.rst .b.err{background:rgba(255,107,129,.14);color:var(--crit)}' +
'ins.d{background:rgba(62,232,154,.17);color:var(--ok);text-decoration:none;display:block}del.d{background:rgba(255,107,129,.17);color:var(--crit);text-decoration:none;display:block}' +
'.gql-t{margin:0 0 10px;padding:9px 11px;background:var(--surf);border:1px solid var(--bd);border-radius:10px}.gql-t .tn{color:var(--ac);font-weight:700;font-size:12px;font-family:ui-monospace,Menlo,monospace}' +
'.gql-f{padding:4px 0 4px 12px;font-size:11px;color:var(--tx2);font-family:ui-monospace,Menlo,monospace;word-break:break-all}.gql-f .fn{color:var(--tx);font-weight:600}.gql-f .ft{color:var(--warn)}' +
'.srcwrap{display:flex;flex-direction:column;height:100%}.srcbar{display:flex;gap:8px;padding:10px 12px;border-bottom:1px solid var(--bd);align-items:center}.srcbar input{flex:1;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:8px 11px;font-size:13px}.srcbar .cnt{font-size:10px;color:var(--mut);white-space:nowrap;font-weight:600}.srcbody{flex:1;overflow-y:auto}' +
'.srccode{margin:0;padding:12px;font-size:11.5px;line-height:1.55;white-space:pre-wrap;word-break:break-all;overflow:auto;font-family:ui-monospace,Menlo,monospace;background:rgba(10,5,34,.6);color:#e6ddff}' +
'.pg{padding:12px 12px 30px;display:flex;flex-direction:column;gap:10px}' +
'.pg-bar{display:flex;gap:8px}' +
'.pg-bar select{background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:10px;padding:9px 8px;font-weight:800;font-size:13px;flex:none}' +
'.pg-bar input{flex:1;min-width:0;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:10px;padding:9px 12px;font-size:13px;font-family:ui-monospace,Menlo,monospace}' +
'.pg-send{background:linear-gradient(135deg,var(--ac),#6366f1);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-weight:800;font-size:13px;cursor:pointer;flex:none}' +
'.pg-toks{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
'.pg-lbl{font-size:11px;font-weight:800;color:var(--tx2);text-transform:uppercase;letter-spacing:.6px}' +
'.pg-tk{font-size:11px;padding:5px 11px;border-radius:99px;background:rgba(255,209,102,.14);color:var(--warn);cursor:pointer;font-weight:700;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
'.pg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
'@media(max-width:640px){.pg-grid{grid-template-columns:1fr}}' +
'.pg label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--tx2);margin:0 0 5px}' +
'.pg textarea{width:100%;background:var(--surf);border:1px solid var(--bd);color:var(--tx);border-radius:10px;padding:9px 10px;font-family:ui-monospace,Menlo,monospace;font-size:12px;resize:vertical}' +
'.pg-tools{display:flex;gap:10px;align-items:center;margin-top:6px}' +
'.pg-cbx{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tx2);font-weight:600}' +
'.rimggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;padding:12px}' +
'.rimggrid img{width:100%;height:82px;object-fit:cover;border-radius:10px;border:1px solid var(--bd);background:var(--surf2);cursor:pointer}' +
'.dlbtn{flex:none;background:var(--surf);border:1px solid var(--bd);color:var(--tx2);border-radius:7px;padding:3px 8px;font-size:11px;cursor:pointer;font-weight:700;line-height:1.4}.dlbtn:hover{background:var(--acd);color:var(--ac);border-color:var(--ac)}.dlbtn.wide{width:100%;padding:8px 10px;font-size:12px}' +
'.dv-tools{padding:6px 8px;border-bottom:1px solid var(--bd)}' +
'.dlok{color:var(--ok);font-weight:800;flex:none;margin-left:4px}' +
'.fbadge{flex:none;background:rgba(255,107,129,.15);color:var(--crit);border:1px solid rgba(255,107,129,.3);font-size:10px;font-weight:800;border-radius:8px;padding:0 6px;margin-left:6px}' +
'.dv-file{align-items:center;gap:8px}.dv-file .nm{flex:1;min-width:0}' +
'.dv-crumb .dlbtn{margin-right:8px}' +
'.prevmark{color:var(--violet);font-size:11px;flex:none}' +
'.cpico{float:right;margin-left:10px;font-size:13px;opacity:.5;cursor:pointer;padding:1px 5px;border-radius:6px}' +
'.list::-webkit-scrollbar,.detail .body::-webkit-scrollbar,pre::-webkit-scrollbar{width:8px;height:8px}.list::-webkit-scrollbar-thumb,.detail .body::-webkit-scrollbar-thumb,pre::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:8px}' +
'.tabs::-webkit-scrollbar,.hd::-webkit-scrollbar{height:0}' +
'.panel.light{--pbg:linear-gradient(170deg,rgba(248,251,255,.95) 0%,rgba(239,245,255,.93) 55%,rgba(236,244,255,.95) 100%);--surf:rgba(255,255,255,.75);--surf2:#e8f1fb;--bd:rgba(30,64,120,.14);--bd2:rgba(30,64,120,.24);--tx:#0f1c33;--tx2:#43557a;--mut:#7a8db0;--ac:#0284c7;--acd:rgba(2,132,199,.1)}' +
'</style>' +
'<button class="fab" title="NexusScope Pro · Creado por David Zuniga · Editado y mejorado por José">' + nexusSVG(30) + '<span class="badge">0</span></button>' +
'<div class="panel">' +
'<div class="grip"></div>' +
'<div class="hd"><span class="brand">' + nexusSVG(18) + 'NexusScope <span style="font-weight:600;color:var(--mut);font-size:10px;letter-spacing:.5px;text-transform:none">Pro v9.0 · por David Zuniga &amp; José</span></span><span class="sp"></span>' +
'<button data-act="pause">⏸</button><button data-act="export">JSON</button><button data-act="plan">MD</button><button data-act="theme">🌓</button><button data-act="clear">Clear</button><button data-act="close">✕</button></div>' +
'<div class="stat"></div>' +
'<div class="tabs"></div>' +
'<div class="toolbar"><input type="text" placeholder="filtrar url / método / tag…" class="flt"><label><input type="checkbox" class="hidenoise" checked>ruido</label></div>' +
'<div class="list"><div class="empty">Esperando tráfico…</div></div>' +
'<div class="detail"><div class="dh"><button class="cpbtn dback" data-act="back">‹</button><span class="dtitle"></span></div><div class="body"></div></div>' +
'</div>';

    (function () {
      var mm = __html.match(/^<style>([\s\S]*?)<\/style>([\s\S]*)$/);
      var CSS = mm ? mm[1] : "", MK = mm ? mm[2] : __html;
      root.innerHTML = MK;
      var applied = false;
      try { if (root.adoptedStyleSheets !== undefined && typeof CSSStyleSheet === "function") { var sh = new CSSStyleSheet(); sh.replaceSync(CSS); root.adoptedStyleSheets = (root.adoptedStyleSheets || []).concat(sh); applied = true; } } catch (e) {}
      if (!applied && CSS) { try { var st = document.createElement("style"); st.textContent = CSS; (root.insertBefore ? root : host).insertBefore(st, root.firstChild || null); } catch (e2) {} }
    })();

    var $ = function (s) { return root.querySelector(s); };
    var fab = $(".fab"), panel = $(".panel"), tabsEl = $(".tabs"), listEl = $(".list");
    var fltEl = $(".flt"), hideNoiseEl = $(".hidenoise"), detailEl = $(".detail"), badge = $(".fab .badge"), statEl = $(".stat");
    var activeTab = "all", query = "", lastFlows = [], paused = false, pausedNew = 0;
    var _rep = null, _repAt = 0;
    function cachedReport() { var now = Date.now(); if (!_rep || now - _repAt > 1400) { _rep = window.__snifffer.report(); _repAt = now; } return _rep; }
    function invalidateReport() { _rep = null; _repAt = 0; }

    tabsEl.innerHTML = TABS.map(function (t) { return '<div class="tab' + (t.id === "all" ? " active" : "") + '" data-tab="' + t.id + '">' + t.label + '<span class="c" data-count="' + t.id + '">0</span></div>'; }).join("");

    function curTab() { for (var i = 0; i < TABS.length; i++) if (TABS[i].id === activeTab) return TABS[i]; return TABS[0]; }
    function qMatch(e) { if (!query) return true; var q = query.toLowerCase(); return (e.url || "").toLowerCase().indexOf(q) >= 0 || (e.method || "").toLowerCase().indexOf(q) >= 0 || (e.tags || []).join(" ").toLowerCase().indexOf(q) >= 0; }
    function visible(e) { return curTab().match(e) && qMatch(e) && !(hideNoiseEl.checked && e.tags.indexOf("NOISE") >= 0 && e.tags.indexOf("SECRET") < 0); }
    var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var escA = function (s) { return esc(s).replace(/"/g, "&quot;"); };

    function rowHTML(e) {
      var st = e.pending ? '<span class="st pend">···</span>' : '<span class="st ' + (e.status >= 400 || e.error ? "err" : e.status ? "ok" : "") + '">' + (e.status || (e.passive ? "·" : "")) + '</span>';
      var tg = (e.tags || []).filter(function (t) { return t !== "NOISE" || e.tags.length === 1; }).slice(0, 4);
      var chips = tg.map(function (t) { return '<span class="chip ' + t + '">' + t + '</span>'; }).join("");
      var dom = "", path = e.url;
      try { var u = new URL(e.url); path = u.pathname + u.search; if (u.host !== location.host) dom = u.host; } catch (x) {}
      var prev = e.restored ? '<span class="prevmark" title="capturado antes">⏮</span>' : '';
      var uHtml = (dom ? '<span class="dom">' + esc(dom) + '</span> ' : '') + '<span class="pth">' + esc((path || "").slice(0, 200)) + '</span>';
      return '<div class="row ' + (e.tags.indexOf("NOISE") >= 0 ? "noise" : "") + '" data-id="' + e.id + '">' + prev + '<span class="m ' + e.method + '">' + e.method + '</span>' + st + '<span class="u" title="' + (e.url || "").replace(/"/g, "&quot;") + '">' + uHtml + '</span><span class="tg">' + chips + '</span></div>';
    }

    var _skCount = 0, _skAt = 0;
    function cachedSitekeyCount() { var now = Date.now(); if (now - _skAt > 2000) { _skAt = now; try { _skCount = collectSitekeys().length; } catch (e) {} } return _skCount; }
    var _tokList = null, _tkListAt = 0;
    function cachedTokens() { var now = Date.now(); if (!_tokList || now - _tkListAt > 2500) { _tkListAt = now; try { _tokList = collectTokens(); } catch (e) { _tokList = []; } } return _tokList; }
    var _tkCount = 0, _tkCountAt = 0;
    function cachedTokenCount() { var now = Date.now(); if (now - _tkCountAt > 2500) { _tkCountAt = now; try { _tkCount = collectTokens().length; } catch (e) {} } return _tkCount; }
    function counts() {
      TABS.forEach(function (t) {
        var n;
        if (t.id === "cookie") n = cookieIntel().length;
        else if (t.id === "store") n = storageIntel().length;
        else if (t.id === "source") n = listSourceFiles().length;
        else if (t.id === "html" || t.id === "play" || t.id === "security" || t.id === "fingerprint" || t.id === "cors" || t.id === "ssrf" || t.id === "runtime") n = "";
        else if (t.id === "tokens") n = cachedTokenCount();
        else { n = 0; for (var i = 0; i < store.entries.length; i++) if (t.match(store.entries[i])) n++; }
        var el = tabsEl.querySelector('[data-count="' + t.id + '"]'); if (el) el.textContent = n > 999 ? "999+" : n;
      });
      badge.textContent = store.entries.length > 999 ? "999+" : store.entries.length;
      var nSec = 0, nApi = 0, nTun = 0, nCap = 0, nAb = 0, nPii = 0;
      for (var i = 0; i < store.entries.length; i++) { var e = store.entries[i]; if (e.tags.indexOf("SECRET") >= 0) nSec++; if (e.tags.indexOf("API") >= 0 && e.tags.indexOf("NOISE") < 0) nApi++; if (e.tags.indexOf("TUNNEL") >= 0) nTun++; if (e.tags.indexOf("CAPTCHA") >= 0) nCap++; if (e.tags.indexOf("ANTIBOT") >= 0) nAb++; if (e.tags.indexOf("PII") >= 0) nPii++; }
      if (statEl) statEl.innerHTML = '<span><b>' + store.entries.length + '</b> reqs</span><span><b>' + nApi + '</b> APIs</span><span><b>' + nSec + '</b> secrets</span><span><b>' + cachedTokenCount() + '</b> tokens</span><span><b>' + nPii + '</b> PII</span><span><b>' + nAb + '</b> antibot</span><span><b>' + nCap + '</b> captcha</span><span><b>' + nTun + '</b> tunnels</span><span><b>' + cachedSitekeyCount() + '</b> sitekeys</span>';
    }

    function renderCookies() {
      var cs = cookieIntel();
      if (!cs.length) return '<div class="empty">Sin cookies visibles (httpOnly no se ven desde JS).</div>';
      return cs.map(function (c) { var chips = (c.isJWT ? '<span class="chip JWT">JWT</span>' : '') + (c.isAuth ? '<span class="chip AUTH">AUTH</span>' : ''); return '<div class="row kvrow" data-name="' + escA(c.name) + '" data-full="' + escA(c.value) + '" data-jwt="' + (c.isJWT ? 1 : 0) + '"><span class="m CK">CK</span><span class="u">' + esc(c.name) + ' = ' + esc(String(c.value).slice(0, 60)) + '</span><span class="tg">' + chips + '</span></div>'; }).join("");
    }
    function renderStorage() {
      var ss = storageIntel();
      if (!ss.length) return '<div class="empty">Storage vacío.</div>';
      return ss.map(function (c) { var chips = '<span class="chip CDN">' + (c.type === "localStorage" ? "LS" : "SS") + '</span>' + (c.isJWT ? '<span class="chip JWT">JWT</span>' : '') + (c.isAuth ? '<span class="chip AUTH">AUTH</span>' : ''); return '<div class="row kvrow" data-name="' + escA(c.type + " · " + c.key) + '" data-full="' + escA(c.value) + '" data-jwt="' + (c.isJWT ? 1 : 0) + '"><span class="m CK">▪</span><span class="u">' + esc(c.key) + ' = ' + esc(String(c.value).slice(0, 60)) + '</span><span class="tg">' + chips + '</span></div>'; }).join("");
    }
    function decodeJWT(t) {
      try {
        var p = (t || "").split("."); if (p.length < 2) return null;
        function d(x) { x = x.replace(/-/g, "+").replace(/_/g, "/"); while (x.length % 4) x += "="; return decodeURIComponent(escape(atob(x))); }
        var head = JSON.parse(d(p[0])), pay = JSON.parse(d(p[1])), out = "HEADER:\n" + JSON.stringify(head, null, 2) + "\n\nPAYLOAD:\n" + JSON.stringify(pay, null, 2);
        if (pay.exp) out += "\n\n⏰ expira: " + new Date(pay.exp * 1000).toISOString();
        return out;
      } catch (e) { return null; }
    }
    function isJWTv(v) { return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(v || ""); }
    function openKVView(name, value, isJWT) {
      $(".dtitle").textContent = "🔑 " + String(name).slice(0, 44);
      var body = detailEl.querySelector(".body"), b = "";
      b += '<div class="sec"><h4>Nombre</h4><pre>' + esc(name) + '</pre></div>';
      b += '<div class="sec"><h4>Valor (' + value.length + ' chars)</h4><button class="cpbtn" data-cp="v">Copiar valor</button><pre class="code" style="max-height:42vh">' + hl(value, "") + '</pre></div>';
      if (isJWT || isJWTv(value)) { var dec = decodeJWT(value); if (dec) b += '<div class="sec"><h4>🔓 JWT decodificado</h4><pre class="code">' + highlightJSON(dec) + '</pre></div>'; }
      var sec = scanSecrets(value, "value"); if (sec.length) b += '<div class="sec"><h4>🔐 Secrets dentro</h4>' + sec.map(function (s) { return '<div class="sk"><span class="n">' + esc(s.name) + '</span> · <span class="val">' + esc(s.value) + '</span></div>'; }).join("") + '</div>';
      body.innerHTML = b;
      var cp = body.querySelector('[data-cp="v"]'); if (cp) cp.addEventListener("click", function () { copy(value, cp, "Copiar valor"); });
      detailEl.classList.add("open");
    }
    function renderCaptcha() {
      var rep = cachedReport(), cap = rep.captcha || { widgets: [], tokens: [], sitekeys: [], allDetections: [] };
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🧩 Captchas detectados</span><span class="rcount">' + cap.widgets.length + '</span></div>';
      if (cap.widgets.length) cap.widgets.forEach(function (w) { h += '<div class="ri">🧩 <b style="color:var(--ac)">' + esc(w.type) + '</b>' + (w.sitekey ? ' · sitekey: ' + esc(w.sitekey) : '') + '</div>'; });
      else h += '<div class="ri dim" style="padding:12px">Sin widgets todavía.</div>';
      h += '</div>';
      if (cap.allDetections && cap.allDetections.length) {
        h += '<div class="rsec"><div class="rh imp2"><span>🎯 Detecciones en red</span><span class="rcount">' + cap.allDetections.length + '</span></div>';
        cap.allDetections.slice(0, 60).forEach(function (d) { h += '<div class="ri imp" data-copy="' + escA(d.url) + '"><b style="color:var(--ac)">' + esc(d.kind) + '</b>' + (d.sitekey ? ' <span style="color:var(--warn)">' + esc(d.sitekey) + '</span>' : '') + ' <span class="rtag">' + esc(d.url.slice(0, 60)) + '</span></div>'; });
        h += '</div>';
      }
      h += '<div class="rsec"><div class="rh imp2"><span>🎟️ Tokens capturados</span><span class="rcount">' + cap.tokens.length + '</span></div>';
      if (cap.tokens.length) cap.tokens.forEach(function (t) { h += '<div class="ri imp" data-copy="' + escA(t.token) + '"><b style="color:var(--ac)">' + esc(t.type) + '</b> <span class="rtag">' + t.token.length + ' chars</span><br>' + esc(t.token.slice(0, 140)) + '</div>'; });
      else h += '<div class="ri dim" style="padding:12px">Sin tokens aún.</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>🔑 Sitekeys</span><span class="rcount">' + cap.sitekeys.length + '</span></div>';
      if (cap.sitekeys.length) cap.sitekeys.forEach(function (k) { h += '<div class="ri imp" data-copy="' + escA(k.key) + '"><b>' + esc(k.type) + '</b>: ' + esc(k.key) + ' <span class="rtag">' + esc(k.source || "") + '</span></div>'; });
      else h += '<div class="ri dim">—</div>';
      h += '</div></div>';
      return h;
    }
    function renderAntibot() {
      var rep = cachedReport(), ab = rep.antibots || [], eps = (rep.endpoints || {}).antibot || [];
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🛡️ Sistemas anti-bot detectados</span><span class="rcount">' + ab.length + '</span></div>';
      if (ab.length) ab.forEach(function (a) { h += '<div class="hl red"><b>' + esc(a.vendor) + '</b> — ' + esc(a.name) + ' <span class="rtag">' + esc(a.severity) + '</span></div>'; });
      else h += '<div class="ri dim" style="padding:12px">Sin sistemas de protección.</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>📡 Endpoints marcados</span><span class="rcount">' + eps.length + '</span></div>';
      if (eps.length) eps.slice(0, 80).forEach(function (e) { var vendors = (e.antibot || []).map(function (a) { return a.vendor; }).join(", "); h += '<div class="ri imp" data-copy="' + escA(e.url) + '"><b>' + esc(e.method) + '</b> ' + esc(e.url.slice(0, 80)) + ' <span class="rtag">' + esc(vendors) + '</span></div>'; });
      else h += '<div class="ri dim">—</div>';
      h += '</div></div>';
      return h;
    }
    function renderSecurity() {
      var rep = cachedReport();
      var issues = rep.securityIssues || [], flags = rep.securityFlags || [];
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>⚠️ Cabeceras débiles / ausentes</span><span class="rcount">' + issues.length + '</span></div>';
      if (issues.length) issues.slice(0, 100).forEach(function (x) { h += '<div class="hl orange"><b>[' + esc(x.severity) + '] ' + esc(x.label) + '</b> (' + esc(x.name) + '): ' + esc(x.msg) + ' <span class="rtag">' + esc(String(x.url || "").slice(0, 60)) + '</span></div>'; });
      else h += '<div class="ri dim">—</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh imp2"><span>🚩 Flags de seguridad</span><span class="rcount">' + flags.length + '</span></div>';
      if (flags.length) flags.slice(0, 100).forEach(function (x) { h += '<div class="hl"><b>[' + esc(x.severity) + '] ' + esc(x.label) + '</b> — ' + esc(String(x.value).slice(0, 120)) + ' <span class="rtag">' + esc(String(x.url || "").slice(0, 60)) + '</span></div>'; });
      else h += '<div class="ri dim">—</div>';
      h += '</div></div>';
      return h;
    }
    function renderFingerprintTab() {
      var rep = cachedReport();
      var fp = rep.fingerprint || {}, fp2 = rep.fingerprint_v7 || {};
      var caps = fp.capabilities || {}, webrtc = fp.webrtc || {};
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🔬 Capacidades del navegador</span><span class="rcount">' + Object.keys(caps).length + '</span></div>';
      h += Object.keys(caps).map(function (k) { return '<div class="ri ' + (caps[k] ? 'imp' : 'dim') + '">' + (caps[k] ? '✅' : '❌') + ' <b>' + esc(k) + '</b></div>'; }).join("");
      h += '</div>';
      h += '<div class="rsec"><div class="rh imp2"><span>📡 WebRTC ICE Candidates</span><span class="rcount">' + ((webrtc.candidates || []).length) + '</span></div>';
      if (webrtc && webrtc.candidates && webrtc.candidates.length) webrtc.candidates.forEach(function (c) { h += '<div class="ri imp" data-copy="' + escA(c) + '">🌐 ' + esc(c) + '</div>'; });
      else h += '<div class="ri dim">Sin leak o bloqueado.</div>';
      h += '</div>';
      var aid = fp2.analyticsIDs || {};
      h += '<div class="rsec"><div class="rh imp2"><span>📊 Analytics / pixels IDs</span><span class="rcount">' + Object.keys(aid).length + '</span></div>';
      var ak = Object.keys(aid);
      if (ak.length) ak.forEach(function (k) { var ids = aid[k] || []; if (ids.length) h += '<div class="ri imp" data-copy="' + escA(ids.join(", ")) + '"><b>' + esc(k) + '</b>: ' + esc(ids.join(", ").slice(0, 200)) + '</div>'; });
      else h += '<div class="ri dim">—</div>';
      h += '</div>';
      var tp = fp2.trackingPixels || [];
      h += '<div class="rsec"><div class="rh"><span>📸 Tracking pixels 1x1</span><span class="rcount">' + tp.length + '</span></div>';
      h += tp.length ? tp.map(function (p) { return '<div class="ri imp" data-copy="' + escA(p.src) + '">' + esc(p.src.slice(0, 140)) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      var sr = fp2.sessionReplay || [];
      h += '<div class="rsec"><div class="rh imp2"><span>🎥 Session replay / fingerprinting</span><span class="rcount">' + sr.length + '</span></div>';
      h += sr.length ? sr.map(function (x) { return '<div class="hl red"><b>' + esc(x) + '</b></div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      var jl = fp2.jsonld || [];
      if (jl.length) h += '<div class="rsec"><div class="rh"><span>🗂️ JSON-LD (' + jl.length + ')</span></div>' + jl.map(function (o) { return '<div class="ri imp" data-copy="' + escA(JSON.stringify(o)) + '">' + esc(JSON.stringify(o).slice(0, 200)) + '</div>'; }).join("") + '</div>';
      var og = fp2.openGraph || {};
      if (Object.keys(og).length) h += '<div class="rsec"><div class="rh"><span>🏷️ OpenGraph / Twitter cards</span></div>' + Object.keys(og).map(function (k) { return '<div class="ri"><b>' + esc(k) + '</b>: ' + esc(String(og[k]).slice(0, 120)) + '</div>'; }).join("") + '</div>';
      h += '</div>';
      return h;
    }
    function renderCORSTab() {
      var rep = cachedReport();
      var cors = (rep.securityExtra || {}).cors || [];
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🛡️ Endpoints con CORS</span><span class="rcount">' + cors.length + '</span></div>';
      if (cors.length) cors.forEach(function (c) { var cls = c.danger ? "hl red" : (c.wildcard ? "hl orange" : "hl"); h += '<div class="' + cls + '" data-copy="' + escA(c.url) + '"><b>' + esc(c.acao) + '</b>' + (c.acac ? ' · credentials=' + esc(c.acac) : '') + (c.danger ? ' ⚠️ <b>PELIGROSO</b>' : '') + '<br><span style="color:var(--mut)">' + esc(c.url.slice(0, 130)) + '</span></div>'; });
      else h += '<div class="ri dim">Sin endpoints CORS.</div>';
      h += '</div></div>';
      return h;
    }
    function renderSSRFTab() {
      var rep = cachedReport();
      var ssrf = (rep.securityExtra || {}).ssrf || [], redirects = (rep.securityExtra || {}).redirects || [];
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🎯 Posibles SSRF / Open Redirect</span><span class="rcount">' + ssrf.length + '</span></div>';
      if (ssrf.length) ssrf.forEach(function (s) { h += '<div class="hl red" data-copy="' + escA(s.url) + '"><b>' + esc(s.param) + '</b> = <span style="color:var(--warn)">' + esc(s.value) + '</span><br><span style="color:var(--mut)">' + esc(s.url.slice(0, 130)) + '</span></div>'; });
      else h += '<div class="ri dim">Nada detectado.</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>↪️ Redirects</span><span class="rcount">' + redirects.length + '</span></div>';
      h += redirects.length ? redirects.slice(0, 60).map(function (r) { return '<div class="ri imp">' + esc(String(r.status)) + ': ' + esc(r.from.slice(0, 60)) + ' → ' + esc(r.to.slice(0, 80)) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div></div>';
      return h;
    }
    function renderRuntimeTab() {
      var rep = cachedReport();
      var rt = rep.runtime || {};
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>⚙️ Web Workers</span><span class="rcount">' + ((rt.workers || []).length) + '</span></div>';
      h += (rt.workers || []).length ? rt.workers.map(function (w) { return '<div class="ri imp" data-copy="' + escA(w.url) + '"><b>' + esc(w.type) + '</b> ' + esc(w.url) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>📡 Server-Sent Events</span><span class="rcount">' + ((rt.sse || []).length) + '</span></div>';
      h += (rt.sse || []).length ? rt.sse.map(function (u) { return '<div class="ri imp" data-copy="' + escA(u) + '">' + esc(u) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>📢 BroadcastChannel</span><span class="rcount">' + ((rt.broadcast || []).length) + '</span></div>';
      h += (rt.broadcast || []).length ? rt.broadcast.slice(-40).map(function (b) { return '<div class="ri imp">' + esc(b.dir) + ' <b>' + esc(b.name) + '</b>: ' + esc(String(b.data).slice(0, 120)) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      h += '<div class="rsec"><div class="rh"><span>🧪 Crypto runtime ops</span><span class="rcount">' + ((rt.cryptoRuntime || []).length) + '</span></div>';
      h += (rt.cryptoRuntime || []).length ? rt.cryptoRuntime.slice(-40).map(function (c) { return '<div class="ri" style="color:var(--violet)">' + esc(c.op) + ' · ' + esc(c.alg) + '</div>'; }).join("") : '<div class="ri dim">—</div>';
      h += '</div>';
      var perf = rt.perf || {};
      if (perf.total != null) {
        h += '<div class="rsec"><div class="rh"><span>⚡ Performance</span></div>';
        h += '<div class="ri"><b>Recursos:</b> ' + perf.total + ' totales</div>';
        if (perf.byType) Object.keys(perf.byType).forEach(function (k) { h += '<div class="ri">' + esc(k) + ': ' + perf.byType[k] + '</div>'; });
        if (perf.largestContentfulPaint) h += '<div class="ri">LCP: ' + Math.round(perf.largestContentfulPaint) + ' ms</div>';
        if (perf.cumulativeLayoutShift) h += '<div class="ri">CLS: ' + perf.cumulativeLayoutShift + '</div>';
        h += '</div>';
      }
      var cs = rt.cacheStorage || [];
      if (cs.length) {
        h += '<div class="rsec"><div class="rh imp2"><span>💾 Cache Storage</span><span class="rcount">' + cs.length + '</span></div>';
        cs.forEach(function (c) { h += '<div class="ri imp"><b>' + esc(c.name) + '</b> · ' + c.entries.length + ' entries</div>'; c.entries.slice(0, 5).forEach(function (e) { h += '<div class="ri" style="padding-left:24px;font-size:10px" data-copy="' + escA(e.url) + '">' + esc(e.url.slice(0, 100)) + '</div>'; }); });
        h += '</div>';
      }
      var idb = rt.indexedDBDetail || [];
      if (idb.length) {
        h += '<div class="rsec"><div class="rh"><span>🗃️ IndexedDB detalle</span><span class="rcount">' + idb.length + '</span></div>';
        idb.forEach(function (d) { h += '<div class="ri imp"><b>' + esc(d.name) + '</b> (v' + d.version + ')<br>stores: ' + esc((d.stores || []).join(", ")) + '</div>'; });
        h += '</div>';
      }
      h += '</div>';
      return h;
    }

    var srcState = { entries: [], current: null, downloaded: {} };
    function sourceEntries() {
      var e = [];
      var htmlName = (location.pathname.split("/").filter(Boolean).pop() || "index.html"); if (!/\./.test(htmlName)) htmlName = "index.html";
      e.push({ id: "__html", name: htmlName, type: "html", group: "PAGE", same: 1 });
      listSourceFiles().forEach(function (f) { e.push({ id: f.url, url: f.url, name: f.name, type: f.type, group: f.type === "css" ? "STYLES" : f.type === "map" ? "SOURCE MAPS" : "SCRIPTS", same: f.same }); });
      try { (deepData.jsFiles || []).forEach(function (jf) { var dup = false; for (var q = 0; q < e.length; q++) { if (e[q].id === jf.url) { dup = true; e[q].found = jf.found; e[q].size = jf.size; break; } } if (!dup) e.push({ id: jf.url, url: jf.url, name: jf.name, type: "js", group: "SCRIPTS", same: sameOrigin(jf.url), found: jf.found, size: jf.size }); }); } catch (x) {}
      (typeof swData !== "undefined" ? swData : []).forEach(function (u) { e.push({ id: u, url: u, name: (u.split(/[?#]/)[0].split("/").pop() || "sw.js"), type: "js", group: "WORKERS", same: sameOrigin(u) }); });
      return e;
    }
    function getSourceText(entry) {
      return new Promise(function (res) {
        if (entry.id === "__html") { try { res(document.documentElement.outerHTML); } catch (e) { res(null); } return; }
        fetchSource(entry.url).then(res);
      });
    }
    function computeFindings(text) {
      var out = [], seen = {}, body = text.slice(0, 300000);
      scanSecrets(body, "src").forEach(function (s) { var k = "S|" + s.value; if (seen[k]) return; seen[k] = 1; var p = body.indexOf(s.value), li = p >= 0 ? body.slice(0, p).split("\n").length : 1; out.push({ kind: /api|key|bearer|token/i.test(s.name) ? "APIKEY" : "SECRET", line: li, value: s.value.slice(0, 100), pname: s.name }); });
      scanPII(body, "src").forEach(function (s) { var k = "P|" + s.value; if (seen[k]) return; seen[k] = 1; var p = body.indexOf(s.value), li = p >= 0 ? body.slice(0, p).split("\n").length : 1; out.push({ kind: "PII", line: li, value: s.value.slice(0, 100), pname: s.name }); });
      var re = /https?:\/\/[^\s"'`<>()]+|["'`](\/[a-zA-Z0-9_\-./]{3,}(?:\?[^"'`<>\s]*)?)["'`]/g, m;
      while ((m = re.exec(body)) !== null && out.length < 260) {
        var u = (m[1] || m[0]).replace(/^["'`]|["'`]$/g, "");
        if (!/^https?:/.test(u) && !API_PATH_RE.test(u)) continue;
        var k2 = "E|" + u; if (seen[k2]) continue; seen[k2] = 1;
        out.push({ kind: "ENDPOINT", line: body.slice(0, m.index).split("\n").length, value: u.slice(0, 120) });
      }
      out.sort(function (a, b) { return a.line - b.line; });
      return out.slice(0, 260);
    }
    function markSourceFindings(highlighted, findings) {
      try { findings.forEach(function (f) { var e = esc(f.value); if (!e || highlighted.indexOf(e) < 0) return; var cls = f.kind === "ENDPOINT" ? "imp" : f.kind === "PII" ? "imp impp" : "imp impr"; highlighted = highlighted.split(e).join('<mark class="' + cls + '">' + e + '</mark>'); }); } catch (x) {}
      return highlighted;
    }
    function renderSourceTab() {
      var entries = srcState.entries = sourceEntries();
      var groups = ["PAGE", "SCRIPTS", "STYLES", "SOURCE MAPS", "WORKERS"], side = '<div class="eh">Explorer</div>';
      side += '<div class="dv-tools"><button class="dlbtn wide" data-dlall="1">⬇ Descargar todo (' + entries.length + ')</button></div>';
      groups.forEach(function (g) {
        var fs = entries.filter(function (e) { return e.group === g; });
        if (!fs.length) return;
        side += '<div class="dv-grp">' + g + ' · ' + fs.length + '</div>';
        fs.forEach(function (f) {
          var ext = (f.name.split("?")[0].split(".").pop() || "").toLowerCase();
          var ico = f.type === "css" ? "🎨" : f.type === "map" ? "🗺" : /^(ts|tsx)$/.test(ext) ? "🔷" : /^jsx$/.test(ext) ? "⚛️" : /^(mjs|cjs)$/.test(ext) ? "📦" : f.type === "js" ? "📜" : "📄";
          var check = srcState.downloaded[f.id] ? '<span class="dlok" title="descargado">✓</span>' : '';
          var found = f.found ? '<span class="fbadge" title="hallazgos">' + f.found + '</span>' : '';
          side += '<div class="dv-file" data-srcfile="' + escA(f.id) + '"><span class="fi">' + ico + '</span><span class="nm">' + esc(f.name) + '</span>' + found + check + '<button class="dlbtn" data-dl="' + escA(f.id) + '" title="Descargar ' + escA(f.name) + '">⬇</button><span class="dot" hidden></span></div>';
        });
      });
      listEl.innerHTML = '<div class="dv"><div class="dv-side">' + side + '</div><div class="dv-main"><div class="dv-empty">Selecciona un archivo ←</div></div></div>';
      entries.forEach(function (f) { if (f.same) getSourceText(f).then(function (t) { if (t && computeFindings(t).length) { var fl = listEl.querySelectorAll(".dv-file"); for (var i = 0; i < fl.length; i++) if (fl[i].getAttribute("data-srcfile") === f.id) { var d = fl[i].querySelector(".dot"); if (d) d.hidden = false; } } }); });
      if (entries[0]) loadSourceFile(entries[0].id);
    }
    function downloadSourceFile(id) {
      var entry = null; for (var i = 0; i < srcState.entries.length; i++) if (srcState.entries[i].id === id) entry = srcState.entries[i];
      if (!entry) return;
      getSourceText(entry).then(function (txt) {
        if (txt == null) { openLink(entry.url); return; }
        srcState.downloaded[entry.id] = 1;
        var blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = entry.name || "source.txt"; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        var fl = listEl.querySelectorAll(".dv-file"); for (var i = 0; i < fl.length; i++) {
          if (fl[i].getAttribute("data-srcfile") === id && !fl[i].querySelector(".dlok")) {
            var s2 = document.createElement("span"); s2.className = "dlok"; s2.title = "descargado"; s2.textContent = "✓";
            var b = fl[i].querySelector(".dlbtn"); fl[i].insertBefore(s2, b);
          }
        }
      });
    }
    function downloadAllSources() {
      var list = srcState.entries.slice(), i = 0;
      (function nx() { if (i >= list.length) return; downloadSourceFile(list[i++].id); setTimeout(nx, 650); })();
    }
    function renderSourceEditor(main, entry, txt) {
      var full = txt.slice(0, 400000), findings = computeFindings(full);
      var lang = entry.type === "css" ? "CSS" : entry.type === "html" ? "HTML" : "JavaScript";
      var chost = ""; try { chost = new URL(entry.url || location.href).host; } catch (e) { chost = location.host; }
      main.innerHTML =
        '<div class="dv-crumb"><span class="cr">' + esc(chost) + ' › <b>' + esc(entry.name) + '</b></span><button class="dlbtn" data-dl="' + escA(entry.id) + '" title="Descargar archivo">⬇ ' + esc(entry.name.slice(0, 24)) + '</button><input type="text" class="dvq" placeholder="🔎 buscar…"></div>' +
        '<div class="dv-code"><pre class="dv-gutter"></pre><pre class="dv-src"></pre></div>' +
        '<div class="dv-find"><div class="fh"><span>Findings</span><span class="n">' + findings.length + '</span></div><div class="dv-flist">' +
          (findings.map(function (f) { return '<div class="dv-fi" data-fline="' + f.line + '"><span class="bg ' + f.kind + '">' + f.kind + '</span><span class="ll">L' + f.line + '</span><span class="vv">' + esc(f.pname ? (f.pname + ' · ' + f.value) : f.value) + '</span></div>'; }).join("") || '<div class="dv-empty" style="padding:16px">Sin hallazgos.</div>') +
        '</div></div>' +
        '<div class="dv-status"><span>' + lang + '</span><span>' + full.split("\n").length + ' líneas</span><span class="sp"></span><span>' + findings.length + ' findings</span></div>';
      var gutterEl = main.querySelector(".dv-gutter"), srcEl = main.querySelector(".dv-src");
      var nLines = full.split("\n").length, g = ""; for (var i = 1; i <= nLines && i <= 60000; i++) g += i + "\n";
      gutterEl.textContent = g;
      function draw(query) {
        var code = entry.type === "html" ? highlightHTML(full) : entry.type === "css" ? highlightGeneric(full) : hl(full, "js");
        code = markSourceFindings(code, findings);
        if (query) code = markHits(code, query);
        srcEl.innerHTML = code;
        if (query) { try { var mk = srcEl.querySelector("mark.hit"); if (mk) mk.scrollIntoView({ block: "center" }); } catch (e) {} }
      }
      draw("");
      var q = main.querySelector(".dvq"), qT = 0;
      q.addEventListener("input", function () { clearTimeout(qT); var v = q.value.trim(); qT = setTimeout(function () { draw(v); }, 260); });
      main.querySelector(".dv-flist").addEventListener("click", function (ev) {
        var fi = ev.target.closest(".dv-fi"); if (!fi) return;
        var line = Number(fi.getAttribute("data-fline")), lines = full.split("\n"), target = (lines[line - 1] || "").trim().slice(0, 60);
        if (target) { q.value = target; draw(target); }
      });
    }

    function importantValues() {
      var rep = cachedReport(), crit = [], norm = [], pii = [];
      (rep.secrets || []).forEach(function (s) { if (s.value && s.value.length >= 6) crit.push(s.value); });
      (rep.tokens || []).forEach(function (t) { if (t.value && t.value.length >= 6) crit.push(t.value); });
      (rep.apiKeys || []).forEach(function (a) { if (a.value && a.value.length >= 6) crit.push(a.value); });
      (rep.pii || []).forEach(function (p) { if (p.value && p.value.length >= 6) pii.push(p.value); });
      (rep.sitekeys || []).forEach(function (s) { if (s.key) norm.push(s.key); });
      return { crit: uniq(crit).slice(0, 80), norm: uniq(norm).slice(0, 120), pii: uniq(pii).slice(0, 60) };
    }
    function markImportant(highlightedHtml) {
      try {
        var iv = importantValues();
        iv.crit.forEach(function (v) { var e = esc(v); if (e && highlightedHtml.indexOf(e) >= 0) highlightedHtml = highlightedHtml.split(e).join('<mark class="imp impr">' + e + '</mark>'); });
        iv.pii.forEach(function (v) { var e = esc(v); if (e && highlightedHtml.indexOf(e) >= 0) highlightedHtml = highlightedHtml.split(e).join('<mark class="imp impp">' + e + '</mark>'); });
        iv.norm.forEach(function (v) { var e = esc(v); if (e && highlightedHtml.indexOf(e) >= 0) highlightedHtml = highlightedHtml.split(e).join('<mark class="imp">' + e + '</mark>'); });
      } catch (x) {}
      return highlightedHtml;
    }
    function markHits(highlightedHtml, query) {
      if (!query || query.length < 2) return highlightedHtml;
      try { var e = esc(query); if (highlightedHtml.indexOf(e) >= 0) return highlightedHtml.split(e).join('<mark class="hit">' + e + '</mark>'); } catch (x) {}
      return highlightedHtml;
    }

    var htmlSearchT = 0;
    function renderHtmlTab() {
      var rep = cachedReport();
      var nSec = (rep.secrets || []).length, nSk = (rep.sitekeys || []).length, nApi = (rep.apiKeys || []).length, nTk = (rep.tokens || []).length, nPii = (rep.pii || []).length;
      listEl.innerHTML = '<div class="srcwrap">' +
        '<div class="impbar"><span class="ic">🔐 <b>' + nSec + '</b> secrets</span><span class="ic">🎟️ <b>' + nTk + '</b> tokens</span><span class="ic">👤 <b>' + nPii + '</b> PII</span><span class="ic">🧩 <b>' + nSk + '</b> sitekeys</span><span class="ic">🗝️ <b>' + nApi + '</b> api keys</span><span class="ic" style="color:var(--ac)">subrayado = importante</span></div>' +
        '<div class="srcbar"><input type="text" class="htmlq" placeholder="🔎 buscar en el HTML…"><span class="cnt"></span></div>' +
        '<div class="srcbody"></div></div>';
      var q = listEl.querySelector(".htmlq"), cnt = listEl.querySelector(".cnt"), bodyEl = listEl.querySelector(".srcbody");
      var raw = ""; try { raw = document.documentElement.outerHTML; } catch (e) { raw = "(no disponible)"; }
      var full = raw.slice(0, 400000);
      function draw(query) {
        var code = markImportant(highlightHTML(full));
        code = markHits(code, query);
        bodyEl.innerHTML = '<pre class="srccode">' + code + '</pre>';
        if (query && query.length >= 2) { var n = 0, idx = 0, ql = full.toLowerCase(); while ((idx = ql.indexOf(query.toLowerCase(), idx)) >= 0) { n++; idx++; if (n > 9999) break; } cnt.textContent = n + " hits"; try { var mk = bodyEl.querySelector("mark.hit"); if (mk) mk.scrollIntoView({ block: "center" }); } catch (e) {} } else cnt.textContent = (full.length) + " chars";
      }
      draw("");
      q.addEventListener("input", function () { clearTimeout(htmlSearchT); var v = q.value.trim(); htmlSearchT = setTimeout(function () { draw(v); }, 300); });
    }

    function renderTokens() {
      var toks = cachedTokens();
      if (!toks.length) { listEl.innerHTML = '<div class="empty">🎟️ Sin tokens aún.<br><br>Interactúa con la página y aparecerán aquí.</div>'; return; }
      var groups = {}, order = [];
      toks.forEach(function (t) { (groups[t.type] = groups[t.type] || []).push(t); if (order.indexOf(t.type) < 0) order.push(t.type); });
      var prio = ["JWT", "Access Token", "Bearer Token", "Refresh Token", "Session ID", "CSRF Token", "API Key", "Basic Auth", "Cloudflare", "Device ID", "Secret", "Token"];
      order.sort(function (a, b) { return (prio.indexOf(a) + 1 || 99) - (prio.indexOf(b) + 1 || 99); });
      var h = '<div class="reswrap">';
      order.forEach(function (tp) {
        var arr = groups[tp];
        h += '<div class="rsec"><div class="rh' + (tp === "JWT" || tp === "Access Token" || tp === "Bearer Token" ? " imp2" : "") + '"><span>' + (arr[0].icon || "🎟️") + " " + esc(tp) + '</span><span class="rcount">' + arr.length + '</span></div>';
        arr.forEach(function (t) {
          var ex = t.jwt ? (t.jwt.expired ? ' <span style="color:var(--crit);font-weight:800">⛔ expirado</span>' : ' <span style="color:var(--ok);font-weight:800">✓</span>') : "";
          h += '<div class="ri imp" data-token="' + escA(t.value) + '" data-tname="' + escA(t.name) + '" data-ttype="' + escA(t.type) + '" data-twhere="' + escA(t.where) + '">' + esc(String(t.name).slice(0, 50)) + ' <span class="rtag">' + esc(t.where) + '</span><br><span style="color:var(--warn)">' + esc(String(t.value).slice(0, 90)) + '…</span>' + ex + '</div>';
        });
        h += '</div>';
      });
      h += '</div>';
      return h;
    }
    function headerForToken(t) {
      var v = String(t.value || "");
      if (/^Bearer\s/i.test(v)) return v.indexOf("\n") < 0 ? v : "Authorization: " + v.split(/\s+/)[1];
      if (t.where === "cookie") return "Cookie: " + t.name + "=" + v;
      if (/CSRF/i.test(t.type)) return "X-CSRF-Token: " + v;
      if (/API Key/i.test(t.type)) return "X-API-Key: " + v;
      if (/Basic/i.test(t.type)) return "Authorization: " + v;
      return "Authorization: Bearer " + v;
    }
    function openTokenView(val, name, type, where) {
      var toks = cachedTokens(), t = null;
      for (var i = 0; i < toks.length; i++) if (toks[i].value === val) { t = toks[i]; break; }
      if (!t) t = { value: val, name: name || "?", type: type || "Token", where: where || "?", icon: "🎟️", jwt: isJWTv(val) ? jwtInfo(val) : null };
      $(".dtitle").innerHTML = "🎟️ " + esc(t.type);
      var body = detailEl.querySelector(".body"), b = "";
      b += '<div class="sec"><h4>' + esc((t.icon || "🎟️") + " " + t.type) + '</h4><div class="kv"><span class="k">nombre</span><span class="v">' + esc(String(t.name)) + '</span><span class="k">origen</span><span class="v">' + esc(String(t.where)) + '</span><span class="k">longitud</span><span class="v">' + String(t.value).length + ' chars</span></div></div>';
      b += '<div class="sec"><h4>Valor</h4><button class="cpbtn" data-cp="v">📋 Copiar</button><pre class="code" style="max-height:30vh;word-break:break-all">' + hl(t.value, "") + '</pre></div>';
      if (t.jwt) {
        var j = t.jwt;
        b += '<div class="sec"><h4>🔓 JWT decodificado</h4><pre class="code" style="max-height:34vh">' + highlightJSON("HEADER:\n" + JSON.stringify(j.header, null, 2) + "\n\nPAYLOAD:\n" + JSON.stringify(j.payload, null, 2)) + '</pre></div>';
      }
      body.innerHTML = b;
      var cp = body.querySelector('[data-cp="v"]'); if (cp) cp.addEventListener("click", function () { copy(t.value, cp, "📋 Copiar"); });
      detailEl.classList.add("open");
    }

    var playDraft = { method: "GET", url: "", headers: "", body: "" };
    function playgroundEndpoints() {
      var eps = {}, out = [];
      store.entries.forEach(function (e) { if (e.tags.indexOf("API") >= 0 && e.tags.indexOf("NOISE") < 0) { if (!eps[e.url]) { eps[e.url] = 1; out.push(e.url); } } });
      (deepData.jsEndpoints || []).forEach(function (j) { var u; try { u = new URL(j.path, location.origin).href; } catch (e) { return; } if (!eps[u]) { eps[u] = 1; out.push(u); } });
      return out.slice(0, 60);
    }
    function renderPlayground() {
      var toks = cachedTokens();
      var prio = toks.slice().sort(function (a, b) { return (b.jwt ? 1 : 0) - (a.jwt ? 1 : 0); }).slice(0, 12);
      var eps = playgroundEndpoints();
      var h = '<div class="pg">';
      h += '<div class="pg-bar"><select class="pg-method">' + ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(function (m) { return '<option' + (playDraft.method === m ? ' selected' : '') + '>' + m + '</option>'; }).join("") + '</select><input class="pg-url" list="pg-eps" placeholder="/api/endpoint o https://…" value="' + escA(playDraft.url) + '"><button class="pg-send">▶ Enviar</button></div>';
      h += '<datalist id="pg-eps">' + eps.map(function (u) { return '<option value="' + escA(u) + '">'; }).join("") + '</datalist>';
      h += '<div class="pg-toks"><span class="pg-lbl">🎟️ tokens:</span>' + (prio.length ? prio.map(function (t) { return '<span class="pg-tk" data-ptk-name="' + escA(t.name) + '" data-ptk-type="' + escA(t.type) + '" data-ptk-where="' + escA(t.where) + '" data-ptk-value="' + escA(t.value) + '">' + esc((t.icon || "🎟️") + " " + String(t.name || t.type).slice(0, 24)) + '</span>'; }).join("") : '<span style="color:var(--mut);font-size:11px">ninguno capturado</span>') + '</div>';
      h += '<div class="pg-grid"><div><label>Headers</label><textarea class="pg-headers" rows="7" spellcheck="false">' + esc(playDraft.headers) + '</textarea></div>';
      h += '<div><label>Body</label><textarea class="pg-body" rows="7" spellcheck="false">' + esc(playDraft.body) + '</textarea></div></div>';
      h += '<div class="pg-resp"><div class="empty" style="padding:18px">Configura la request y dale a ▶ Enviar.</div></div>';
      h += '</div>';
      listEl.innerHTML = h;
      var q = function (s) { return listEl.querySelector(s); };
      q(".pg-method").addEventListener("change", function () { playDraft.method = this.value; });
      q(".pg-url").addEventListener("input", function () { playDraft.url = this.value; });
      q(".pg-headers").addEventListener("input", function () { playDraft.headers = this.value; });
      q(".pg-body").addEventListener("input", function () { playDraft.body = this.value; });
      q(".pg-send").addEventListener("click", sendPlayground);
    }
    function parseHeaderLines(txt) { var o = {}; String(txt || "").split(/\r?\n/).forEach(function (l) { var i = l.indexOf(":"); if (i > 0) { var k = l.slice(0, i).trim(), v = l.slice(i + 1).trim(); if (k) o[k] = v; } }); return o; }
    function sendPlayground() {
      var q = function (s) { return listEl.querySelector(s); };
      var method = (playDraft.method || "GET").toUpperCase();
      var url = (playDraft.url || "").trim();
      if (!url) { q(".pg-resp").innerHTML = '<div class="empty" style="padding:14px;color:var(--warn)">⚠ Falta la URL</div>'; return; }
      if (url.charAt(0) === "/") { try { url = location.origin + url; } catch (e) {} }
      var headers = parseHeaderLines(playDraft.headers);
      var respEl = q(".pg-resp");
      respEl.innerHTML = '<div class="empty" style="padding:16px">⏳ Enviando…</div>';
      var opts = { method: method, headers: headers, credentials: "include" };
      if (playDraft.body && method !== "GET" && method !== "HEAD") opts.body = playDraft.body;
      var t0 = (performance && performance.now) ? performance.now() : Date.now();
      ORIG_FETCH(url, opts).then(function (r) {
        return r.text().then(function (txt) {
          var ms = Math.round(((performance && performance.now) ? performance.now() : Date.now()) - t0);
          var rh = {}; try { r.headers.forEach(function (v, k) { rh[k] = v; }); } catch (x) {}
          try { store.add({ kind: "playground", url: url, method: method, status: r.status, pending: false, reqHeaders: headers, reqBody: opts.body || null, respHeaders: rh, respBody: txt.slice(0, 40000), respCT: rh["content-type"] || "", ms: ms, via: "playground" }); } catch (x) {}
          var out = '<div class="rst"><span class="b ' + (r.ok ? "ok" : "err") + '">' + r.status + " " + esc(r.statusText || "") + '</span><span>' + ms + 'ms</span><span>' + txt.length + ' bytes</span></div>';
          out += '<div class="sec" style="margin-top:10px"><h4>Response headers</h4>' + kvBlock(rh) + '</div>';
          out += '<div class="sec"><h4>Response body</h4><pre class="code" style="max-height:42vh">' + hl(txt.slice(0, 60000), rh["content-type"] || "") + '</pre></div>';
          respEl.innerHTML = out;
        });
      }).catch(function (err) {
        respEl.innerHTML = '<div class="empty" style="padding:16px;color:var(--crit)">⛔ ' + esc(String(err && err.message || err)) + '</div>';
      });
    }
    function kvBlock(obj) { var ks = Object.keys(obj || {}); if (!ks.length) return '<div class="empty" style="padding:6px">—</div>'; return '<div class="kv">' + ks.map(function (k) { return '<span class="k">' + esc(k) + '</span><span class="v">' + esc(String(obj[k]).slice(0, 400)) + '</span>'; }).join("") + '</div>'; }
    function copy(txt, btn, label) { try { navigator.clipboard.writeText(txt).then(function () { btn.textContent = "✓"; setTimeout(function () { btn.textContent = label; }, 1000); }); } catch (e) { window.prompt("Copia:", txt); } }

    var renderScheduled = false, _lastRender = 0;
    function render() {
      renderScheduled = false; _lastRender = Date.now();
      if (activeTab === "cookie") { listEl.innerHTML = renderCookies(); counts(); return; }
      if (activeTab === "store") { listEl.innerHTML = renderStorage(); counts(); return; }
      if (activeTab === "atlas") { listEl.innerHTML = renderAtlas(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "res") { listEl.innerHTML = renderResources(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "source") { renderSourceTab(); counts(); return; }
      if (activeTab === "html") { renderHtmlTab(); counts(); return; }
      if (activeTab === "captcha") { listEl.innerHTML = renderCaptcha(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "antibot") { listEl.innerHTML = renderAntibot(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "security") { listEl.innerHTML = renderSecurity(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "fingerprint") { listEl.innerHTML = renderFingerprintTab(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "cors") { listEl.innerHTML = renderCORSTab(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "ssrf") { listEl.innerHTML = renderSSRFTab(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "runtime") { listEl.innerHTML = renderRuntimeTab(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "tokens") { listEl.innerHTML = renderTokens(); enhanceLinks(listEl); counts(); return; }
      if (activeTab === "play") { renderPlayground(); counts(); return; }
      var items = store.entries.filter(visible).slice(-800).reverse();
      listEl.innerHTML = items.length ? items.map(rowHTML).join("") : '<div class="empty">Sin resultados en esta pestaña.</div>';
      counts();
    }
    // ── NexusScope Pro · render de la pestaña Tech Atlas (David Zuniga · mejora José) ──
    function renderAtlas() {
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>🧭 TECH ATLAS · detección de stack</span><span class="rcount atlas-total">…</span></div><div class="ri dim">Análisis pasivo de tecnologías, DOM, CSS, APIs, seguridad, SEO e infraestructura. Los elementos marcados <b>ref</b> son de referencia (no detectables desde el navegador). · NexusScope Pro — creado por David Zuniga, editado y mejorado por José</div></div>';
      var total = 0, found = 0;
      ATLAS_GROUPS.forEach(function (g) {
        var rows = "", gf = 0;
        g.items.forEach(function (it) {
          total++;
          var v = null, ok = false, has = !!it.f;
          if (has) { try { v = it.f(); ok = !!v; } catch (e) {} }
          if (ok) {
            gf++; found++;
            var extra = "";
            if (typeof v === "number" && v > 0) extra = ' <span class="rtag">×' + v + '</span>';
            else if (typeof v === "string" && v !== "1" && v !== "true") extra = ' <span class="rtag">' + esc(v.slice(0, 70)) + '</span>';
            rows += '<div class="ri"><b style="color:var(--ok)">✓</b> ' + esc(it.l) + extra + '</div>';
          } else if (has) rows += '<div class="ri dim">· ' + esc(it.l) + '</div>';
          else rows += '<div class="ri dim">◦ ' + esc(it.l) + ' <span class="rtag" style="color:var(--mut)">ref</span></div>';
        });
        h += '<div class="rsec"><div class="rh"><span>' + esc(g.t) + '</span><span class="rcount">' + gf + '/' + g.items.length + '</span></div>' + rows + '</div>';
      });
      h += '<div class="rsec"><div class="rh"><span>🚨 Rutas sensibles & endpoints ocultos</span><span class="rcount">' + ATLAS_PATHS.length + '</span></div>';
      h += '<div class="ri"><button class="cpbtn" data-atlasprobe="1">▶ Probar ' + ATLAS_PATHS.length + ' rutas</button> <span style="color:var(--mut)">/admin · /.env · /.git · /actuator · /debug · /metrics · /swagger · /backup.zip …</span></div>';
      if (ATLAS_STATE.probing) h += '<div class="ri" style="color:var(--warn)">⏳ Escaneando rutas…</div>';
      (ATLAS_STATE.probes || []).forEach(function (p) {
        var hit = p.status && p.status !== 404 && p.status !== 0;
        h += '<div class="ri' + (hit ? ' imp' : ' dim') + '"' + (hit ? ' data-copy="' + escA(location.origin + p.path) + '" data-open="' + escA(location.origin + p.path) + '"' : '') + '>' + (hit ? '<b style="color:var(--crit)">' + p.status + '</b>' : (p.status || '✗')) + ' · ' + esc(p.path) + '</div>';
      });
      h += '</div></div>';
      setTimeout(function () { var el = listEl.querySelector(".atlas-total"); if (el) el.textContent = found + " / " + total + " detectados"; }, 0);
      return h;
    }
    function atlasProbe() {
      if (ATLAS_STATE.probing) return;
      ATLAS_STATE.probing = true; ATLAS_STATE.probes = [];
      render();
      var i = 0;
      (function next() {
        if (i >= ATLAS_PATHS.length) { ATLAS_STATE.probing = false; if (activeTab === "atlas") render(); return; }
        var p = ATLAS_PATHS[i++];
        try {
          ORIG_FETCH(location.origin + p, { credentials: "include", redirect: "follow" }).then(function (r) {
            ATLAS_STATE.probes.push({ path: p, status: r.status });
            try { if (r.status && r.status !== 404) store.add({ kind: "probe", url: location.origin + p, method: "GET", status: r.status, pending: false, via: "atlas" }); } catch (x) {}
            if (activeTab === "atlas" && (i % 5 === 0)) render();
            setTimeout(next, 120);
          }).catch(function () { ATLAS_STATE.probes.push({ path: p, status: 0 }); setTimeout(next, 120); });
        } catch (e) { ATLAS_STATE.probes.push({ path: p, status: 0 }); setTimeout(next, 120); }
      })();
    }
    function renderResources() {
      var rep = cachedReport();
      var scripts = [], styles = [], images = [], iframes = [];
      try { scripts = Array.prototype.map.call(document.scripts, function (s) { return s.src; }).filter(Boolean); } catch (e) {}
      try { styles = Array.prototype.map.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.href; }).filter(Boolean); } catch (e) {}
      try { images = Array.prototype.map.call(document.images, function (i) { return i.src; }).filter(Boolean); } catch (e) {}
      try { iframes = Array.prototype.map.call(document.querySelectorAll("iframe"), function (f) { return f.src; }).filter(Boolean); } catch (e) {}
      scripts = uniq(scripts); styles = uniq(styles); images = uniq(images); iframes = uniq(iframes);
      function sevOf(x) { return (x === "critical" || x === "high") ? "crit" : x === "low" ? "info" : "warn"; }
      function tile(icon, label, value, sev, url) {
        var open = url ? (' data-open="' + escA(url) + '"') : '';
        var copyv = ' data-copy="' + escA(url || value) + '"';
        return '<div class="tile ' + sev + '"' + open + copyv + '><span class="tico">' + icon + '</span><div class="tbody"><span class="tlabel">' + esc(label) + '</span><span class="tval">' + esc(String(value)) + '</span></div></div>';
      }
      var hi = "";
      rep.secrets.forEach(function (s) { hi += tile("🔐", s.name, s.value, sevOf(s.severity)); });
      (rep.pii || []).slice(0, 40).forEach(function (p) { hi += tile("👤", p.name, p.value, "pii"); });
      (rep.tokens || []).slice(0, 20).forEach(function (t) { hi += tile(t.icon || "🎟️", t.type, String(t.name).slice(0, 40) + " = " + String(t.value).slice(0, 30) + "…", "warn"); });
      (rep.antibots || []).forEach(function (a) { hi += tile("🛡️", "Antibot · " + a.vendor, a.name, "crit"); });
      rep.sitekeys.forEach(function (s) { hi += tile("🧩", s.type + " · sitekey", s.key, "warn"); });
      hi = hi ? '<div class="tiles">' + hi + '</div>' : '<div class="ri dim" style="padding:14px 12px">Aún nada crítico.</div>';
      var h = '<div class="reswrap">';
      h += '<div class="rsec"><div class="rh imp2"><span>⭐ IMPORTANTE</span></div>' + hi + '</div>';
      h += resSection("📜 Scripts", scripts);
      h += resSection("🎨 Stylesheets", styles);
      h += resImages(images);
      h += resSection("🔲 Iframes", iframes);
      h += '</div>';
      return h;
    }
    function resSection(title, items) {
      var head = '<div class="rsec"><div class="rh"><span>' + title + '</span><span class="rcount">' + items.length + '</span></div>';
      if (!items.length) return head + '<div class="ri dim">—</div></div>';
      return head + items.map(function (u) { return '<div class="ri" data-copy="' + escA(u) + '">' + esc(u) + '</div>'; }).join("") + '</div>';
    }
    function resImages(items) {
      var head = '<div class="rsec"><div class="rh"><span>🖼 Images</span><span class="rcount">' + items.length + '</span></div>';
      if (!items.length) return head + '<div class="ri dim">—</div></div>';
      return head + '<div class="rimggrid">' + items.map(function (u) { return '<img loading="lazy" src="' + escA(u) + '" data-img="' + escA(u) + '">'; }).join("") + '</div></div>';
    }
    function enhanceLinks(container) {
      try {
        var els = container.querySelectorAll(".ri[data-copy], .hl[data-copy]");
        for (var i = 0; i < els.length; i++) {
          var el = els[i], v = el.getAttribute("data-copy");
          if (/^https?:\/\//.test(v)) {
            el.setAttribute("data-open", v);
            if (!el.querySelector(".cpico")) { var b = document.createElement("span"); b.className = "cpico"; b.setAttribute("data-copybtn", "1"); b.textContent = "📋"; el.appendChild(b); }
          }
        }
      } catch (e) {}
    }
    function openImageView(url) {
      $(".dtitle").textContent = "🖼 " + (String(url).split(/[?#]/)[0].split("/").pop() || "image").slice(0, 40);
      var body = detailEl.querySelector(".body");
      body.innerHTML = '<div class="sec"><h4>Imagen</h4><img src="' + escA(url) + '" style="max-width:100%;border-radius:8px"></div><div class="sec"><h4>URL</h4><pre>' + esc(url) + '</pre></div>';
      detailEl.classList.add("open");
    }

    function scheduleRender() { if (renderScheduled) return; renderScheduled = true; var wait = Math.max(16, 450 - (Date.now() - _lastRender)); setTimeout(render, wait); }
    var countsScheduled = false;
    function scheduleCounts() { if (!countsScheduled) { countsScheduled = true; requestAnimationFrame(function () { countsScheduled = false; counts(); }); } }
    refreshUI = function () {
      if (paused) { counts(); return; }
      if (activeTab === "play" || activeTab === "source" || activeTab === "html") { counts(); return; }
      if (panel.classList.contains("open") && !detailEl.classList.contains("open")) render(); else counts();
    };
    store.on(function () {
      if (paused) { pausedNew++; scheduleCounts(); updatePauseBtn(); return; }
      if (activeTab === "source" || activeTab === "html" || activeTab === "play") { scheduleCounts(); return; }
      if (panel.classList.contains("open") && !detailEl.classList.contains("open")) scheduleRender(); else scheduleCounts();
    });
    function updatePauseBtn() { var pb = $('[data-act="pause"]'); if (pb) { pb.textContent = paused ? (pausedNew ? "▶ " + (pausedNew > 999 ? "999+" : pausedNew) : "▶") : "⏸"; pb.classList.toggle("paused", paused); } }

    function openDetail(id) {
      var e = store.byId[id]; if (!e) return;
      var okc = (e.status >= 400 || e.error) ? "err" : "ok";
      $(".dtitle").innerHTML = '<span class="m ' + e.method + '">' + e.method + '</span>' + (e.status ? '<span class="dstatus ' + okc + '">' + e.status + '</span>' : '') + '<span class="dmeta">' + (e.ms != null ? '· ' + e.ms + ' ms ' : '') + '</span>';
      var body = detailEl.querySelector(".body"), html = "";
      var uParts = String(e.url || "").split("?");
      html += '<div class="sec"><h4>URL</h4><pre>' + esc(uParts[0]) + (uParts.length > 1 ? '<span class="uq">?' + esc(uParts.slice(1).join("?")) + '</span>' : '') + '</pre></div>';
      if (e.tags && e.tags.length) html += '<div class="sec"><h4>Tags</h4><div style="display:flex;gap:4px;flex-wrap:wrap">' + e.tags.map(function (t) { return '<span class="chip ' + t + '">' + t + '</span>'; }).join("") + '</div></div>';
      if (e.secrets && e.secrets.length) html += '<div class="sec"><h4>Secrets <span class="cnt2">' + e.secrets.length + '</span></h4>' + e.secrets.map(function (s) { return '<div class="sk"><span class="n">' + esc(s.name) + '</span> · <span class="val">' + esc(String(s.value).slice(0, 120)) + '</span></div>'; }).join("") + '</div>';
      if (e.pii && e.pii.length) html += '<div class="sec"><h4>👤 PII <span class="cnt2">' + e.pii.length + '</span></h4>' + e.pii.map(function (s) { return '<div class="sk" style="border-left-color:#e89a3e"><span class="n" style="color:#e89a3e">' + esc(s.name) + '</span> · <span class="val">' + esc(String(s.value).slice(0, 120)) + '</span></div>'; }).join("") + '</div>';
      html += '<div class="sec"><h4>Request headers</h4>' + kvBlock(e.reqHeaders) + '</div>';
      if (e.reqBody) html += '<div class="sec"><h4>Request body</h4><pre class="code">' + hl(e.reqBody, "") + '</pre></div>';
      html += '<div class="sec"><h4>Response headers</h4>' + kvBlock(e.respHeaders) + '</div>';
      if (e.respBody) html += '<div class="sec"><h4>Response body</h4><pre class="code">' + hl(e.respBody.slice(0, 12000), e.respCT) + '</pre></div>';
      body.innerHTML = html;
      detailEl.classList.add("open");
    }

    function openLink(href) { if (!href) return; try { window.open(href, "_blank", "noopener"); } catch (e) { try { location.href = href; } catch (x) {} } }
    function copyRow(row) { var v = row && row.getAttribute("data-copy"); if (!v) return; try { navigator.clipboard.writeText(v); } catch (e) {} row.classList.add("copied"); setTimeout(function () { row.classList.remove("copied"); }, 600); }
    detailEl.addEventListener("click", function (ev) {
      var cb = ev.target.closest("[data-copybtn]"); if (cb) { ev.stopPropagation(); copyRow(cb.parentNode); return; }
      var l = ev.target.closest("[data-open]"); if (l) { ev.stopPropagation(); openLink(l.getAttribute("data-open")); }
    });
    listEl.addEventListener("click", function (ev) {
      var cb = ev.target.closest("[data-copybtn]"); if (cb) { copyRow(cb.parentNode); return; }
      var dla = ev.target.closest("[data-dlall]"); if (dla) { ev.stopPropagation(); downloadAllSources(); return; }
      var dl = ev.target.closest("[data-dl]"); if (dl) { ev.stopPropagation(); downloadSourceFile(dl.getAttribute("data-dl")); return; }
      var sf = ev.target.closest("[data-srcfile]"); if (sf) { loadSourceFile(sf.getAttribute("data-srcfile")); return; }
      var op = ev.target.closest("[data-open]"); if (op) { openLink(op.getAttribute("data-open")); return; }
      var tl = ev.target.closest(".tile[data-copy]"); if (tl) { copyRow(tl); return; }
      var ptk = ev.target.closest("[data-ptk-value]"); if (ptk) { var t = { name: ptk.getAttribute("data-ptk-name"), type: ptk.getAttribute("data-ptk-type"), where: ptk.getAttribute("data-ptk-where"), value: ptk.getAttribute("data-ptk-value") }; playDraft.headers = (playDraft.headers ? playDraft.headers.replace(/\s+$/, "") + "\n" : "") + headerForToken(t); renderPlayground(); return; }
      var tk = ev.target.closest("[data-token]"); if (tk) { openTokenView(tk.getAttribute("data-token"), tk.getAttribute("data-tname"), tk.getAttribute("data-ttype"), tk.getAttribute("data-twhere")); return; }
      var im = ev.target.closest("[data-img]"); if (im) { openImageView(im.getAttribute("data-img")); return; }
      var ri = ev.target.closest(".ri"); if (ri && ri.getAttribute("data-copy")) { try { navigator.clipboard.writeText(ri.getAttribute("data-copy")); } catch (e) {} ri.classList.add("copied"); setTimeout(function () { ri.classList.remove("copied"); }, 600); return; }
      var kv = ev.target.closest(".kvrow"); if (kv) { openKVView(kv.getAttribute("data-name"), kv.getAttribute("data-full"), kv.getAttribute("data-jwt") === "1"); return; }
      var row = ev.target.closest(".row"); if (row && row.getAttribute("data-id")) openDetail(Number(row.getAttribute("data-id")));
    });
    function switchTab(id) { activeTab = id; var all = tabsEl.querySelectorAll(".tab"); for (var i = 0; i < all.length; i++) all[i].classList.toggle("active", all[i].getAttribute("data-tab") === id); render(); }
    tabsEl.addEventListener("click", function (ev) { var t = ev.target.closest(".tab"); if (!t) return; switchTab(t.getAttribute("data-tab")); });
    fltEl.addEventListener("input", function () { query = fltEl.value.trim(); render(); });
    hideNoiseEl.addEventListener("change", render);
    listEl.addEventListener("click", function (ev) { var b = ev.target.closest("[data-atlasprobe]"); if (b) { ev.stopPropagation(); atlasProbe(); } });
    $('[data-act="back"]').addEventListener("click", function () { detailEl.classList.remove("open"); });
    $('[data-act="close"]').addEventListener("click", function () { panel.classList.remove("open"); });
    $('[data-act="clear"]').addEventListener("click", function () { store.entries = []; store.byId = {}; pausedNew = 0; clearSession(); invalidateReport(); render(); updatePauseBtn(); });
    $('[data-act="pause"]').addEventListener("click", function () { paused = !paused; if (!paused) { pausedNew = 0; render(); } updatePauseBtn(); });
    try { if (localStorage.getItem("__spyderx_theme") === "light") panel.classList.add("light"); } catch (e) {}
    $('[data-act="theme"]').addEventListener("click", function () { var lite = panel.classList.toggle("light"); try { localStorage.setItem("__spyderx_theme", lite ? "light" : "dark"); } catch (e) {} });
    $('[data-act="export"]').addEventListener("click", function () {
      try {
        var blob = new Blob([window.__snifffer.export()], { type: "application/json" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nexusscope-" + (location.hostname || "report") + "-" + Date.now() + ".json"; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      } catch (e) { window.prompt("Copia el JSON:", window.__snifffer.export()); }
    });
    $('[data-act="plan"]').addEventListener("click", function () {
      try {
        var md = window.__snifffer.plan();
        var blob = new Blob([md], { type: "text/markdown" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "plan-scraping-" + (location.hostname || "site") + "-" + Date.now() + ".md"; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      } catch (e) { window.prompt("Copia el plan:", window.__snifffer.plan()); }
    });

    function toggle() { panel.classList.toggle("open"); if (panel.classList.contains("open")) render(); }
    window.__snifffer.toggle = toggle;
    window.addEventListener("keydown", function (e) { if (e.altKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); toggle(); } });

    (function () {
      var moved = false, sx, sy, ox, oy, dragging = false, touchAt = 0;
      function down(x, y) { dragging = true; moved = false; sx = x; sy = y; var r = fab.getBoundingClientRect(); ox = r.left; oy = r.top; }
      function move(x, y) { if (!dragging) return; if (Math.abs(x - sx) > 6 || Math.abs(y - sy) > 6) moved = true; var nx = ox + (x - sx), ny = oy + (y - sy); nx = Math.max(4, Math.min(window.innerWidth - 60, nx)); ny = Math.max(4, Math.min(window.innerHeight - 60, ny)); fab.style.left = nx + "px"; fab.style.top = ny + "px"; fab.style.right = "auto"; fab.style.bottom = "auto"; }
      function up() { if (!dragging) return; dragging = false; if (!moved) toggle(); }
      var ghost = function () { return Date.now() - touchAt < 800; };
      fab.addEventListener("touchstart", function (e) { touchAt = Date.now(); var t = e.touches[0]; down(t.clientX, t.clientY); }, { passive: true });
      fab.addEventListener("touchmove", function (e) { touchAt = Date.now(); var t = e.touches[0]; move(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
      fab.addEventListener("touchend", function (e) { touchAt = Date.now(); e.preventDefault(); up(); }, { passive: false });
      fab.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); });
      fab.addEventListener("mousedown", function (e) { if (ghost()) return; down(e.clientX, e.clientY); e.preventDefault(); });
      window.addEventListener("mousemove", function (e) { if (ghost()) return; move(e.clientX, e.clientY); });
      window.addEventListener("mouseup", function (e) { if (ghost()) return; up(); });
    })();

    counts();
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(scanDOMSecrets, 800);
    else window.addEventListener("DOMContentLoaded", function () { setTimeout(scanDOMSecrets, 800); });

    (function () {
      var did = false;
      var run = function () { if (did) return; did = true; setTimeout(function () { try { deepRun(function () { if (refreshUI) refreshUI(); }); } catch (e) {} }, 2000); };
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run);
    })();

    try { setInterval(function () { try { if (!document.getElementById("__snifffer_host")) { host.style.cssText = "all:initial;position:fixed;z-index:2147483647;"; (document.body || document.documentElement).appendChild(host); } } catch (e) {} }, 3000); } catch (e) {}
  }

  function boot() { if (document.body) buildUI(); else requestAnimationFrame(boot); }
  boot();
})();