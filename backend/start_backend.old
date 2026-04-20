source .venv/bin/activate && nohup python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development > /tmp/django_server.log 2>&1 & 
echo "Django server started with PID: $!"

# Verify Django server is running
curl -s http://127.0.0.1:8000/api/v1/quiz/questions/ 2>&1

# Seed quiz data in /home/project/tea-culture/cha-yuan/backend
source .venv/bin/activate && python manage.py seed_quiz --settings=chayuan.settings.development 2>&1

# Test Django root endpoint
curl -s http://127.0.0.1:8000/ 2>&1

# Check if Django server is running
ps aux | grep -E "(runserver|manage.py)" | grep -v grep

# Restart Django server in background in /home/project/tea-culture/cha-yuan/backend
pkill -f "manage.py runserver" 2>/dev/null; sleep 1; source .venv/bin/activate && python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development &

# Kill existing Django and check processes
pkill -9 -f "runserver" 2>/dev/null; sleep 1; ps aux | grep -E "(python|django)" | grep -v grep

# Check port 8000 status
lsof -i :8000 2>/dev/null || netstat -tlnp 2>/dev/null | grep 8000 || ss -tlnp 2>/dev/null | grep 8000

# The user has clarified the infrastructure setup:
1. PostgreSQL and Redis are running in Docker containers
2. Frontend and backend run natively (not containerized)
3. They connect via localhost/127.0.0.1
The containers are healthy and running. Now I need to:
1. Start the Django backend server natively (not in Docker)
2. Seed the database
3. Run the integration tests

# The containers are healthy and running. Let me start the Django backend server natively and connect to the running Postgre
# Verify Django can connect to PostgreSQL in /home/project/tea-culture/cha-yuan/backend
source .venv/bin/activate && python manage.py check --settings=chayuan.settings.development 2>&1

# Start Django server in background in /home/project/tea-culture/cha-yuan/backend
source .venv/bin/activate && nohup python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development > /tmp/django.log 2>&1 & echo $!

$ cd cha-yuan/backend && nohup python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development > /tmp/django.log 2>&1 &
[1] 2842036
(venv) pete@pop-os:/home/project/tea-culture
$ ps -ef | grep manage
root          99       2  0 Apr04 ?        00:00:00 [kworker/R-charger_manager]
pete        3745    3324  0 Apr04 ?        00:02:08 /usr/lib/x86_64-linux-gnu/libexec/kactivitymanagerd
pete     2842037 2842036 10 22:03 pts/5    00:00:00 python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
pete     2842039 2842037 20 22:03 pts/5    00:00:01 /opt/venv/bin/python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development

