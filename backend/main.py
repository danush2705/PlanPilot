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
import re
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

# Smart Mock Data Generator
def generate_smart_mock_data(user_input: str) -> PlanResponse:
    """
    Generate relevant mock data based on user input keywords.
    Used as fallback when all LLM models fail.
    """
    today = datetime.now()
    input_lower = user_input.lower()
    
    # Detect project type from keywords
    project_type = 'generic_web'
    if any(word in input_lower for word in ['fitness', 'workout', 'exercise', 'health', 'gym']):
        project_type = 'fitness_app'
    elif any(word in input_lower for word in ['ecommerce', 'e-commerce', 'shop', 'store', 'sell', 'buy', 'product']):
        project_type = 'ecommerce'
    elif any(word in input_lower for word in ['portfolio', 'personal', 'resume', 'cv']):
        project_type = 'portfolio'
    elif any(word in input_lower for word in ['marketing', 'campaign', 'advertis', 'promo']):
        project_type = 'marketing'
    elif any(word in input_lower for word in ['mobile', 'app', 'ios', 'android']):
        project_type = 'mobile_app'
    
    # Extract timeline (default to 8 weeks if not found)
    timeline_weeks = 8
    timeline_match = re.search(r'(\d+)\s*(month|week|day)', input_lower)
    if timeline_match:
        duration = int(timeline_match.group(1))
        unit = timeline_match.group(2)
        if 'month' in unit:
            timeline_weeks = duration * 4
        elif 'week' in unit:
            timeline_weeks = duration
        elif 'day' in unit:
            timeline_weeks = max(1, duration // 7)
    
    # Project templates
    templates = {
        'fitness_app': {
            'projectName': 'Fitness Tracking Mobile Application',
            'executiveSummary': f'A comprehensive mobile fitness application designed to help users track workouts, monitor progress, and achieve health goals. The project will be delivered over {timeline_weeks} weeks with a focus on user engagement and data visualization.',
            'keyMilestones': [
                'User Authentication & Profile Setup Complete',
                'Workout Logging Module Implemented',
                'Progress Tracking & Charts Integration',
                'Social Features & Sharing Enabled',
                'Testing & App Store Deployment'
            ],
            'technologyStack': [
                TechnologyStack(component='Mobile App', technology='React Native', rationale='Cross-platform development for iOS and Android with native performance'),
                TechnologyStack(component='Backend API', technology='Node.js + Express', rationale='Fast, scalable backend for real-time workout data synchronization'),
                TechnologyStack(component='Database', technology='MongoDB', rationale='Flexible schema for diverse workout types and user data'),
                TechnologyStack(component='Cloud Storage', technology='AWS S3', rationale='Reliable storage for user photos and progress images')
            ],
            'resourceSuggestions': ['1x Mobile Developer (React Native)', '1x Backend Developer', '1x UI/UX Designer', '1x QA Tester'],
            'tasks': [
                ('User Authentication System', 5, 'Mobile Developer'),
                ('Workout Logging Interface', 7, 'Mobile Developer'),
                ('Backend API Development', 10, 'Backend Developer'),
                ('Progress Charts & Analytics', 7, 'Mobile Developer'),
                ('Social Features Integration', 5, 'Mobile Developer'),
                ('Testing & Bug Fixes', 7, 'QA Tester')
            ]
        },
        'ecommerce': {
            'projectName': 'E-Commerce Platform Development',
            'executiveSummary': f'A modern e-commerce platform enabling online product sales with secure payment processing, inventory management, and customer analytics. Development timeline spans {timeline_weeks} weeks with focus on security and user experience.',
            'keyMilestones': [
                'Product Catalog & Search Functionality',
                'Shopping Cart & Checkout System',
                'Payment Gateway Integration',
                'Order Management Dashboard',
                'Launch & Marketing Integration'
            ],
            'technologyStack': [
                TechnologyStack(component='Frontend', technology='React + Next.js', rationale='SEO-friendly server-side rendering for better product discoverability'),
                TechnologyStack(component='Backend', technology='Node.js + Express', rationale='Scalable API for handling product and order management'),
                TechnologyStack(component='Database', technology='PostgreSQL', rationale='Reliable relational database for transactional data integrity'),
                TechnologyStack(component='Payment', technology='Stripe', rationale='Secure, PCI-compliant payment processing with global support')
            ],
            'resourceSuggestions': ['1x Full-Stack Developer', '1x Frontend Developer', '1x Backend Developer', '1x UI/UX Designer'],
            'tasks': [
                ('Product Catalog Setup', 7, 'Backend Developer'),
                ('Shopping Cart Implementation', 5, 'Frontend Developer'),
                ('Payment Gateway Integration', 7, 'Backend Developer'),
                ('Order Management System', 7, 'Full-Stack Developer'),
                ('Admin Dashboard', 7, 'Frontend Developer'),
                ('Testing & Security Audit', 7, 'QA Tester')
            ]
        },
        'portfolio': {
            'projectName': 'Personal Portfolio Website',
            'executiveSummary': f'A professional portfolio website showcasing projects, skills, and experience. Clean, modern design with fast loading times and mobile responsiveness. Completion targeted for {timeline_weeks} weeks.',
            'keyMilestones': [
                'Design & Wireframing Complete',
                'Homepage & About Section',
                'Projects Gallery Implementation',
                'Contact Form & Integration',
                'Deployment & SEO Optimization'
            ],
            'technologyStack': [
                TechnologyStack(component='Frontend', technology='Next.js', rationale='Static site generation for blazing-fast performance and SEO'),
                TechnologyStack(component='Styling', technology='Tailwind CSS', rationale='Utility-first CSS for rapid, responsive design'),
                TechnologyStack(component='Hosting', technology='Vercel', rationale='Seamless deployment with automatic HTTPS and CDN'),
                TechnologyStack(component='CMS', technology='Contentful', rationale='Easy content management without code changes')
            ],
            'resourceSuggestions': ['1x Full-Stack Developer', '1x UI/UX Designer'],
            'tasks': [
                ('Design & Wireframes', 3, 'UI/UX Designer'),
                ('Homepage Development', 5, 'Full-Stack Developer'),
                ('Projects Gallery', 5, 'Full-Stack Developer'),
                ('Contact Form Setup', 3, 'Full-Stack Developer'),
                ('SEO & Performance Optimization', 3, 'Full-Stack Developer'),
                ('Deployment & Testing', 2, 'Full-Stack Developer')
            ]
        },
        'marketing': {
            'projectName': 'Marketing Campaign Planning',
            'executiveSummary': f'A comprehensive marketing campaign designed to increase brand awareness and drive conversions. Strategic planning and execution over {timeline_weeks} weeks with measurable KPIs and multi-channel approach.',
            'keyMilestones': [
                'Market Research & Audience Analysis',
                'Campaign Strategy & Content Plan',
                'Creative Assets Development',
                'Campaign Launch & Monitoring',
                'Performance Analysis & Optimization'
            ],
            'technologyStack': [
                TechnologyStack(component='Analytics', technology='Google Analytics', rationale='Comprehensive tracking of campaign performance and user behavior'),
                TechnologyStack(component='Email Marketing', technology='Mailchimp', rationale='Automated email campaigns with A/B testing capabilities'),
                TechnologyStack(component='Social Media', technology='Hootsuite', rationale='Centralized social media management and scheduling'),
                TechnologyStack(component='Ad Management', technology='Google Ads', rationale='Targeted advertising with detailed performance metrics')
            ],
            'resourceSuggestions': ['1x Marketing Manager', '1x Content Creator', '1x Graphic Designer', '1x Data Analyst'],
            'tasks': [
                ('Market Research', 5, 'Marketing Manager'),
                ('Campaign Strategy Development', 5, 'Marketing Manager'),
                ('Content Creation', 10, 'Content Creator'),
                ('Creative Assets Design', 7, 'Graphic Designer'),
                ('Campaign Launch', 3, 'Marketing Manager'),
                ('Performance Monitoring', 10, 'Data Analyst')
            ]
        },
        'mobile_app': {
            'projectName': 'Mobile Application Development',
            'executiveSummary': f'A feature-rich mobile application for iOS and Android platforms. Focus on intuitive user experience, performance optimization, and scalability. Development timeline of {timeline_weeks} weeks with iterative testing.',
            'keyMilestones': [
                'Requirements & Wireframing',
                'Core Features Implementation',
                'Backend Integration',
                'Testing & Bug Fixes',
                'App Store Submission'
            ],
            'technologyStack': [
                TechnologyStack(component='Mobile Framework', technology='React Native', rationale='Single codebase for both iOS and Android with native performance'),
                TechnologyStack(component='Backend', technology='Firebase', rationale='Real-time database and authentication with minimal backend code'),
                TechnologyStack(component='State Management', technology='Redux', rationale='Predictable state management for complex app logic'),
                TechnologyStack(component='Push Notifications', technology='OneSignal', rationale='Reliable push notifications with segmentation support')
            ],
            'resourceSuggestions': ['2x Mobile Developers', '1x Backend Developer', '1x UI/UX Designer', '1x QA Tester'],
            'tasks': [
                ('App Architecture Setup', 5, 'Mobile Developer'),
                ('UI Implementation', 10, 'Mobile Developer'),
                ('Backend Integration', 7, 'Backend Developer'),
                ('Feature Development', 14, 'Mobile Developer'),
                ('Testing & QA', 7, 'QA Tester'),
                ('App Store Deployment', 3, 'Mobile Developer')
            ]
        },
        'generic_web': {
            'projectName': 'Web Application Development',
            'executiveSummary': f'A modern web application built with industry best practices and scalable architecture. The project encompasses design, development, testing, and deployment over {timeline_weeks} weeks with focus on user experience and performance.',
            'keyMilestones': [
                'Requirements & Design Complete',
                'Frontend Development Phase',
                'Backend & Database Setup',
                'Integration & Testing',
                'Production Deployment'
            ],
            'technologyStack': [
                TechnologyStack(component='Frontend', technology='React', rationale='Component-based architecture for maintainable and reusable UI'),
                TechnologyStack(component='Backend', technology='Node.js', rationale='JavaScript everywhere with high performance async I/O'),
                TechnologyStack(component='Database', technology='PostgreSQL', rationale='Robust relational database with ACID compliance'),
                TechnologyStack(component='Hosting', technology='AWS', rationale='Scalable cloud infrastructure with global reach')
            ],
            'resourceSuggestions': ['1x Project Manager', '2x Full-Stack Developers', '1x UI/UX Designer', '1x QA Engineer'],
            'tasks': [
                ('Project Planning', 3, 'Project Manager'),
                ('UI/UX Design', 7, 'UI/UX Designer'),
                ('Frontend Development', 14, 'Full-Stack Developer'),
                ('Backend Development', 14, 'Full-Stack Developer'),
                ('Integration & Testing', 7, 'QA Engineer'),
                ('Deployment', 3, 'Full-Stack Developer')
            ]
        }
    }
    
    # Get template for detected project type
    template = templates.get(project_type, templates['generic_web'])
    
    # Build Gantt chart data
    gantt_tasks = []
    gantt_links = []
    current_date = today
    
    for idx, (task_name, duration, owner) in enumerate(template['tasks'], 1):
        gantt_tasks.append(
            GanttTask(
                id=idx,
                text=task_name,
                start_date=current_date.strftime("%Y-%m-%d"),
                duration=duration,
                progress=0,
                owner=owner
            )
        )
        if idx > 1:
            gantt_links.append(GanttLink(id=idx-1, source=idx-1, target=idx, type="0"))
        current_date += timedelta(days=duration)
    
    # Create and return the plan
    return PlanResponse(
        projectName=template['projectName'],
        executiveSummary=template['executiveSummary'],
        keyMilestones=template['keyMilestones'],
        technologyStack=template['technologyStack'],
        resourceSuggestions=template['resourceSuggestions'],
        ganttData=GanttData(data=gantt_tasks, links=gantt_links)
    )

# API Endpoints
@app.post("/generate-plan")
async def generate_plan(chat_history: ChatHistory):
    """
    Generate a comprehensive project plan with dashboard data using Llama 3.3 70B via Groq API.
    Validates input quality and rejects baseless queries.
    """
    # Get current date for the system prompt
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # SIMPLE RULE-BASED VALIDATION (No LLM calls - saves tokens!)
    user_input = chat_history.messages[-1].content.strip().lower() if chat_history.messages else ''
    
    # List of invalid patterns (greetings and meaningless words)
    invalid_patterns = [
        'hi', 'hello', 'hey', 'yo', 'sup', "what's up", 'how are you',
        'test', 'testing', '123', 'abc', 'asdf', 'qwerty'
    ]
    
    # Check if input is too short
    if len(user_input) < 5:
        raise HTTPException(
            status_code=400,
            detail="Please provide a clear project description. For example: 'Build a mobile fitness tracking app in 3 months' or 'Create an e-commerce website for selling handmade crafts'. Include details about what you want to build, the timeline, and key features."
        )
    
    # Check if input is just a greeting or meaningless word
    if user_input in invalid_patterns:
        raise HTTPException(
            status_code=400,
            detail="Please provide a clear project description. For example: 'Build a mobile fitness tracking app in 3 months' or 'Create an e-commerce website for selling handmade crafts'. Include details about what you want to build, the timeline, and key features."
        )
    
    # Check if input is just random characters (no spaces and no common project words)
    if ' ' not in user_input and len(user_input) < 15:
        common_words = ['build', 'create', 'develop', 'make', 'design', 'app', 'website', 
                       'platform', 'system', 'project', 'plan', 'launch', 'organize', 
                       'campaign', 'portfolio', 'event']
        has_common_word = any(word in user_input for word in common_words)
        if not has_common_word:
            raise HTTPException(
                status_code=400,
                detail="Please provide a clear project description. For example: 'Build a mobile fitness tracking app in 3 months' or 'Create an e-commerce website for selling handmade crafts'. Include details about what you want to build, the timeline, and key features."
            )
    
    # ENHANCED PROJECT PLANNING PROMPT
    system_prompt = f"""You are an expert project planning AI. Generate a highly customized, unique project plan based on the user's specific input.

Current date: {current_date}. Calculate all dates relative to this date.

**CRITICAL INSTRUCTIONS:**
1. **ANALYZE THE INPUT CAREFULLY**: Read the user's project description and extract:
   - Project type and goal
   - Timeline (if mentioned, otherwise infer realistic timeline)
   - Key features or requirements
   - Team size or constraints
   - Technology preferences

2. **GENERATE UNIQUE, RELEVANT CONTENT**:
   - Executive Summary: Write a UNIQUE 3-4 sentence summary specifically about THIS project, not generic text
   - Key Milestones: Create 4-6 milestones that are SPECIFIC to this project type and timeline
   - Technology Stack: Choose technologies that are ACTUALLY APPROPRIATE for this specific project
   - Resources: Allocate roles based on the project's actual needs and timeline
   - Timeline: Calculate realistic dates based on project complexity and mentioned timeline

3. **ENSURE VARIETY**: Every report should be different. Use the project details to create unique content.

**Output Structure:**
{{
  "projectName": "Specific name based on user's project (e.g., 'Fitness Tracking Mobile App' not 'Mobile App')",
  "executiveSummary": "3-4 unique sentences describing THIS specific project's goal, approach, timeline, and expected outcomes. Be specific to the project type.",
  "keyMilestones": [
    "Milestone 1 specific to this project",
    "Milestone 2 specific to this project",
    "Milestone 3 specific to this project",
    "Milestone 4 specific to this project"
  ],
  "technologyStack": [
    {{
      "component": "Component relevant to THIS project",
      "technology": "Technology appropriate for THIS specific project type",
      "rationale": "Why this tech makes sense for THIS particular project"
    }}
  ],
  "resourceSuggestions": [
    "Roles needed for THIS specific project and timeline"
  ],
  "ganttData": {{
    "data": [
      {{
        "id": 1,
        "text": "Task specific to this project",
        "start_date": "YYYY-MM-DD (calculated from current date and project timeline)",
        "duration": "Realistic duration for this task type",
        "progress": 0,
        "owner": "Role appropriate for this task"
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

**EXAMPLES OF GOOD vs BAD:**

BAD (Generic): "This project aims to build a modern application with best practices."
GOOD (Specific): "This fitness tracking mobile app will enable users to log workouts, track progress with visual charts, and share achievements with friends, targeting health-conscious millennials over a 3-month development cycle."

BAD (Generic): "Design Phase Complete"
GOOD (Specific): "User Interface Design for Workout Logging and Progress Dashboard Complete"

BAD (Generic): "Frontend: React - Popular framework"
GOOD (Specific): "Mobile App: React Native - Cross-platform development for iOS/Android with native performance for smooth workout tracking animations"

**CRITICAL RULES:**
1. Return ONLY valid JSON
2. Make EVERY field unique and relevant to the user's input
3. Use realistic timelines based on project complexity
4. Choose appropriate technologies for the project type
5. Create 6-10 Gantt tasks with logical dependencies
6. Ensure all dates are sequential and realistic
7. Match resource allocation to project scope and timeline

Analyze the user's input below and create a UNIQUE, HIGHLY RELEVANT project plan:"""

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
    
    # MODEL FALLBACK CHAIN - Try models in order of quality
    models_to_try = [
        ("llama-3.3-70b-versatile", 0.3),  # Best quality, try first
        ("llama-3.1-8b-instant", 0.3),     # Faster, separate rate limit
        ("mixtral-8x7b-32768", 0.3)        # Alternative with good quality
    ]
    
    last_error = None
    
    for model_name, temperature in models_to_try:
        try:
            print(f"Attempting to use model: {model_name}")
            
            chat_completion = client.chat.completions.create(
                messages=formatted_messages,
                model=model_name,
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            # Parse the JSON response
            response_content = chat_completion.choices[0].message.content
            plan_data = json.loads(response_content)
            
            print(f"Successfully generated plan using model: {model_name}")
            
            # Validate and return
            return PlanResponse(**plan_data)
            
        except Exception as e:
            last_error = e
            error_message = str(e)
            print(f"Model {model_name} failed: {error_message}")
            
            # Try next model for any error (rate limit, validation, etc.)
            # This ensures we try all 3 models before giving up
            if "rate_limit" in error_message.lower() or "429" in error_message:
                print(f"Rate limit hit for {model_name}, trying next model...")
            elif "validation" in error_message.lower() or "pydantic" in error_message.lower():
                print(f"Validation error with {model_name}, trying next model...")
            else:
                print(f"Error with {model_name}, trying next model...")
            
            # Always continue to try the next model
            continue
    
    # If all models fail, use smart fallback mock data
    print(f"All models failed, using smart fallback mock data. Last error: {last_error}")
    
    # Generate relevant mock data based on user input
    user_input = chat_history.messages[-1].content if chat_history.messages else "web application"
    mock_plan = generate_smart_mock_data(user_input)
    
    print(f"Generated smart mock data for project type based on: {user_input[:50]}...")
    
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
