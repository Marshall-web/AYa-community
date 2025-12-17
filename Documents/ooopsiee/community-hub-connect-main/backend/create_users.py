"""
Script to create initial admin and test users for the application
"""
import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User

def create_users():
    """Create default admin and test users"""
    
    # Create admin user if doesn't exist
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@community.com',
            password='admin123',
            first_name='Administrator',
            role='admin',
            status='active'
        )
        print(f"✓ Created admin user: {admin.username}")
    else:
        print("✓ Admin user already exists")
    
    # Create a test regular user if doesn't exist
    if not User.objects.filter(username='testuser').exists():
        user = User.objects.create_user(
            username='testuser',
            email='test@community.com',
            password='test123',
            first_name='Test',
            role='user',
            status='active'
        )
        print(f"✓ Created test user: {user.username}")
    else:
        print("✓ Test user already exists")

if __name__ == '__main__':
    create_users()
    print("\n✓ User creation complete!")
    print("\nYou can now login with:")
    print("  Admin: username=admin, password=admin123")
    print("  Test:  username=testuser, password=test123")
