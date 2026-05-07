"""disable rls and drop supabase auth trigger

Revision ID: d7e5c5293379
Revises: 62d9718abf56
Create Date: 2026-05-07

"""
from typing import Sequence, Union

from alembic import op

revision: str = "d7e5c5293379"
down_revision: Union[str, Sequence[str], None] = "62d9718abf56"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the Supabase trigger that auto-created public.users rows
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user();")

    # Disable RLS — FastAPI is now the sole gatekeeper
    op.execute("ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.contractor_profiles DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.designs DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;")

    # Drop all RLS policies (no longer needed)
    op.execute('DROP POLICY IF EXISTS "users_select_own" ON public.users;')
    op.execute('DROP POLICY IF EXISTS "users_update_own" ON public.users;')
    op.execute('DROP POLICY IF EXISTS "users_insert_own" ON public.users;')

    op.execute('DROP POLICY IF EXISTS "contractor_profiles_select_own" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_insert_own" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_update_own" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_select_approved" ON public.contractor_profiles;')

    op.execute('DROP POLICY IF EXISTS "designs_all_own" ON public.designs;')
    op.execute('DROP POLICY IF EXISTS "projects_all_own" ON public.projects;')

    op.execute('DROP POLICY IF EXISTS "quotes_contractor_own" ON public.quotes;')
    op.execute('DROP POLICY IF EXISTS "quotes_homeowner_read" ON public.quotes;')


def downgrade() -> None:
    # Re-enable RLS (policies would need to be recreated manually)
    op.execute("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;")