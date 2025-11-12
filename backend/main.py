# LyzrFlow Backend - FastAPI Server
# Professional Project Dashboard with Comprehensive Planning

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from xhtml2pdf import pisa
from jinja2 import Environment, FileSystemLoader
from io import BytesIO
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Pydantic Models for New Complex Structure
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatHistory(BaseModel):
    messages: List[ChatMessage]

class GanttTask(BaseModel):
    id: int
    text: str
    start_date: str
    duration: int
    progress: float
    owner: str

class GanttLink(BaseModel):
    id: int
    source: int
    target: int
    type: str

class GanttData(BaseModel):
    data: List[GanttTask]
    links: List[GanttLink]

class TechnologyStack(BaseModel):
    component: str
    technology: str
    rationale: str

class PlanResponse(BaseModel):
    projectName: str
    executiveSummary: str
    keyMilestones: List[str]
    technologyStack: List[TechnologyStack]
    resourceSuggestions: List[str]
    ganttData: GanttData

class ChatResponse(BaseModel):
    assistantReply: str
    progress: int
    isSufficient: bool

# Initialize FastAPI app
app = FastAPI(title="LyzrFlow API", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Setup Jinja2 Environment for PDF templates
template_env = Environment(loader=FileSystemLoader('.'))
REPORT_TEMPLATE = template_env.get_template("report_template.html")

# API Endpoints
@app.post("/chat", response_model=ChatResponse)
async def chat(chat_history: ChatHistory):
    """
    Intelligent chat endpoint that guides users through project planning.
    Returns conversational replies and indicates when enough info is gathered.
    """
    # Get current date for context
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Create intelligent chat system prompt with STRICT example enforcement
    system_prompt = f"""You are 'LyzrFlow', an AI project planner.

Current date: {current_date}

**YOUR #1 RULE:** When you ask the user a question, you **MUST** provide 2-3 brief, concrete examples in parentheses `()` to guide them. This is your most important task.

**YOUR #2 RULE (CHAT FLOW):** You must ask **only one question at a time.** Do not ask for 'goal' and 'timeline' in the same message. This makes the conversation feel robotic.

**Example Good Reply:** 'That's a great project! To start, what's the main goal of this portfolio? (e.g., get a job, showcase art, be a personal blog)'

**Example Bad Reply:** 'What is the main goal? and 2) What is the timeline?'

**YOUR GOAL:**
Your overall goal is to gather 3-4 key pieces of information (Goal, Timeline, Features, Team Size). You must do this by asking *one question at a time*, with examples.

**GREETING DETECTION (CRITICAL):**
If the user's latest message is ONLY a greeting (like 'hi', 'hello', 'how are you') or any other query that is clearly NOT a project description:
- Reply politely (e.g., 'Hello! What project can I help you plan?')
- Set progress to 0
- Set isSufficient to false

**CONVERSATION FLOW:**
1. When user gives a project idea, acknowledge it warmly and ask ONE follow-up question with examples in parentheses.
   Example: 'That sounds exciting! What's the main goal of this app? (e.g., help users track fitness, connect with friends, manage tasks)'

2. After they answer, ask the NEXT question (one at a time) with examples.
   Example: 'Great! What's your timeline for this project? (e.g., 2 months, 6 months, 1 year)'

3. Continue asking one question at a time until you have: Goal, Timeline, Features, and Team Size.

**PROGRESS TRACKING:**
Estimate your progress as a percentage (0-100):
- 0%: No information or just greetings
- 25%: Have project goal
- 50%: Have project goal + timeline
- 75%: Have project goal + timeline + team size
- 100%: Have all 4 key pieces

**STOP RULE:**
After you have all the key info, you **must** stop and give your concluding statement (e.g., 'Great, I have all the details... please click Generate Report.').

**OUTPUT FORMAT:**
You must return ONLY a valid JSON object with this exact structure:
{{
  "assistantReply": "Your conversational reply here",
  "progress": 0,
  "isSufficient": false
}}

IMPORTANT: 
- progress must be 100 if you are giving your concluding statement
- isSufficient must be true if progress is 100, otherwise it must be false
- You must NEVER set isSufficient to true for greetings, empty messages, or non-project queries
- ALWAYS include examples in parentheses when asking questions
- ALWAYS ask only ONE question at a time

Return ONLY the JSON - no markdown, no code blocks, no extra text."""

    # Format messages for Groq
    formatted_messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add user conversation history
    for msg in chat_history.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    try:
        # Call Groq with Llama 3.3 70B
        chat_completion = client.chat.completions.create(
            messages=formatted_messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        response_content = chat_completion.choices[0].message.content
        chat_data = json.loads(response_content)
        
        # Validate and return
        return ChatResponse(**chat_data)
        
    except Exception as e:
        # Fallback response if API fails
        print(f"Error calling Groq API for chat: {e}")
        return ChatResponse(
            assistantReply="I'm here to help you plan your project! Could you tell me what you'd like to build?",
            progress=0,
            isSufficient=False
        )

@app.post("/generate-plan")
async def generate_plan(chat_history: ChatHistory):
    """
    Generate a comprehensive project plan with dashboard data using Llama 3.1 70B via Groq API.
    Includes two-stage validation to reject invalid inputs.
    """
    # Validation guard (safety net)
    if len(chat_history.messages) < 3:
        raise HTTPException(
            status_code=400,
            detail="Not enough information to generate a report. Please describe your project first."
        )
    
    # Get current date for the system prompt
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Create high-fidelity system prompt that reads entire conversation
    system_prompt = f"""You are a world-class project planning AI. Your **sole and entire task** is to generate a single, complex JSON object based on the provided conversation.

Current date: {current_date}. Calculate all dates relative to this date.

**CRITICAL INSTRUCTIONS:**
1. You will be given a *complete conversation history* in the messages array. You **must** read and synthesize this *entire history* from the beginning to the end to understand the full context.
2. **Pay close attention to user corrections:** If a user says 'build a portfolio' and later in the chat says 'no, let's make it an e-commerce site', you **must** use the *latest* information ('e-commerce site'). Your report must reflect the *final, settled-upon plan* from the conversation.
3. **Use all details:** Incorporate *all* specific details the user mentioned (timeline, team size, key features, technology preferences, constraints) into your plan.

**VALIDATION (Stage 1):**
First, check if the conversation contains a valid plan. If the input is invalid (e.g., just 'hi', 'hello', 'sdjfhsk', or insufficient information):
- STOP immediately
- Return ONLY this JSON: {{"error": "Invalid input. Please provide a clear project goal, timeline, and key features first."}}

**JSON OUTPUT (Stage 2 - if valid):**
If the input is valid, generate the full JSON object based *only* on the complete conversation history.

You MUST return ONLY a valid JSON object with this EXACT structure:

{{
  "projectName": "Short Project Name (e.g., 'Portfolio Website Build')",
  "executiveSummary": "2-3 sentence high-level overview of the project's goal, duration, and key components.",
  "keyMilestones": [
    "Major checkpoint 1 (e.g., 'UI/UX Design Complete')",
    "Major checkpoint 2 (e.g., 'Frontend V1 Deployed')",
    "Major checkpoint 3"
  ],
  "technologyStack": [
    {{
      "component": "Component name (e.g., 'Frontend', 'Backend', 'Database')",
      "technology": "Technology choice (e.g., 'React', 'FastAPI', 'PostgreSQL')",
      "rationale": "Brief justification (e.g., 'React for component-based UI and rich ecosystem')"
    }}
  ],
  "resourceSuggestions": [
    "1x UI/UX Designer",
    "1x Frontend Developer",
    "1x Backend Developer"
  ],
  "ganttData": {{
    "data": [
      {{
        "id": 1,
        "text": "Task Name",
        "start_date": "YYYY-MM-DD",
        "duration": 5,
        "progress": 0,
        "owner": "Role/Unassigned"
      }}
    ],
    "links": [
      {{
        "id": 1,
        "source": 1,
        "target": 2,
        "type": "0"
      }}
    ]
  }}
}}

CRITICAL RULES:
1. **READ THE ENTIRE CONVERSATION:** Analyze all messages from start to finish. Do not skip any messages.
2. **USE LATEST INFORMATION:** If the user corrects or changes their mind, use the most recent information.
3. **INCORPORATE ALL DETAILS:** Use every specific detail mentioned (timeline, team size, features, tech stack, constraints).
4. Return ONLY the JSON - no markdown, no code blocks, no extra text
5. projectName: Short, professional name reflecting the FINAL project idea from the conversation
6. executiveSummary: 2-3 sentences covering goal, timeline, and scope based on the COMPLETE conversation
7. keyMilestones: 3-5 major project checkpoints derived from the conversation
8. technologyStack: 3-5 key technology components with component name, technology choice, and rationale based on project needs and technologies mentioned in conversation
9. resourceSuggestions: List required roles/resources inferred from goal, timeline, and team size mentioned
10. ganttData.data: 5-10 tasks with:
    - Sequential IDs starting from 1
    - Realistic task names based on the project discussed
    - start_date in YYYY-MM-DD format
    - duration in days (integer) - realistic based on timeline discussed
    - progress: 0 (not started)
    - owner: Role name or "Unassigned"
11. ganttData.links: Task dependencies where:
    - type "0" = finish-to-start
    - source and target are task IDs
    - Infer logical dependencies (e.g., design before development)
12. Ensure dates are realistic and sequential based on the timeline discussed
13. Make the plan comprehensive, professional, and ACCURATE to the conversation

**NOW:** Read the complete conversation history below, synthesize all information (paying special attention to corrections), and generate the project plan."""

    # Format messages for Groq
    formatted_messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add user conversation history
    for msg in chat_history.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    try:
        # Call Groq with Llama 3.3 70B (updated model)
        chat_completion = client.chat.completions.create(
            messages=formatted_messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        response_content = chat_completion.choices[0].message.content
        plan_data = json.loads(response_content)
        
        # Validate and return
        return PlanResponse(**plan_data)
        
    except Exception as e:
        # Fallback to comprehensive mock data if Groq API fails
        print(f"Error calling Groq API: {e}")
        
        # Calculate dates for mock data
        today = datetime.now()
        
        mock_plan = PlanResponse(
            projectName="Sample Project Plan",
            executiveSummary="A comprehensive project to deliver a modern solution within 4 weeks. The project includes design, development, testing, and deployment phases with clear milestones and deliverables.",
            keyMilestones=[
                "Requirements & Design Complete",
                "Development Phase 1 Complete",
                "Testing & QA Complete",
                "Production Deployment"
            ],
            technologyStack=[
                TechnologyStack(
                    component="Frontend",
                    technology="React",
                    rationale="Component-based architecture for maintainable UI and rich ecosystem"
                ),
                TechnologyStack(
                    component="Backend",
                    technology="FastAPI",
                    rationale="High performance async framework with automatic API documentation"
                ),
                TechnologyStack(
                    component="Database",
                    technology="PostgreSQL",
                    rationale="Robust relational database with excellent data integrity"
                ),
                TechnologyStack(
                    component="Deployment",
                    technology="Docker",
                    rationale="Containerization for consistent deployment across environments"
                )
            ],
            resourceSuggestions=[
                "1x Project Manager",
                "1x UI/UX Designer",
                "2x Full-Stack Developers",
                "1x QA Engineer"
            ],
            ganttData=GanttData(
                data=[
                    GanttTask(id=1, text="Project Planning & Requirements", start_date=(today).strftime("%Y-%m-%d"), duration=3, progress=0, owner="Project Manager"),
                    GanttTask(id=2, text="UI/UX Design", start_date=(today + timedelta(days=3)).strftime("%Y-%m-%d"), duration=5, progress=0, owner="UI/UX Designer"),
                    GanttTask(id=3, text="Frontend Development", start_date=(today + timedelta(days=8)).strftime("%Y-%m-%d"), duration=7, progress=0, owner="Frontend Developer"),
                    GanttTask(id=4, text="Backend Development", start_date=(today + timedelta(days=8)).strftime("%Y-%m-%d"), duration=7, progress=0, owner="Backend Developer"),
                    GanttTask(id=5, text="Integration & Testing", start_date=(today + timedelta(days=15)).strftime("%Y-%m-%d"), duration=5, progress=0, owner="QA Engineer"),
                    GanttTask(id=6, text="Deployment & Launch", start_date=(today + timedelta(days=20)).strftime("%Y-%m-%d"), duration=2, progress=0, owner="DevOps")
                ],
                links=[
                    GanttLink(id=1, source=1, target=2, type="0"),
                    GanttLink(id=2, source=2, target=3, type="0"),
                    GanttLink(id=3, source=2, target=4, type="0"),
                    GanttLink(id=4, source=3, target=5, type="0"),
                    GanttLink(id=5, source=4, target=5, type="0"),
                    GanttLink(id=6, source=5, target=6, type="0")
                ]
            )
        )
        
        return mock_plan

@app.post("/generate-pdf")
async def generate_pdf_report(plan: PlanResponse):
    """
    Generates a PDF report using xhtml2pdf (Windows-compatible).
    """
    try:
        # 1. Render the HTML template with the project data
        html_out = REPORT_TEMPLATE.render(plan=plan)
        
        # 2. Convert HTML to PDF using xhtml2pdf
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_out, dest=pdf_buffer)
        
        if pisa_status.err:
            raise Exception("PDF generation failed")
        
        pdf_bytes = pdf_buffer.getvalue()
        
        # 3. Return the PDF as a response
        return Response(
            content=pdf_bytes,
            media_type='application/pdf',
            headers={'Content-Disposition': 'attachment; filename="LyzrFlow_Report.pdf"'}
        )
        
    except Exception as e:
        # If anything fails, log it and send a 500 error
        print(f"!!! PDF GENERATION FAILED: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the PDF report: {e}"
        )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "LyzrFlow API v2.0 - Professional Dashboard"}

