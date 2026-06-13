from sqlalchemy.orm import Session

from app.models import Notification


def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    link: str | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link=link,
    )
    db.add(notification)
    return notification
