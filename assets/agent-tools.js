if (!window.DesertScapeWebMCP) {
window.DesertScapeWebMCP = true;

(function registerDesertScapeWebMCP() {
  var modelContext = (document && document.modelContext) || (navigator && navigator.modelContext);
  if (!modelContext || typeof modelContext.registerTool !== "function") return;

  var controller = typeof AbortController === "function" ? new AbortController() : null;
  var options = controller ? { signal: controller.signal } : undefined;
  async function fetchJson(path) {
    var response = await fetch(new URL(path, window.location.origin).toString(), {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Unable to read " + path);
    return response.json();
  }

  async function postJson(path, body) {
    var response = await fetch(new URL(path, window.location.origin).toString(), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "Unable to call " + path);
    return payload;
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function scoreItem(query, item) {
    var haystack = normalize([
      item.name,
      item.summary,
      item.id,
      item.url,
      (item.keywords || []).join(" "),
      (item.scope || []).join(" ")
    ].join(" "));
    return normalize(query)
      .split(/[^a-z0-9+]+/i)
      .filter(Boolean)
      .reduce(function (score, token) {
        return score + (haystack.indexOf(token) >= 0 ? 1 : 0);
      }, 0);
  }

  var negativeRoutingPatterns = [
    "apply for",
    "career",
    "careers",
    "cv",
    "employment",
    "hire me",
    "hiring",
    "resume",
    "recruitment",
    "vacancy",
    "work for",
    "job",
    "jobs",
    "intern",
    "internship",
    "trainee",
    "training",
    "vendor",
    "vendor onboarding",
    "vendor registration",
    "supplier registration",
    "supplier outreach",
    "sell to desertscape",
    "offer our products",
    "retail plant",
    "plant shopping",
    "garden center",
    "seo services",
    "loan offer",
    "crypto"
  ];

  function negativeMatchesFor(query) {
    var normalized = normalize(query);
    return negativeRoutingPatterns.filter(function (pattern) {
      return normalized.indexOf(pattern) >= 0;
    });
  }

  var tools = [
    {
      name: "get_desertscape_overview",
      description: "Return a concise overview of DesertScape Co and its public contact channels.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      execute: async function () {
        return {
          summary: "DesertScape Co is a Riyadh-based landscape company serving Saudi Arabia.",
          services: [
            "Landscape design",
            "Supply and procurement",
            "Landscape construction",
            "Operation and maintenance",
            "Irrigation systems",
            "Softscape",
            "Hardscape",
            "Water features",
            "Lighting and sound systems",
            "Landscape automation and IoT"
          ],
          contact: "projects@desertscapeco.com",
          phone: "+966534112205",
          source: "https://www.desertscapeco.com/llms-full.txt"
        };
      }
    },
    {
      name: "get_desertscape_service_pages",
      description: "Return DesertScape Co service discovery pages for scope-fit questions.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      execute: async function () {
        return {
          services: "https://www.desertscapeco.com/services",
          elements: "https://www.desertscapeco.com/elements",
          sectors: "https://www.desertscapeco.com/sectors",
          contact: "https://www.desertscapeco.com/contact",
          llms: "https://www.desertscapeco.com/llms-full.txt"
        };
      }
    },
    {
      name: "list_desertscape_services",
      description: "List DesertScape service groups and focused landing pages from structured data.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      execute: async function () {
        var services = await fetchJson("/data/services.json");
        return {
          services: services,
          source: "https://www.desertscapeco.com/data/services.json"
        };
      }
    },
    {
      name: "list_desertscape_service_areas",
      description: "List DesertScape Saudi service areas and international search-use cases.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      execute: async function () {
        var serviceAreas = await fetchJson("/data/service-areas.json");
        return {
          serviceAreas: serviceAreas,
          source: "https://www.desertscapeco.com/data/service-areas.json"
        };
      }
    },
    {
      name: "match_desertscape_project_scope",
      description: "Read DesertScape structured service data and match a user's landscape project scope to relevant public pages.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Landscape project scope or search intent." },
          location: { type: "string", description: "Project location, if known." }
        },
        required: ["query"],
        additionalProperties: false
      },
      execute: async function (input) {
        var services = await fetchJson("/data/services.json");
        var capabilities = await fetchJson("/data/capabilities.json");
        var serviceAreas = await fetchJson("/data/service-areas.json");
        var query = input && input.query ? input.query : "";
        var routing = await fetchJson("/data/agent-routing.json");
        var nonFitMatches = negativeMatchesFor([query, input && input.location ? input.location : ""].join(" "));
        if (nonFitMatches.length) {
          return {
            acceptedFit: false,
            negativeRoutingMatches: nonFitMatches,
            recommendedNextAction: "Do not use the project inquiry endpoint. Route to careers, vendors, or a more appropriate page.",
            routeCareersTo: routing.routeCareersTo,
            routeVendorsTo: routing.routeVendorsTo,
            doNotSubmitThroughProjectInquiry: routing.rejectOrRedirect
          };
        }
        var serviceItems = []
          .concat(services.serviceGroups || [])
          .concat(services.focusedLandingPages || [])
          .sort(function (a, b) { return scoreItem(query, b) - scoreItem(query, a); })
          .slice(0, 5);
        var capabilityItems = []
          .concat(capabilities.elements || [])
          .concat(capabilities.sectors || [])
          .sort(function (a, b) { return scoreItem(query, b) - scoreItem(query, a); })
          .slice(0, 5);
        return {
          acceptedFit: true,
          query: query,
          location: input && input.location ? input.location : "",
          market: serviceAreas.primaryMarket,
          recommendedServicePages: serviceItems.map(function (item) {
            return { id: item.id, name: item.name, url: item.url, summary: item.summary || "" };
          }),
          relevantCapabilities: capabilityItems.map(function (item) {
            return { id: item.id, name: item.name, url: item.url, scope: item.scope || [] };
          }),
          nextStep: "Use https://www.desertscapeco.com/contact for a user-approved project inquiry."
        };
      }
    },
    {
      name: "ask_desertscape_agent_concierge",
      description: "Ask a bounded, read-only question about DesertScape using verified public resources only.",
      inputSchema: {
        type: "object",
        properties: {
          question: {
            type: "string",
            minLength: 1,
            maxLength: 600,
            description: "One concise public-information question without personal, credential, or confidential project data."
          }
        },
        required: ["question"],
        additionalProperties: false
      },
      execute: async function (input) {
        return postJson("/api/agent-concierge", {
          question: input && input.question ? input.question : ""
        });
      }
    },
    {
      name: "prepare_desertscape_project_inquiry",
      description: "Prepare a DesertScape project inquiry draft from user-provided details. This tool does not submit without explicit user approval.",
      inputSchema: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          contactPerson: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          projectLocation: { type: "string" },
          scope: { type: "string" },
          timeline: { type: "string" },
          budget: { type: "string" },
          message: { type: "string" },
          userApprovedDraft: { type: "boolean", description: "True only after the user reviews and explicitly approves the final draft." }
        },
        required: ["scope"],
        additionalProperties: false
      },
      execute: async function (input) {
        var schema = await fetchJson("/data/project-inquiry-schema.json");
        var routing = await fetchJson("/data/agent-routing.json");
        var draft = {
          _subject: "project_inquiry",
          type: "project_inquiry",
          company: input && input.companyName ? input.companyName : "",
          contact_person: input && input.contactPerson ? input.contactPerson : "",
          email: input && input.email ? input.email : "",
          mobile: input && input.phone ? input.phone : "",
          project_location: input && input.projectLocation ? input.projectLocation : "",
          primary_offerings: input && input.scope ? input.scope : "",
          timeline: input && input.timeline ? input.timeline : "",
          budget: input && input.budget ? input.budget : "",
          message: input && input.message ? input.message : ""
        };
        return {
          draft: draft,
          schema: schema.$id || "https://www.desertscapeco.com/data/project-inquiry-schema.json",
          approvalRequired: true,
          approvedToSubmit: Boolean(input && input.userApprovedDraft),
          submitEndpoint: routing.routeProjectInquiryTo && routing.routeProjectInquiryTo.endpoint,
          instruction: "Show this draft to the user first. Submit only after explicit user approval; route vendors and careers away from the project inquiry flow."
        };
      }
    },
    {
      name: "read_desertscape_public_resource",
      description: "Read one of DesertScape's public structured JSON resources by key.",
      inputSchema: {
        type: "object",
        properties: {
          resource: {
            type: "string",
            enum: ["company", "services", "capabilities", "service-areas", "project-inquiry-schema", "agent-routing", "agent-concierge"]
          }
        },
        required: ["resource"],
        additionalProperties: false
      },
      execute: async function (input) {
        var resource = input && input.resource ? input.resource : "company";
        var path = "/data/" + resource + ".json";
        return {
          resource: resource,
          resourceUrl: new URL(path, window.location.origin).toString(),
          data: await fetchJson(path)
        };
      }
    }
  ];

  [
    ["get_company_overview", "get_desertscape_overview", "Alias for get_desertscape_overview."],
    ["list_services", "list_desertscape_services", "Alias for list_desertscape_services."],
    ["list_service_areas", "list_desertscape_service_areas", "Alias for list_desertscape_service_areas."],
    ["match_project_scope", "match_desertscape_project_scope", "Alias for match_desertscape_project_scope."],
    ["ask_agent_concierge", "ask_desertscape_agent_concierge", "Alias for ask_desertscape_agent_concierge."],
    ["prepare_project_inquiry", "prepare_desertscape_project_inquiry", "Alias for prepare_desertscape_project_inquiry."],
    ["read_public_resource", "read_desertscape_public_resource", "Alias for read_desertscape_public_resource."]
  ].forEach(function (alias) {
    var original = tools.find(function (tool) { return tool.name === alias[1]; });
    if (!original) return;
    tools.push(Object.assign({}, original, {
      name: alias[0],
      description: alias[2] + " " + original.description
    }));
  });

  tools.forEach(function (tool) {
    try {
      modelContext.registerTool(tool, options);
    } catch (error) {
      try {
        modelContext.registerTool(tool);
      } catch (ignore) {
      }
    }
  });

  window.DesertScapeWebMCPController = controller;
})();
}
