import os
import json
import urllib.request
import urllib.error
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.behavioral_engine import calculate_behavioral_metrics


def generate_mentorship_advice(user_id: int, db: Session) -> str:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "User session context not found. Please log in again."

    # 1. Fetch active DNA profile metrics from LOOP 1
    dna = calculate_behavioral_metrics(user_id, db)
    if not dna:
        return "Unable to calculate behavioral telemetry. Please synchronize your repositories first."

    target = user.target_role or "Fullstack Developer"
    alignment = dna["career_alignment_score"]
    severity = dna["severity_level"]
    rpg_title = dna["developer_role_title"]
    
    # 2. Check for active API credentials (AI Mode)
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            # Safe asynchronous standard REST completion call to OpenAI using urllib
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "DualLoop-AI-Mentor"
            }
            prompt = (
                f"You are the DualLoop AI Mentor, an active, supportive, and highly technical developer coach.\n"
                f"Analyze this developer profile:\n"
                f"- Declared Target Career Role: {target}\n"
                f"- Deduced Observed Class: {rpg_title}\n"
                f"- Career Goal Alignment Score: {alignment}%\n"
                f"- Activity Inactivity Severity: {severity}\n"
                f"- UI/UX Expression: {dna['ui_ux_expression']}%\n"
                f"- Logic & Algorithms: {dna['logic_algorithms']}%\n"
                f"- Data Integrity: {dna['data_integrity']}%\n"
                f"- DevOps & Config: {dna['devops_config']}%\n"
                f"- Velocity & Endurance: {dna['velocity_endurance']}%\n\n"
                f"Draft a motivational, professional mentorship report. Include:\n"
                f"1. A direct, honest evaluation of their observed actions vs declared goal.\n"
                f"2. Practical guidelines to level up their alignment.\n"
                f"3. 3 specific technical Git commit actions they can perform today to balance their radar dimensions."
            )
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
            
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"]
        except Exception as e:
            print("AI LLM call failed, falling back to local semantic parser:", e)

    # 3. High-Fidelity Local Semantic Parser Fallback (100% Reliable Local Mode)
    
    # Career Alignment Audit
    audit_text = ""
    if alignment >= 75.0:
        audit_text = (
            f"🎯 Excellent work! Your actual coding actions align beautifully at **{alignment}%** with your target goal of **{target}**. "
            f"Your repository commits strongly display a deep focus on **{rpg_title}** traits, demonstrating a high consistency between intention and reality."
        )
    elif alignment >= 50.0:
        audit_text = (
            f"⚖️ You have a moderate goal alignment score of **{alignment}%**. While your declared goal is **{target}**, "
            f"your coding velocity is currently leaning towards **{rpg_title}** properties. "
            f"You are doing solid work, but a small target shift or dedicated language focus will help harmonize your developer profile."
        )
    else:
        audit_text = (
            f"⚠️ **Career Drift Detected ({alignment}% Alignment)**!\n"
            f"You have stated your target path as **{target}**, but your actual git commit telemetry is predominantly oriented around **{rpg_title}** file footprints. "
            f"There is a visible mismatch between what you intend to learn and what you are committing to repository branches. Let's redirect this drift!"
        )

    # Severity & Inactivity Heuristics
    severity_text = ""
    if severity == "Normal":
        severity_text = (
            "🟢 **Severity Status: Normal**. Your commit pacing is active and healthy. "
            "You are maintaining a reliable contribution loop, keeping your momentum strong and avoiding long gaps."
        )
    elif severity == "Low-Moderate":
        severity_text = (
            "🟡 **Severity Status: Low-Moderate**. You are actively coding, but your high career drift creates a slight cognitive friction. "
            "Focusing your next commits directly on your target stack will easily bring you back into the green zone."
        )
    elif severity == "Moderate":
        severity_text = (
            "🟠 **Severity Status: Moderate**. We detected a drop in commit velocity. "
            "A lapse in contributions or high inactivity breaks learning consistency. Let's push a quick commit to restart your streak!"
        )
    else:
        severity_text = (
            "🔴 **Severity Status: High / Critical**. You are showing high code silence or complete alignment drift. "
            "Procrastination or lack of focus can stall your technical growth. Let's tackle one small item today to break the block."
        )

    # Level-Up technical steps
    steps = []
    if target == "Data Scientist":
        steps = [
            "Initialize a Python Jupyter Notebook (`.ipynb`) in your repository. Use `pandas` and `numpy` to ingest and summarize a local data source.",
            "Write a script that leverages `matplotlib` or `seaborn` to plot distributions, and commit the visualized figures to your repository.",
            "Reduce frontend changes. Focus your database schemas around statistical indexes and data schemas rather than cosmetic UI tags."
        ]
    elif target == "AI Engineer":
        steps = [
            "Create an integration model wrapper in Python. Connect to a local HuggingFace or OpenAI endpoint and print parsed structural JSON outputs.",
            "Add a robust input-validation schema using Pydantic or FastAPI dependency injection to safeguard prompt parameters.",
            "Set up a shell script or Dockerfile config to bundle and test your LLM pipeline, boosting your DevOps radar dimension."
        ]
    elif target == "Frontend Developer":
        steps = [
            "Refactor a Next.js component to separate layout markup from fetch queries, introducing stateful loading skeletons.",
            "Add styling tokens or global CSS theme utilities using Tailwind to achieve a clean, borderless glassmorphic UI.",
            "Incorporate responsive viewport testing hooks, and log UI component mount performance into your frontend module."
        ]
    elif target == "Backend Developer":
        steps = [
            "Integrate FastAPI `Depends(get_db)` dynamic generator containers to securely handle database transaction boundaries.",
            "Refactor an N+1 repository database lookup query to use bulk SQL filters or `.in_()` checks, decreasing latency.",
            "Code unit tests to mock and validate API route error statuses, ensuring a robust test-coverage footprint."
        ]
    else: # Fullstack Developer / Fallback
        steps = [
            "Create a clean split in your project: a backend service layer (`app/services`) separate from your rendering pages.",
            "Code an API fetch hook in React that stores parameters securely in `sessionStorage` and cleans up browser query fields.",
            "Ensure database schemas use foreign key constraints to model relational properties without duplicating data points."
        ]

    steps_markdown = "\n".join(f"* `[ ]` **Step {i+1}**: {step}" for i, step in enumerate(steps))

    # Compile the final markdown mentorship advice
    markdown_report = f"""### ♾️ DualLoop AI Behavioral Mentorship

{audit_text}

---

### 🛡️ Severity & Telemetry Diagnostics
{severity_text}

---

### 🛠️ Daily Level-Up Action Checklist
{steps_markdown}

---

### 💡 Mentor's Coaching Words
> *"Consistency beats intensity. Writing 5 lines of code every day builds a neural pattern. Committing daily builds your career. Your target role as a **{target}** is closer than you think—align your actions today, and the rest will follow."*
"""
    return markdown_report
