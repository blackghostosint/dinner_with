import argparse
import os

import psycopg


def main():
    parser = argparse.ArgumentParser(description='Describe auth.users columns')
    parser.add_argument(
        '--connection',
        help='Postgres connection string (fallback to SUPABASE_DB_URL env)',
        default=os.environ.get('SUPABASE_DB_URL'),
    )
    parser.add_argument(
        '--connection-file',
        help='File containing the connection string (overrides --connection if provided)',
        type=argparse.FileType('r', encoding='utf-8'),
    )
    args = parser.parse_args()
    conn_string = args.connection
    if args.connection_file:
        conn_string = args.connection_file.read().strip()

    if not conn_string:
        raise SystemExit('SUPABASE_DB_URL must be set or --connection provided')

    with psycopg.connect(conn_string) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT column_name, data_type FROM information_schema.columns
                WHERE table_schema='auth' AND table_name='users'
                ORDER BY ordinal_position""",
            )
            rows = cur.fetchall()
    for column, dtype in rows:
        print(f'{column}: {dtype}')


if __name__ == '__main__':
    main()
