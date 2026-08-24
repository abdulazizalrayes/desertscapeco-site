(function desertscapeAIReferralAttribution() {
  if (window.DesertScapeAIReferralAttribution) return;
  window.DesertScapeAIReferralAttribution = true;

  var storageKey = "desertscape-ai-referral-v1";
  var sessionEventKey = "desertscape-ai-referral-session-sent-v1";
  var leadEvents = {
    phone_lead_click: true,
    whatsapp_lead_click: true,
    email_lead_click: true,
    generate_lead: true
  };
  var platformHosts = [
    ["chatgpt.com", "chatgpt"],
    ["chat.openai.com", "chatgpt"],
    ["claude.ai", "claude"],
    ["perplexity.ai", "perplexity"],
    ["gemini.google.com", "gemini"],
    ["bard.google.com", "gemini"],
    ["copilot.microsoft.com", "microsoft-copilot"]
  ];

  function safeHost(value) {
    try {
      return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    } catch (error) {
      return "";
    }
  }

  function platformForHost(host) {
    for (var index = 0; index < platformHosts.length; index += 1) {
      var candidate = platformHosts[index][0];
      if (host === candidate || host.endsWith("." + candidate)) return platformHosts[index][1];
    }
    return "";
  }

  function platformForCampaign(value) {
    var normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (normalized.indexOf("chatgpt") >= 0 || normalized.indexOf("openai") >= 0) return "chatgpt";
    if (normalized.indexOf("claude") >= 0 || normalized.indexOf("anthropic") >= 0) return "claude";
    if (normalized.indexOf("perplexity") >= 0) return "perplexity";
    if (normalized.indexOf("gemini") >= 0 || normalized.indexOf("bard") >= 0) return "gemini";
    if (normalized.indexOf("copilot") >= 0) return "microsoft-copilot";
    return "";
  }

  function detectedAttribution() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (error) {
      params = { get: function () { return ""; } };
    }
    var campaignSource = platformForCampaign(params.get("utm_source")) || platformForCampaign(params.get("utm_medium"));
    var referrerHost = safeHost(document.referrer);
    var platform = campaignSource || platformForHost(referrerHost);
    if (!platform) return null;
    return {
      ai_platform: platform,
      ai_referral_host: referrerHost || "campaign-tag",
      ai_landing_path: window.location.pathname,
      traffic_source_class: "ai-assistant"
    };
  }

  function readStoredAttribution() {
    try {
      var value = window.sessionStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  var attribution = detectedAttribution() || readStoredAttribution();
  if (!attribution) return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(attribution));
  } catch (error) {
  }

  window.dataLayer = window.dataLayer || [];
  var originalPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function () {
    for (var index = 0; index < arguments.length; index += 1) {
      var entry = arguments[index];
      if (!entry || entry[0] !== "event" || !leadEvents[entry[1]]) continue;
      entry[2] = Object.assign({}, entry[2] || {}, attribution, { ai_referral: true });
    }
    return originalPush.apply(null, arguments);
  };

  try {
    if (window.sessionStorage.getItem(sessionEventKey) !== "true" && typeof window.gtag === "function") {
      window.sessionStorage.setItem(sessionEventKey, "true");
      window.gtag("event", "ai_referral_session", Object.assign({}, attribution, {
        ai_referral: true,
        non_interaction: true
      }));
    }
  } catch (error) {
  }
})();
