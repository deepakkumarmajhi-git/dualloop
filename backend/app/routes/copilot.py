from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.behavioral_snapshot import BehavioralSnapshot
from app.models.coding_challenge import CodingChallenge
from app.services.behavioral_engine import calculate_behavioral_metrics
from app.services.copilot import generate_mentorship_advice
from app.services.gemini import generate_gemini_challenge, evaluate_challenge_solution
from app.utils.security import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/copilot")


class UpdateGoalRequest(BaseModel):
    target_role: str


class SubmitSolutionRequest(BaseModel):
    solution_code: str


@router.get("/dna")
def get_developer_dna(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate DNA (calculates and stores XP as side-effect)
    dna = calculate_behavioral_metrics(current_user.id, db)
    
    # Load history snapshots
    snapshots = db.query(BehavioralSnapshot).filter(
        BehavioralSnapshot.user_id == current_user.id
    ).order_by(BehavioralSnapshot.calculated_at.asc()).all()
    
    history = [
        {
            "calculated_at": s.calculated_at,
            "consistency_score": s.consistency_score,
            "momentum_score": s.momentum_score
        }
        for s in snapshots
    ]
    
    return {
        "target_role": current_user.target_role,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url,
        "dna": dna,
        "history": history
    }


@router.post("/goal")
def update_target_role(
    req: UpdateGoalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update target career goal
    current_user.target_role = req.target_role
    db.commit()
    
    # Recompute DNA metrics with the new goal immediately
    dna = calculate_behavioral_metrics(current_user.id, db)
    
    return {
        "status": "success",
        "target_role": current_user.target_role,
        "dna": dna
    }


@router.get("/mentorship")
async def get_mentorship_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    advice = await generate_mentorship_advice(current_user.id, db)
    return {
        "advice": advice
    }


@router.get("/achievements")
def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    
    total_xp = (user.xp_ui_ux or 0) + (user.xp_logic or 0) + (user.xp_data or 0) + (user.xp_devops or 0) + (user.xp_velocity or 0)
    
    # Square-root level curves (Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP, etc.)
    next_level_xp = ((user.level or 1) * 10) ** 2
    prev_level_xp = (((user.level or 1) - 1) * 10) ** 2 if (user.level or 1) > 1 else 0
    
    xp_range = next_level_xp - prev_level_xp
    xp_earned_in_level = total_xp - prev_level_xp
    
    level_progress = 0.0
    if xp_range > 0:
        level_progress = min(100.0, round((xp_earned_in_level / xp_range) * 100, 1))
        
    # Badges Heuristics
    badges = []
    if (user.xp_logic or 0) >= 300:
        badges.append({"id": "logic_master", "title": "Logic Craftsman", "desc": "Achieved 300+ Algorithm & Logic XP", "icon": "⚡"})
    if (user.xp_ui_ux or 0) >= 300:
        badges.append({"id": "style_virtuoso", "title": "Styling Sorcerer", "desc": "Achieved 300+ UI/UX Expression XP", "icon": "🎨"})
    if (user.xp_data or 0) >= 300:
        badges.append({"id": "data_architect", "title": "Database Sage", "desc": "Achieved 300+ Data Integrity XP", "icon": "💾"})
    if (user.xp_devops or 0) >= 300:
        badges.append({"id": "infra_vanguard", "title": "Ops Commander", "desc": "Achieved 300+ DevOps & Infra XP", "icon": "🚀"})
    if (user.xp_velocity or 0) >= 400:
        badges.append({"id": "commit_marathoner", "title": "Velocity Titan", "desc": "Achieved 400+ Velocity XP", "icon": "🔥"})

    # Level baseline badges
    if (user.level or 1) >= 2:
        badges.append({"id": "level_2", "title": "Acolyte Coder", "desc": "Reached Level 2 in your journey", "icon": "🔰"})
    if (user.level or 1) >= 3:
        badges.append({"id": "level_3", "title": "Code Warrior", "desc": "Reached Level 3 in your journey", "icon": "⚔️"})

    return {
        "level": user.level or 1,
        "total_xp": total_xp,
        "xp_breakdown": {
            "ui_ux": user.xp_ui_ux or 0,
            "logic": user.xp_logic or 0,
            "data": user.xp_data or 0,
            "devops": user.xp_devops or 0,
            "velocity": user.xp_velocity or 0
        },
        "level_progress": level_progress,
        "next_level_xp": next_level_xp,
        "badges": badges
    }


@router.get("/challenge")
async def get_daily_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    
    # 1. Deduce their weakest telemetry radar slice
    dna = calculate_behavioral_metrics(user.id, db)
    dimensions = {
        "UI/UX Expression": dna.get("ui_ux_expression", 20.0),
        "Algorithms": dna.get("logic_algorithms", 20.0),
        "Data Integrity": dna.get("data_integrity", 20.0),
        "DevOps": dna.get("devops_config", 20.0),
        "Velocity": dna.get("velocity_endurance", 20.0),
    }
    weakest_dim = min(dimensions, key=dimensions.get)
    
    # 2. Check if a challenge already exists for today
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    challenge = db.query(CodingChallenge).filter(
        CodingChallenge.user_id == user.id,
        CodingChallenge.created_at == today_str
    ).first()
    
    if not challenge:
        # Generate new custom challenge using Gemini API
        c_data = await generate_gemini_challenge(weakest_dim, user.target_role or "Fullstack Developer")
        challenge = CodingChallenge(
            user_id=user.id,
            title=c_data["title"],
            description=c_data["description"],
            code_template=c_data["code_template"],
            test_criteria=c_data["test_criteria"],
            radar_dimension=weakest_dim,
            status="pending",
            created_at=today_str
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        
    return {
        "id": challenge.id,
        "title": challenge.title,
        "description": challenge.description,
        "code_template": challenge.code_template,
        "test_criteria": challenge.test_criteria,
        "radar_dimension": challenge.radar_dimension,
        "status": challenge.status
    }


@router.post("/challenge/submit")
async def submit_challenge(
    req: SubmitSolutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    challenge = db.query(CodingChallenge).filter(
        CodingChallenge.user_id == user.id,
        CodingChallenge.created_at == today_str
    ).first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No daily challenge found for today. Load the challenge first."
        )
        
    if challenge.status == "completed":
        return {
            "status": "already_completed",
            "feedback": "You have already completed today's coding challenge! Check back tomorrow for a new exercise.",
            "xp_awarded": 0
        }
        
    # Evaluate the user's solution using Gemini API
    res = await evaluate_challenge_solution(req.solution_code, challenge.test_criteria)
    
    xp_awarded = 0
    if res.get("status") == "success":
        # Mark as completed
        challenge.status = "completed"
        
        # Award bonus XP to matching dimension
        dim = challenge.radar_dimension
        bonus = 150
        if dim == "UI/UX Expression":
            user.xp_ui_ux = (user.xp_ui_ux or 0) + bonus
        elif dim == "Algorithms":
            user.xp_logic = (user.xp_logic or 0) + bonus
        elif dim == "Data Integrity":
            user.xp_data = (user.xp_data or 0) + bonus
        elif dim == "DevOps":
            user.xp_devops = (user.xp_devops or 0) + bonus
        elif dim == "Velocity":
            user.xp_velocity = (user.xp_velocity or 0) + bonus
            
        xp_awarded = bonus
        
        # Recalculate level
        total_xp = (user.xp_ui_ux or 0) + (user.xp_logic or 0) + (user.xp_data or 0) + (user.xp_devops or 0) + (user.xp_velocity or 0)
        user.level = int((total_xp ** 0.5) / 10) + 1
        
        db.commit()
        
    return {
        "status": res.get("status"),
        "feedback": res.get("feedback"),
        "xp_awarded": xp_awarded
    }


@router.get("/federated/export")
def export_federated_gradients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes local developer progression telemetry gradients.
    Formulates a privacy-preserving gradient update representing
    Loop 2 Population Learning specifications.
    """
    snapshots = db.query(BehavioralSnapshot).filter(
        BehavioralSnapshot.user_id == current_user.id
    ).order_by(BehavioralSnapshot.calculated_at.desc()).limit(14).all()
    
    # Defaults in case history is short
    avg_momentum = 50.0
    avg_consistency = 20.0
    alignment_gradient = 0.0
    streak_endurance = 1.0
    
    if len(snapshots) > 1:
        snapshot_list = list(reversed(snapshots))
        momentums = [s.momentum_score for s in snapshot_list]
        consistencies = [s.consistency_score for s in snapshot_list]
        
        avg_momentum = sum(momentums) / len(momentums)
        avg_consistency = sum(consistencies) / len(consistencies)
        
        # Simple gradient representing trajectory
        alignment_gradient = momentums[-1] - momentums[0]
        streak_endurance = sum(1 for c in consistencies if c > 15.0) / len(consistencies)
        
    return {
        "status": "success",
        "loop": 2,
        "federated_client_id": f"client_{current_user.github_id[:12] if current_user.github_id else 'anon'}",
        "telemetry_gradients": {
            "avg_alignment_index": round(avg_momentum, 2),
            "avg_consistency_index": round(avg_consistency, 2),
            "trajectory_gradient_delta": round(alignment_gradient, 2),
            "streak_endurance_ratio": round(streak_endurance, 2),
        },
        "privacy_guarantee": "Federated local gradients exported successfully. Context-isolated repository paths and commit messages scrubbed.",
        "global_learning_epoch": 1
    }
