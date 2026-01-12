import os
import psycopg2

# Connection string provided by user
DB_URL = "postgresql://postgres:Vaibhav.14ry@db.mgyazyrahvcwmoagjdvh.supabase.co:5432/postgres"

def apply_migration():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Read the schema file
        # Check absolute path
        migration_file = r"d:\Projects\SaafSaksham\supabase\migrations\01_schema.sql"
        if not os.path.exists(migration_file):
            print(f"Error: Migration file not found at {migration_file}")
            return

        print(f"Reading migration file: {migration_file}")
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        print("Executing migration script...")
        cur.execute(sql_script)
        conn.commit()
        
        print("Migration applied successfully! ✅")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Failed to apply migration: {e}")

if __name__ == "__main__":
    apply_migration()
