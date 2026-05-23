from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.repository import Repository
from app.models.commit import Commit
from app.models.specialization_profile import SpecializationProfile
from app.models.behavioral_snapshot import BehavioralSnapshot


def calculate_behavioral_metrics(user_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    # 1. Fetch raw data inputs (Behavioral Signal Source)
    repositories = db.query(Repository).filter(Repository.owner_id == user_id).all()
    commits = db.query(Commit).join(Repository).filter(Repository.owner_id == user_id).all()

    # Default baseline scores (if no data synchronized yet)
    ui_ux_score = 20.0
    logic_algos_score = 20.0
    data_integrity_score = 20.0
    devops_score = 20.0
    velocity_score = 10.0

    if repositories:
        # Categorize by programming languages & files
        lang_counts = {}
        total_repos = len(repositories)
        
        for repo in repositories:
            lang = (repo.language or "").lower().strip()
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1

        # Heuristic genomic dimensions
        # UI/UX languages: HTML, CSS, JavaScript, TypeScript, SCSS
        ui_languages = ["javascript", "typescript", "html", "css", "vue", "scss"]
        ui_count = sum(lang_counts.get(l, 0) for l in ui_languages)

        # Logic & Algorithms: Python, Go, Rust, C++, Java, Kotlin, C#
        logic_languages = ["python", "go", "rust", "cpp", "c++", "java", "kotlin", "c#", "csharp"]
        logic_count = sum(lang_counts.get(l, 0) for l in logic_languages)

        # Data Integrity: SQL, R, Jupyter Notebook (ipynb), Python (split weight)
        data_languages = ["sql", "r", "jupyter notebook"]
        data_count = sum(lang_counts.get(l, 0) for l in data_languages)
        if "python" in lang_counts:
            # Distribute python weight half-logic, half-data if target is Data Scientist
            if (user.target_role or "").lower() == "data scientist":
                data_count += lang_counts["python"] * 0.5
                logic_count = max(0, logic_count - lang_counts["python"] * 0.5)

        # DevOps & Config: Dockerfile, Shell, YAML, Makefile
        infra_languages = ["shell", "dockerfile", "makefile"]
        infra_count = sum(lang_counts.get(l, 0) for l in infra_languages)

        total_weight = ui_count + logic_count + data_count + infra_count
        if total_weight > 0:
            ui_ux_score = round((ui_count / total_weight) * 90 + 10, 1)
            logic_algos_score = round((logic_count / total_weight) * 90 + 10, 1)
            data_integrity_score = round((data_count / total_weight) * 90 + 10, 1)
            devops_score = round((infra_count / total_weight) * 90 + 10, 1)
        else:
            # Fallback based on repository naming keywords if no explicit language
            for repo in repositories:
                name_lower = repo.name.lower()
                if any(x in name_lower for x in ["frontend", "react", "next", "ui", "design"]):
                    ui_ux_score += 15
                if any(x in name_lower for x in ["backend", "api", "logic", "algorithm", "server"]):
                    logic_algos_score += 15
                if any(x in name_lower for x in ["db", "database", "sql", "data", "model"]):
                    data_integrity_score += 15
                if any(x in name_lower for x in ["docker", "deploy", "ci", "cd", "infra"]):
                    devops_score += 15
            
            # Normalize fallbacks
            s = ui_ux_score + logic_algos_score + data_integrity_score + devops_score
            ui_ux_score = round((ui_ux_score / s) * 80 + 20, 1)
            logic_algos_score = round((logic_algos_score / s) * 80 + 20, 1)
            data_integrity_score = round((data_integrity_score / s) * 80 + 20, 1)
            devops_score = round((devops_score / s) * 80 + 20, 1)

    # 2. Compute Velocity & Endurance
    if commits:
        commit_count = len(commits)
        # Commit count mapping (max 100 at 200 commits)
        velocity_score = min(100.0, round((commit_count / 200.0) * 90 + 10, 1))
    else:
        velocity_score = 10.0

    # 3. Calculate Frontend Dominance & Backend Specialization
    frontend_dominance_ratio = round(ui_ux_score / 100.0, 2)
    backend_specialization_index = round((logic_algos_score + data_integrity_score) / 200.0, 2)

    # 4. Deduce RPG Class Title
    rpg_title = "Fullstack Developer"
    if ui_ux_score > 60.0:
        rpg_title = "Styling Virtuoso"
    elif logic_algos_score > 60.0:
        rpg_title = "Backend Craftsman"
    elif data_integrity_score > 55.0:
        rpg_title = "Data Craftsman"
    elif devops_score > 50.0:
        rpg_title = "Infrastructure Architect"
    elif ui_ux_score > 40.0 and logic_algos_score > 40.0:
        rpg_title = "Fullstack Generalist"

    # 5. Compute Career Alignment Score (Observed actions vs declared target role)
    target = (user.target_role or "Fullstack Developer").strip()
    alignment_score = 50.0

    if target == "Data Scientist":
        alignment_score = (data_integrity_score * 0.7) + (logic_algos_score * 0.3)
        # Penalize if mostly frontend
        if ui_ux_score > 45.0:
            alignment_score = max(10.0, alignment_score - (ui_ux_score - 45.0) * 0.8)
    elif target == "AI Engineer":
        alignment_score = (logic_algos_score * 0.6) + (data_integrity_score * 0.2) + (devops_score * 0.2)
        if ui_ux_score > 40.0:
            alignment_score = max(10.0, alignment_score - (ui_ux_score - 40.0) * 0.6)
    elif target == "Frontend Developer":
        alignment_score = ui_ux_score * 1.0
        # Penalize if heavy logic and 0 frontend UI
        if logic_algos_score > 60.0:
            alignment_score = max(10.0, alignment_score - (logic_algos_score - 60.0) * 0.5)
    elif target == "Backend Developer":
        alignment_score = (logic_algos_score * 0.7) + (data_integrity_score * 0.3)
        if ui_ux_score > 55.0:
            alignment_score = max(10.0, alignment_score - (ui_ux_score - 55.0) * 0.7)
    elif target == "Fullstack Developer":
        # Balanced score
        alignment_score = (ui_ux_score * 0.5) + (logic_algos_score * 0.5)

    alignment_score = round(min(100.0, max(10.0, alignment_score)), 1)

    # 6. Evaluate Severity Level (Inactivity / Drift)
    severity_level = "Normal"
    
    if not commits:
        severity_level = "Moderate"
    else:
        # Find date of most recent commit
        try:
            latest_commit_date = None
            for c in commits:
                if c.commit_date:
                    # typical date layout: 2026-05-18T12:00:00Z
                    c_date = datetime.strptime(c.commit_date[:10], "%Y-%m-%d")
                    if latest_commit_date is None or c_date > latest_commit_date:
                        latest_commit_date = c_date
            
            if latest_commit_date:
                days_inactive = (datetime.utcnow() - latest_commit_date).days
                if days_inactive > 14:
                    severity_level = "High"
                elif days_inactive > 7:
                    severity_level = "Moderate"
                elif alignment_score < 40.0:
                    severity_level = "Low-Moderate"
                else:
                    severity_level = "Normal"
        except Exception as e:
            print("Error parsing commit dates for severity calculation:", e)
            if alignment_score < 40.0:
                severity_level = "Low-Moderate"

    # Extreme critical drift
    if alignment_score < 25.0 and severity_level in ["Moderate", "High"]:
        severity_level = "Critical"

    # 7. Persist to SpecializationProfile (LOOP 2)
    profile = db.query(SpecializationProfile).filter(
        SpecializationProfile.user_id == user_id
    ).first()

    if not profile:
        profile = SpecializationProfile(
            user_id=user_id,
            career_alignment_score=alignment_score,
            severity_level=severity_level,
            backend_specialization_index=backend_specialization_index,
            frontend_dominance_ratio=frontend_dominance_ratio,
            developer_role_title=rpg_title
        )
        db.add(profile)
    else:
        profile.career_alignment_score = alignment_score
        profile.severity_level = severity_level
        profile.backend_specialization_index = backend_specialization_index
        profile.frontend_dominance_ratio = frontend_dominance_ratio
        profile.developer_role_title = rpg_title

    # 7.5 Update User XP and Level in user model
    commit_count = len(commits) if commits else 0
    xp_ui_ux = int(ui_ux_score * 12 + commit_count * 2)
    xp_logic = int(logic_algos_score * 12 + commit_count * 2)
    xp_data = int(data_integrity_score * 12 + commit_count * 2)
    xp_devops = int(devops_score * 12 + commit_count * 2)
    xp_velocity = int(velocity_score * 15 + commit_count * 4)
    total_xp = xp_ui_ux + xp_logic + xp_data + xp_devops + xp_velocity
    calculated_level = int((total_xp ** 0.5) / 10) + 1

    user.xp_ui_ux = xp_ui_ux
    user.xp_logic = xp_logic
    user.xp_data = xp_data
    user.xp_devops = xp_devops
    user.xp_velocity = xp_velocity
    user.level = calculated_level

    # 8. Store snapshot (LOOP 2 progression telemetry)
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    existing_snapshot = db.query(BehavioralSnapshot).filter(
        BehavioralSnapshot.user_id == user_id,
        BehavioralSnapshot.calculated_at == today_str
    ).first()

    # consistency_score matches velocity; momentum_score is our alignment index
    if not existing_snapshot:
        snapshot = BehavioralSnapshot(
            user_id=user_id,
            consistency_score=velocity_score,
            momentum_score=alignment_score,
            calculated_at=today_str
        )
        db.add(snapshot)
    else:
        existing_snapshot.consistency_score = velocity_score
        existing_snapshot.momentum_score = alignment_score

    db.commit()

    return {
        "user_id": user_id,
        "ui_ux_expression": ui_ux_score,
        "logic_algorithms": logic_algos_score,
        "data_integrity": data_integrity_score,
        "devops_config": devops_score,
        "velocity_endurance": velocity_score,
        "career_alignment_score": alignment_score,
        "severity_level": severity_level,
        "developer_role_title": rpg_title,
        "backend_specialization_index": backend_specialization_index,
        "frontend_dominance_ratio": frontend_dominance_ratio,
        "xp_ui_ux": xp_ui_ux,
        "xp_logic": xp_logic,
        "xp_data": xp_data,
        "xp_devops": xp_devops,
        "xp_velocity": xp_velocity,
        "level": calculated_level,
    }
