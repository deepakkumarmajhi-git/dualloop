from fastapi import APIRouter, Depends
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/user")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url,
        "email": current_user.email,
        "target_role": current_user.target_role,
        "level": current_user.level,
        "xp_ui_ux": current_user.xp_ui_ux,
        "xp_logic": current_user.xp_logic,
        "xp_data": current_user.xp_data,
        "xp_devops": current_user.xp_devops,
        "xp_velocity": current_user.xp_velocity
    }