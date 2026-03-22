> The aim of this case is to assess your technical skills, both front and back, way of working and thought process while coding. The mock app is a health focussed triage experience where a patient can describe symptoms and get guided to the right care pathway.

Below, you’ll find more info on what’s expected and how to build this. If you have any more questions after reading this, always feel free to reach out to us!

# Problem statement

In many virtual care experiences, patients still need to self-diagnose and choose the right specialist themselves. This creates confusion, inefficiency, and delays in treatment.

We want to reimagine digital triage so that a patient can describe symptoms naturally and get guided — with confidence — to the right care pathway. The flow should reduce the need for self-diagnosis, provide intelligent (probabilistic/AI) suggestions, clearly distinguish urgency (emergency/urgent/routine), and build trust through an empathetic, premium experience.

# Design

There is no fixed design file for this case. We’ll evaluate:

- UX clarity and trustworthiness
- Visual polish (spacing, typography, accessibility)
- Quality of states (validation, errors, empty states)

# Stack

The stack we want you to use

- NextJS or vanilla React
    - Typescript
    - Tailwind CSS
- Database
    - For triage sessions (e.g. Postgres, or SQLite if you keep it local)
- AI Orchestration:
    - If you want to use AI for the triage logic, we like to use **Mastra**
    - For presentation/UX (if applicable): **Vercel AI SDK** and/or **Vercel Chat SDK**

# How we measure success

What will we focus on during our assessment

- Communication about the approach
    - During the case presentation you will walk us through how you’ve set up the project and what you worked on.
- End-to-end completeness (core flow works)
- Code structure & Technical best practices
    - Backend
    - Frontend
- Visual quality and UX clarity
- Solution architecture (keep it lightweight)

# Deliverables

- A narrative on how you approached the project and the choices you made along the way
- Live working ‘Web app’ (link to hosted app)
- Github repository (please make sure we have access)
- _Nice to have:_ Lightweight architecture map in any format of your choice

> **Max. time: 8h**

You are free to spend the time as you want, but we strongly advise to stick to the 8hr time limit. Don’t worry if you can’t finish everything in the projected time. You’re not expected to. But we are interested in your choices along the way! Good luck!

# Scenario

A patient experiencing **chest pain** is trying to get help. In today’s systems they must decide between cardiology, pulmonology, gastroenterology, or general practice.

The triage flow should:

- Capture symptoms (free text and/or guided input)
- Suggest a likely pathway (ranked is fine)
- Assign urgency (emergency / urgent / routine)
- Decide on the type of consultation from a set list of supported types (check-up / cardiography / first-appointment / …)
- Provide clear next steps

# Output (for hospital integration)

Your triage should output something that a hospital system could consume (scheduling / contact center / EHR).

Keep it simple; include:

- consultationType: the type of consultation that might map the hospital’s internal scheduling system
- urgency (emergency / urgent / routine)
- suggested specialty/pathway (one is fine)
- what should happen next (e.g. emergency instructions vs scheduling)
- an id so it can be stored/referenced later

Example:

```json
{
  "id": "...",
  "urgency": "urgent",
  "pathway": "Cardiology",
  "next": "schedule",
  "consultationType": "check-up",
}
```