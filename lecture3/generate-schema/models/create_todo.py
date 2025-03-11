from pydantic import BaseModel

class CreateTodo(BaseModel):
    title: str
