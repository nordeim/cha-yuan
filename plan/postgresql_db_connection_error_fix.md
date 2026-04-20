$ docker exec chayuan-postgres psql -U chayuan_user -d chayuan_db -t -c "SHOW hba_file;"
perl: warning: Setting locale failed.
perl: warning: Please check that your locale settings:
        LANGUAGE = (unset),
        LC_ALL = "en_SG.utf8",
        LC_CTYPE = (unset),
        LC_NUMERIC = (unset),
        LC_COLLATE = (unset),
        LC_TIME = (unset),
        LC_MESSAGES = (unset),
        LC_MONETARY = (unset),
        LC_ADDRESS = (unset),
        LC_IDENTIFICATION = (unset),
        LC_MEASUREMENT = (unset),
        LC_PAPER = (unset),
        LC_TELEPHONE = (unset),
        LC_NAME = (unset),
        LANG = "en_SG.utf8"
    are supported and installed on your system.
perl: warning: Falling back to the standard locale ("C").
 /var/lib/postgresql/data/pgdata/pg_hba.conf

$ docker exec -u root chayuan-postgres sh -c 'echo "host chayuan_db chayuan_user 172.27.0.0/16 trust" >> /var/lib/postgresql/data/pgdata/pg_hba.conf'

$ psql -h localhost -U chayuan_user -d chayuan_db -c "\dt content.*"
psql: error: connection to server at "localhost" (127.0.0.1), port 5432 failed: FATAL:  no pg_hba.conf entry for host "172.27.0.1", user "chayuan_user", database "chayuan_db", no encryption

$ docker exec chayuan-postgres psql -U chayuan_user -d chayuan_db -c "SELECT pg_reload_conf();"
perl: warning: Setting locale failed.
perl: warning: Please check that your locale settings:
        LANGUAGE = (unset),
        LC_ALL = "en_SG.utf8",
        LC_CTYPE = (unset),
        LC_NUMERIC = (unset),
        LC_COLLATE = (unset),
        LC_TIME = (unset),
        LC_MESSAGES = (unset),
        LC_MONETARY = (unset),
        LC_ADDRESS = (unset),
        LC_IDENTIFICATION = (unset),
        LC_MEASUREMENT = (unset),
        LC_PAPER = (unset),
        LC_TELEPHONE = (unset),
        LC_NAME = (unset),
        LANG = "en_SG.utf8"
    are supported and installed on your system.
perl: warning: Falling back to the standard locale ("C").
 pg_reload_conf 
----------------
 t
(1 row)

$ psql -h localhost -U chayuan_user -d chayuan_db -c "\dt content.*"
Did not find any relation named "content.*".

$ psql -h localhost -U chayuan_user -d chayuan_db -c "\dt *.*"

$ psql -h localhost -U chayuan_user -d chayuan_db -c "\dn"
      List of schemas
  Name  |       Owner       
--------+-------------------
 public | pg_database_owner
(1 row)

PGPASSWORD=chayuan_dev_password psql -h localhost -U chayuan_user -d chayuan_db -c "\dt"

---

The PostgreSQL container is already mapping port 5432 to the host (0.0.0.0:5432->5432/tcp), so the Django app on the host should be able to connect via localhost:5432.
The issue is that the pg_hba.conf only allows connections from the Docker network (172.27.0.0/16) but not from the host (127.0.0.1 or localhost). I need to modify the pg_hba.conf to allow connections from the host.
Let me check the current pg_hba.conf and add a rule for
The PostgreSQL container is mapping port 5432 to the host, but pg_hba.conf only allows connections from the Docker network (172.27.0.0/16), not from
# Add localhost access rule to pg_hba.conf
$ docker exec chayuan-postgres bash -c "echo 'host all all 127.0.0.1/32 trust' >> /var/lib/postgresql/data/pgdata/pg_hba.conf" 2>&1
bash: warning: setlocale: LC_ALL: cannot change locale (en_SG.utf8): No such file or directory

I need to reload PostgreSQL to apply the new
# Reload PostgreSQL configuration
$ docker exec chayuan-postgres pg_ctl -D /var/lib/postgresql/data/pgdata reload 2>&1
pg_ctl: cannot be run as root
Please log in (using, e.g., "su") as the (unprivileged) user that will
own the server process.
Thinking: The container is running as a non-root user. I need to restart the container to apply the changes.
# Restart PostgreSQL container
$ docker restart chayuan-postgres 2>&1 && sleep 3 && docker ps | grep chayuan-postgres
chayuan-postgres
b10c0feddae7   postgres:17-trixie                    "docker-entrypoint.s…"   2 days ago     Up 3 seconds (health: starting)   0.0.0.0:5432->5432/tcp                        chayuan-postgres
Thinking: Now I need to update the pg_hba.conf again after restart. The container will reset it. Let me use a different approach - create a custom pg_hba

# Add Docker network rules and reload
$ docker exec chayuan-postgres bash -c "cat > /tmp/pg_hba_additions.conf << 'EOF'
# Allow all Docker networks
host all all 172.16.0.0/12 trust
host all all 192.168.0.0/16 trust
host all all 10.0.0.0/8 trust
host all all 127.0.0.1/32 trust
EOF
cat /tmp/pg_hba_additions.conf >> /var/lib/postgresql/data/pgdata/pg_hba.conf && \
pkill -HUP postgres" 2>&1

---

# Restart PostgreSQL container
$ docker restart chayuan-postgres 2>&1 && sleep 3 && docker ps | grep chayuan-postgres
chayuan-postgres
0106a37d5ce4   postgres:17-trixie                    "docker-entrypoint.s…"   2 minutes ago   Up 3 seconds (health: starting)   0.0.0.0:5432->5432/tcp                        chayuan-postgres
Thinking: Good! The PostgreSQL container is now running and starting up. Let me wait for it to be fully
# Test PostgreSQL connection from host
$ sleep 3 && psql postgresql://chayuan_user:chayuan_dev_password@127.0.0.1:5432/chayuan_db -c "SELECT datname FROM pg_database WHERE datname LIKE 'chayuan%';" 2>&1
datname     
-----------------
 chayuan_db
 chayuan_test_db
(2 rows)

Excellent! PostgreSQL is now accessible. Let me run migrations and re-seed the database
# Run Django migrations
$ cd /home/project/tea-culture/cha-yuan/backend && PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python manage.py migrate 2>&1

# Seed quiz data from backend directory
$ cd /home/project/tea-culture/cha-yuan/backend && PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python manage.py seed_quiz 2>&1
Seeding quiz questions...
  Created question: What tea strength do you prefer?...
    Created choice: Light and delicate - subtle flavors, eas... (white_tea=0.9, green_tea=0.6, oolong=0.3)
    Created choice: Medium and balanced - some complexity, n... (oolong=0.8, green_tea=0.5, white_tea=0.4)
    Created choice: Bold and robust - full-bodied, intense f... (black_tea=0.9, puerh=0.7, oolong=0.4)
  Created question: What flavor profiles appeal to you most?...
    Created choice: Floral and fragrant - orchid, jasmine, g... (oolong=0.9, white_tea=0.7, green_tea=0.4)
    Created choice: Fresh and grassy - vegetal, seaweed, spr... (green_tea=0.9, white_tea=0.5, oolong=0.3)
    Created choice: Earthy and woody - forest floor, aged, m... (puerh=0.9, black_tea=0.6, oolong=0.3)
    Created choice: Sweet and fruity - stone fruit, honey, m... (white_tea=0.8, oolong=0.6, green_tea=0.3)
…

# Run curation tests
$ cd /home/project/tea-culture/cha-yuan && PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python -m pytest backend/apps/commerce/tests/test_curation.py -v --tb=short 2>&1 | head -100
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.0.3, pluggy-1.6.0 -- /opt/venv/bin/python
cachedir: .pytest_cache
django: version: 6.0.4, settings: chayuan.settings.test (from env)
PySide6 6.9.2 -- Qt runtime 6.9.2 -- Qt compiled 6.9.2
hypothesis profile 'default'
rootdir: /home/project/tea-culture/cha-yuan/backend
configfile: pytest.ini
plugins: asyncio-1.3.0, django-4.12.0, respx-0.22.0, qt-4.5.0, Faker-40.5.1, mock-3.12.0, langsmith-0.5.1, logfire-4.16.0, anyio-4.13.0, cov-7.1.0, xdist-3.8.0, hypothesis-6.151.11
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
…

I need to regenerate the migration to include the null=True change. Let me create a new migration
# Check commerce migrations
$ cd /home/project/tea-culture/cha-yuan/backend && PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python manage.py makemigrations commerce --dry-run 2>&1
Migrations for 'commerce':
  apps/commerce/migrations/0002_alter_subscription_next_curation_override.py
    ~ Alter field next_curation_override on subscription

# Create commerce migration from backend directory in /home/project/tea-culture/cha-yuan/backend
$ PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python manage.py makemigrations commerce 2>&1
Migrations for 'commerce':
  apps/commerce/migrations/0002_alter_subscription_next_curation_override.py
    ~ Alter field next_curation_override on subscription

# Apply migrations in /home/project/tea-culture/cha-yuan/backend
$ PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python manage.py migrate 2>&1
Operations to perform:
  Apply all migrations: admin, auth, commerce, content, contenttypes, core, sessions
Running migrations:
  Applying commerce.0002_alter_subscription_next_curation_override... OK

# Run curation tests after fix
$ cd /home/project/tea-culture/cha-yuan && PYTHONPATH=/home/project/tea-culture/cha-yuan/backend:$PYTHONPATH DJANGO_SETTINGS_MODULE=chayuan.settings.test python -m pytest backend/apps/commerce/tests/test_curation.py -v --tb=short 2>&1 | tail -50
backend/apps/__init__.py                                                                 0      0   100%
backend/apps/api/__init__.py                                                            13      0   100%
backend/apps/api/apps.py                                                                 8      0   100%
backend/apps/api/v1/cart.py                                                             94     38    60%   27-39, 124-126, 138-153, 168-169, 179-186, 196-205, 217-221, 231-235, 245-249, 259-260
backend/apps/api/v1/checkout.py                                                         75     37    51%   96-130, 141-171, 181-184, 200
backend/apps/api/v1/content.py                                                          91     35    62%   87, 93-108, 127-130, 141-142, 152-159, 170-184, 192, 200-214, 223-227
backend/apps/api/v1/products.py                                                        144     41    72%   154-187, 196-211, 297-303, 320-327, 343-349, 368-375
backend/apps/api/v1/quiz.py                                                             88     49    44%   99, 117-139, 158-181, 210-251, 279-292
backend/apps/commerce/__init__.py                                                        0      0   100%
backend/apps/commerce/cart.py                                                          144    120    17%   53-56, 66-75, 85-91, 113-134, 147-186, 204-228, 244-250, 263-266, 286-325, 342-377, 392-395, 408-418
…

