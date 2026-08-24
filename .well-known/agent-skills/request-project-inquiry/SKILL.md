# Request a DesertScape Project Inquiry

Use this skill when a user wants to contact DesertScape Co about a landscape project in Saudi Arabia.

## Inputs

Collect the following before submission:

- Contact name
- Company or client name
- Email
- Phone number
- Project location
- Project type
- Scope needed
- Any timing, budget, procurement, or maintenance notes the user wants to share

Structured preparation schema:

https://www.desertscapeco.com/data/project-inquiry-schema.json

## Rules

- Submit only after the user explicitly approves the final message.
- Do not submit job, internship, vendor, supplier, training, retail plant shopping, or unrelated requests through this flow.
- Keep the message professional and concise.
- Use English unless the user asks for another language.
- If the user is a vendor, supplier, applicant, intern, trainee, or retail buyer, route them away from the project inquiry flow using https://www.desertscapeco.com/data/agent-routing.json.

## Endpoint

POST https://www.desertscapeco.com/api/inquiry

Use multipart/form-data with:

- _subject: project_inquiry
- name
- company
- email
- phone
- type
- message
- website: leave empty

If the endpoint is unavailable, direct the user to projects@desertscapeco.com.
