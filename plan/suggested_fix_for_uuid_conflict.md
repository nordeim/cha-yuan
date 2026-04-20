The conflict occurs because Django 6.0 has officially removed support for overriding path converters. Django-Ninja 1.0.1 attempts to register its own NinjaUUIDConverter using the name "uuid", which is already a built-in converter in Django. In previous versions, this only triggered a deprecation warning, but in Django 6.0, it prevents the application from starting. [1, 2, 3] 
## The Conflict Mechanism
The issue is located in ninja/signature/utils.py, where Django-Ninja calls register_converter(NinjaUUIDConverter, "uuid"). Django 6.0 strictly enforces unique converter names to prevent third-party libraries from unintentionally altering the behavior of standard Django views. [1, 3, 4] 
## Potential Fixes and Workarounds
Since you are running Django 6.0.4 and Django-Ninja 1.0.1, you can resolve this in one of three ways:

   1. Upgrade Django-Ninja (Recommended)
   As of late 2025/early 2026, newer versions of Django-Ninja (v1.3.0+) have addressed compatibility with Django 6.0 by using a different registration strategy or allowing the built-in converter to take precedence.
   * Try upgrading to the latest version: pip install -U django-ninja.
   2. Monkey-patch the Converter Registration
   If you cannot upgrade, you can "silence" the conflict by patching Django's converter registry before Django-Ninja is initialized. Add this to the top of your settings.py or your wsgi.py/asgi.py file:
   
   from django.urls import convertersfrom django.urls.base import register_converter
   # Prevent django-ninja from re-registering 'uuid' if it's already thereoriginal_register = register_converterdef safe_register(converter, type_name):
       if type_name == "uuid" and type_name in converters.DEFAULT_CONVERTERS:
           return # Skip registration to avoid Django 6.0 conflict
       return original_register(converter, type_name)
   import django.urls.base
   django.urls.base.register_converter = safe_register
   
   3. Use a Custom AppConfig to Control Import Order
   You can create a custom AppConfig that ensures your patch is applied before the ninja package is ever imported. This is often necessary because ninja might be imported early in the life cycle if used in urls.py. [5, 6] 

## Why this prevents migrations
Django runs a System Check before executing migrations. Because this converter conflict happens at the module-import level (when Django-Ninja is first loaded), the process crashes before it can even reach the database migration logic. [4, 7, 8] 
Would you like me to provide a custom AppConfig template to ensure this patch loads reliably across your entire environment?

[1] [https://github.com](https://github.com/vitalik/django-ninja/issues/1266)
[2] [https://github.com](https://github.com/vitalik/django-ninja/issues/1266)
[3] [https://github.com](https://github.com/vitalik/django-ninja/issues/1266#:~:text=django%2Dninja%20registers%20a%20converter%20called%20uuid%20%2C,this%20was%20also%20already%20raised%20in%20%23280.)
[4] [https://github.com](https://github.com/vitalik/django-ninja/issues/280#:~:text=now%20my%20DRF%20handlers%20are%20receiving%20strings,the%20param%20received%20by%20the%20DRF%20endpoint.)
[5] [https://github.com](https://github.com/vitalik/django-ninja/issues/1444)
[6] [https://github.com](https://github.com/vitalik/django-ninja/issues/1381)
[7] [https://docs.djangoproject.com](https://docs.djangoproject.com/en/6.0/topics/checks/)
[8] [https://stackoverflow.com](https://stackoverflow.com/questions/73671746/how-to-exclude-certain-system-checks-from-running-on-manage-py-migrate)

