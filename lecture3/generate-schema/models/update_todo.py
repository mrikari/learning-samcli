from pydantic import BaseModel

class UpdateTodo(BaseModel):
    title: str | None = None
    checked: bool | None = None
