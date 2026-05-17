from sqlalchemy import inspect
from app.db.session import engine

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables found: {tables}")
