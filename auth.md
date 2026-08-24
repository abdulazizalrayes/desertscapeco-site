# Auth.md

DesertScape Co authentication guidance

DesertScape Co does not currently provide public OAuth, OpenID Connect, paid API access, or self-service agent credentials.

## Agent registration

Registration status: no public self-service agent registration is available.

Agent registration endpoint: not available for self-service use.

Client registration endpoint: not available for public OAuth clients.

Registration contact: mailto:projects@desertscapeco.com.

```yaml
agent_auth:
  skill: https://www.desertscapeco.com/auth.md
  registration_status: closed
  audience:
    - public_web_agents
    - approved_private_integrations
  register_uri: https://www.desertscapeco.com/contact
  provisioning_uri: mailto:projects@desertscapeco.com
  claim_uri: https://www.desertscapeco.com/
  methods_supported:
    - name: public_read
      identity_types_supported:
        - anonymous
      credential_types_supported:
        - none
      scopes_supported:
        - public_read
      claim_uri: https://www.desertscapeco.com/
    - name: approved_private_integration
      identity_types_supported:
        - verified_email
        - organization_approved
      credential_types_supported:
        - manual_review
      scopes_supported:
        - project_inquiry_coordination
        - private_integration_discussion
      claim_uri: mailto:projects@desertscapeco.com
  identity_types_supported:
    - anonymous
  anonymous:
    credential_types_supported:
      - none
    claim_uri: https://www.desertscapeco.com/
  credential_use: Public pages require no credentials. Private integrations are provisioned manually after approval and must not be assumed available by default.
  oauth_authorization_server: not_available
  oauth_protected_resource: not_available
  self_service_client_registration: false
```

## Standalone agent registration flow

Registration flow: anonymous public read.

Agent audience: public web agents and approved private integration partners.

Registration endpoint: https://www.desertscapeco.com/contact.

Provisioning endpoint: mailto:projects@desertscapeco.com.

Identity types supported:

- anonymous
- verified_email
- organization_approved

Anonymous credential types supported:

- none

Verified email credential types supported:

- manual_review

Claim URI:

https://www.desertscapeco.com/

Credential use: public_read requires no credentials. Approved private integrations require manual review and written approval from DesertScape Co before any credential or private access is issued.

DesertScape Co agents and AI assistants can read public website information without credentials. For approved integrations, project partnerships, or private access discussions, contact DesertScape Co at projects@desertscapeco.com.

Public information can be read from:

- https://www.desertscapeco.com/
- https://www.desertscapeco.com/llms.txt
- https://www.desertscapeco.com/llms-full.txt
- https://www.desertscapeco.com/data/company.json
- https://www.desertscapeco.com/data/services.json
- https://www.desertscapeco.com/data/capabilities.json
- https://www.desertscapeco.com/data/service-areas.json
- https://www.desertscapeco.com/data/project-inquiry-schema.json
- https://www.desertscapeco.com/data/agent-routing.json
- https://www.desertscapeco.com/data/agent-analytics-dashboard.json
- https://www.desertscapeco.com/openapi.json
- https://www.desertscapeco.com/.well-known/api-catalog

Agents may help users prepare project inquiries, but must get explicit user approval before submitting any inquiry to:

https://www.desertscapeco.com/api/inquiry

Do not submit careers, internships, vendor spam, retail shopping, or unrelated messages through the project inquiry flow.

Use https://www.desertscapeco.com/data/agent-routing.json to route careers, vendors, retail shopping, and unrelated requests away from the project inquiry endpoint.

For official access, partnerships, or project discussions, contact DesertScape Co:

projects@desertscapeco.com
