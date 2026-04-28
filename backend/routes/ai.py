from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
import google.generativeai as genai
from auth import get_current_user
from models.user import User
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class CandidateExplanationRequest(BaseModel):
    name: str
    experience: float
    qualification: str
    salary: float = 0
    score: float
    status: str

class ExplanationResponse(BaseModel):
    explanation: str

def generate_local_fallback(req: CandidateExplanationRequest) -> str:
    """
    Deterministic local fallback if Gemini API fails.
    """
    status_lower = req.status.lower()
    
    if "shortlisted" in status_lower:
        base = f"{req.name} is a strong candidate with {req.experience} years of experience and a high merit score of {req.score:.1f}."
        fit = f"Their qualification in {req.qualification} aligns perfectly with the role requirements."
        note = "The recommendation is based on a balanced evaluation of their technical expertise and career trajectory."
    elif "review" in status_lower:
        base = f"{req.name} (Exp: {req.experience} yrs) is currently in review for further verification."
        fit = "While they meet the minimum criteria, we are performing intersectional analysis to ensure complete merit alignment."
        note = "Further technical assessment or interview is recommended to validate role fit."
    else:
        base = f"{req.name} did not meet the competitive threshold for this specific hiring cycle."
        fit = f"With {req.experience} years of experience, they are a solid professional, but other candidates showed higher alignment with the specific score criteria."
        note = "We recommend keeping them in the talent pipeline for future roles that may better suit their profile."
        
    return f"{base}\n\n{fit}\n\n{note}\n\nNote: This is a system-generated summary based on available merit data."

@router.post("/explain-candidate", response_model=ExplanationResponse)
async def explain_candidate(
    req: CandidateExplanationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered explanation for a candidate using Gemini.
    """
    if not GEMINI_API_KEY:
        return ExplanationResponse(explanation=generate_local_fallback(req))

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        
        prompt = f"""
        You are a professional HR AI assistant for HireFlip, a platform focused on fair and explainable hiring.
        Provide a concise, professional, and encouraging hiring insight for the following candidate:
        
        Candidate Name: {req.name}
        Experience: {req.experience} years
        Qualification: {req.qualification}
        Merit Score: {req.score}/100
        Current Status: {req.status}
        
        The explanation must cover:
        1. Key strengths based on experience and score.
        2. Role fit and potential.
        3. Any areas for further investigation or slight concerns (be professional).
        4. Why the current status ({req.status}) was assigned.
        5. A brief note on why this is a fair evaluation (mention blind screening/anonymization if name looks like 'Candidate #').
        
        Keep it under 150 words. Use a professional tone.
        """
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            return ExplanationResponse(explanation=response.text)
        else:
            return ExplanationResponse(explanation=generate_local_fallback(req))

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return ExplanationResponse(explanation=generate_local_fallback(req))
