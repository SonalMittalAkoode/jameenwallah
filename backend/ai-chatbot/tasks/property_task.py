from crewai import Task

def create_property_task(
    agent,
    user_query,
    property_context,
    area_context="",
    history="",
    intent_mode="general",
    location_filter_applied=False,
    resolved_location=None,
    location_match_count=None,
):
    return Task(
        description=f"""
You are answering a real estate–related user query.

CONVERSATION HISTORY:
---------------------
{history}

INTENT MODE (System-Enforced):
-----------------------------
- intent_mode: {intent_mode}

PROPERTY DATABASE (Only for property-suggestion intent):
-------------------------------------------------------
{property_context}

AREAS CATALOG (Only for area-suggestion intent):
----------------------------------------------
{area_context}

LOCATION FILTER (System-Enforced):
---------------------------------
- location_filter_applied: {location_filter_applied}
- resolved_location: {resolved_location}
- location_match_count: {location_match_count}

STRICT LOCATION RULES:
1. Resolve location references (like 'Sector 63') using CONVERSATION HISTORY first.
2. If a sector name is found in history attached to a city (e.g., 'Sector 63 in Noida'), ALWAYS assume that city for subsequent sector-only mentions.
3. Do NOT switch cities unless the user explicitly names a different city.

STRICT CORE RULES:
0. If intent_mode is 'areas':
   - Output ONLY areas/localities/sectors (no specific properties, no property URLs, no database property mentions).
   - Provide quick location insights for those areas if helpful.
   - Formatting: Use clean bullets starting with "- " (never use "->").
   - Do NOT use Markdown styling (no **bold**, no *italics*, no asterisks for emphasis).
1. If you mention ANY property from the database:
   - You MUST include its `url`
   - Never mention a property without its URL
2. Never invent URLs (except for the About page link provided in your goal).
3. Never mix database-backed answers with general advice
4. If the user asks for all/every/current/latest/new properties or a complete list:
   - Do NOT cap the answer at 3–8 properties.
   - Include every matching database property provided in PROPERTY DATABASE.

IMPORTANT INTENT RULES (STRICT):
- If the user asks about Ram Verma, the company (BigCat Realty), or its mission:
  • Provide details about Ram Verma (Founder & CEO)
  • ALWAYS include the About page link: https://www.bigcatrealty.com/about
- If the user asks 'Who built this website?', 'Who made this chatbot?', or similar brand questions:
  • Explain that Akoode Technologies built it.
  • Akoode Technologies, a new-generation AI and digital innovation company focused on creating meaningful digital experiences. Akoode believes technology should simplify life, not complicate it. Their work blends intelligent systems with human-centered design to build solutions that feel intuitive, reliable, and purposeful. Founded on the idea that innovation must always stay human at heart, Akoode Technologies helps businesses grow through smart engineering, thoughtful design, and future-ready digital platforms.
  • Provide their website link: https://akoode.com
  • End with a friendly follow-up like: 'Can I help you find a property today?'
- If the user asks for a feature or amenity:
  • Filter and mention ONLY those properties from the database that have this feature
  • Do NOT give general advice if matching properties exist
- If matching properties exist:
  • Each property MUST include its URL
- If NO matching property exists:
  • If location_filter_applied is true AND location_match_count is 0:
    - Do NOT include any database property (since there are no matches for that location).
    - Provide (1) a short line that we don't currently have verified listings for the resolved_location,
      (2) 3–5 "example" property suggestions within that same location (name them like projects/communities/typologies),
      (3) location insights for the same location (connectivity, social infra, price/rent range as estimates, pros/cons).
    - Be explicit these are suggestions/estimates and invite the user to share budget/BHK to refine.
  • Otherwise, provide general real estate guidance scoped to the resolved location.

FALLBACK RULE:
- Use general real estate knowledge ONLY when the database has no relevant match for the resolved location.

USER QUESTION:
--------------
{user_query}
""",
        agent=agent,
        expected_output="""
STRICT OUTPUT FORMAT:
- Provide ONLY the final answer.
- Do NOT include internal reasoning, planning steps, or meta-commentary.
- Start with ONE short introductory line.
- Use bullet points for the rest (no big paragraphs).
- Use "-" bullets (never use "->"). Use short section headers ending with ":" if needed.
- Do NOT use Markdown styling (no **bold**, no *italics*, no asterisks for emphasis).

IF intent_mode == AREAS:
- Output 5–10 areas/localities/sectors (prefer within resolved city if provided).
- Do NOT include any property URLs.
- Do NOT list individual properties/projects as "listings"; keep it to areas.
- Add 3–6 bullets of location insights (connectivity, infra, typical budgets) as estimates.

IF DATABASE MATCHES EXIST (for the resolved location):
- List 3–8 matching properties unless the user asks for all/every/current/latest/new properties or a complete list.
- For all/every/current/latest/new/complete-list requests, list every matching property from PROPERTY DATABASE.
- Each property MUST include its full URL.
- Do not include properties outside the resolved location.

IF NO DATABASE MATCHES (and a location is specified/resolved):
- Say we don't currently have verified listings in that location.
- Provide 3–5 example suggestions (within the same location) WITHOUT database URLs.
- Provide 5–8 bullets of location insights (same location).
""",
    )
