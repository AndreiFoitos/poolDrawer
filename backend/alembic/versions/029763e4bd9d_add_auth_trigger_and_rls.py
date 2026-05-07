"""add auth trigger and rls

Revision ID: 029763e4bd9d
Revises: 8b1c271885cd
Create Date: 2026-05-05

"""
from typing import Sequence, Union

from alembic import op

revision: str = "029763e4bd9d"
down_revision: Union[str, Sequence[str], None] = "8b1c271885cd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    #  TRIGGER: mirror auth.users → public.users on every new signup      #
    # ------------------------------------------------------------------ #
    # When Supabase creates a row in auth.users (on registration),
    # this function immediately creates the matching row in public.users.
    # We use NEW.id so the UUID is identical in both tables.
    # security definer means the function runs as the table owner,
    # which has permission to insert into public.users.
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
            INSERT INTO public.users (id, email, role)
            VALUES (
                NEW.id,
                NEW.email,
                'homeowner'
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """)

    op.execute("""
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE PROCEDURE public.handle_new_user();
    """)

    # ------------------------------------------------------------------ #
    #  RLS: enable on every table, then define access policies            #
    # ------------------------------------------------------------------ #

    # --- users ---
    op.execute("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;")

    # A user can only see their own row
    op.execute("""
        CREATE POLICY "users_select_own"
            ON public.users FOR SELECT
            USING (auth.uid() = id);
    """)

    # A user can update their own row (e.g. updating full_name)
    op.execute("""
        CREATE POLICY "users_update_own"
            ON public.users FOR UPDATE
            USING (auth.uid() = id);
    """)

    # The trigger function (running as SECURITY DEFINER) inserts on signup.
    # We still need an INSERT policy so the definer context can write.
    op.execute("""
        CREATE POLICY "users_insert_own"
            ON public.users FOR INSERT
            WITH CHECK (auth.uid() = id);
    """)

    # --- contractor_profiles ---
    op.execute("ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;")

    # Contractors can read and update their own profile
    op.execute("""
        CREATE POLICY "contractor_profiles_select_own"
            ON public.contractor_profiles FOR SELECT
            USING (auth.uid() = user_id);
    """)

    op.execute("""
        CREATE POLICY "contractor_profiles_insert_own"
            ON public.contractor_profiles FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    """)

    op.execute("""
        CREATE POLICY "contractor_profiles_update_own"
            ON public.contractor_profiles FOR UPDATE
            USING (auth.uid() = user_id);
    """)

    # Homeowners browsing for contractors can read approved profiles.
    # We join to public.users to check the viewer's role — anyone
    # authenticated can read approved contractor profiles.
    op.execute("""
        CREATE POLICY "contractor_profiles_select_approved"
            ON public.contractor_profiles FOR SELECT
            USING (approval_status = 'approved');
    """)

    # --- designs ---
    op.execute("ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;")

    op.execute("""
        CREATE POLICY "designs_all_own"
            ON public.designs FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    """)

    # --- projects ---
    op.execute("ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;")

    op.execute("""
        CREATE POLICY "projects_all_own"
            ON public.projects FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    """)

    # --- quotes ---
    # Quotes are more complex: the contractor who wrote it can see it,
    # and the homeowner whose project it belongs to can see it.
    op.execute("ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;")

    # Contractor can read/write their own quotes
    op.execute("""
        CREATE POLICY "quotes_contractor_own"
            ON public.quotes FOR ALL
            USING (
                auth.uid() IN (
                    SELECT user_id FROM public.contractor_profiles
                    WHERE id = contractor_id
                )
            )
            WITH CHECK (
                auth.uid() IN (
                    SELECT user_id FROM public.contractor_profiles
                    WHERE id = contractor_id
                )
            );
    """)

    # Homeowner can read quotes on their own projects
    op.execute("""
        CREATE POLICY "quotes_homeowner_read"
            ON public.quotes FOR SELECT
            USING (
                auth.uid() IN (
                    SELECT user_id FROM public.projects
                    WHERE id = project_id
                )
            );
    """)


def downgrade() -> None:
    # Remove RLS policies and triggers in reverse order

    # quotes
    op.execute('DROP POLICY IF EXISTS "quotes_homeowner_read" ON public.quotes;')
    op.execute('DROP POLICY IF EXISTS "quotes_contractor_own" ON public.quotes;')
    op.execute("ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;")

    # projects
    op.execute('DROP POLICY IF EXISTS "projects_all_own" ON public.projects;')
    op.execute("ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;")

    # designs
    op.execute('DROP POLICY IF EXISTS "designs_all_own" ON public.designs;')
    op.execute("ALTER TABLE public.designs DISABLE ROW LEVEL SECURITY;")

    # contractor_profiles
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_select_approved" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_update_own" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_insert_own" ON public.contractor_profiles;')
    op.execute('DROP POLICY IF EXISTS "contractor_profiles_select_own" ON public.contractor_profiles;')
    op.execute("ALTER TABLE public.contractor_profiles DISABLE ROW LEVEL SECURITY;")

    # users
    op.execute('DROP POLICY IF EXISTS "users_insert_own" ON public.users;')
    op.execute('DROP POLICY IF EXISTS "users_update_own" ON public.users;')
    op.execute('DROP POLICY IF EXISTS "users_select_own" ON public.users;')
    op.execute("ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;")

    # trigger and function
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user();")