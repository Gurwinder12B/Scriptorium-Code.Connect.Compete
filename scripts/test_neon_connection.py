import sys
import os

def test_neon_connection(connection_uri=None):
    uri = connection_uri or os.getenv("DATABASE_URL")
    if not uri:
        print("[ERROR] No database URI provided.")
        print("Usage: python scripts/test_neon_connection.py \"postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require\"")
        sys.exit(1)

    # Normalize uri
    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)

    print(f"[1/3] Parsing connection target...")
    masked_uri = uri.split("@")[-1] if "@" in uri else uri
    print(f"      Target host: {masked_uri}")

    try:
        from sqlalchemy import create_engine, text
        print("[2/3] Initializing SQLAlchemy engine with connection pool...")
        engine = create_engine(uri, pool_pre_ping=True)
        
        with engine.connect() as conn:
            print("[3/3] Executing test query against Neon PostgreSQL...")
            ver = conn.execute(text("SELECT version();")).scalar()
            db_name = conn.execute(text("SELECT current_database();")).scalar()
            print("\n[SUCCESS] Connected to Neon Cloud PostgreSQL!")
            print(f"          Database Name: {db_name}")
            print(f"          Version:       {ver[:60]}...")
            print("\nYour Neon database is ready for Scriptorium production use!")
    except Exception as e:
        print(f"\n[FAILED] Could not connect to database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    uri_arg = sys.argv[1] if len(sys.argv) > 1 else None
    test_neon_connection(uri_arg)
