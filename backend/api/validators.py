"""
Input validators and sanitizers for the API.
"""
import re
import html
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from rest_framework import serializers


def validate_email_format(email: str) -> str:
    """
    Validate email format using Django's EmailValidator.
    Returns cleaned email or raises ValidationError.
    """
    if not email:
        raise serializers.ValidationError("Email is required.")
    
    email = email.strip().lower()
    
    validator = EmailValidator(message="Please enter a valid email address.")
    try:
        validator(email)
    except ValidationError:
        raise serializers.ValidationError("Please enter a valid email address.")
    
    return email


def validate_phone_number(phone: str, required: bool = True) -> str:
    """
    Validate Ghana phone number format.
    Accepts: +233XXXXXXXXX, 0XXXXXXXXX, or XXXXXXXXXX (10 digits)
    Returns cleaned phone or raises ValidationError.
    """
    if not phone:
        if required:
            raise serializers.ValidationError("Phone number is required.")
        return ""
    
    # Remove all spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)]', '', phone.strip())
    
    # Valid formats:
    # +233XXXXXXXXX (12 chars with +233)
    # 0XXXXXXXXX (10 chars starting with 0)
    # XXXXXXXXXX (10 digits)
    
    ghana_pattern = r'^(\+233[0-9]{9}|0[0-9]{9}|[0-9]{10})$'
    
    if not re.match(ghana_pattern, phone):
        raise serializers.ValidationError(
            "Please enter a valid Ghana phone number (e.g., +233201234567 or 0201234567)."
        )
    
    return phone


def sanitize_text(text: str, max_length: int = 500, escape_html: bool = False) -> str:
    """
    Sanitize user input text to prevent issues and limit length.
    - Strips leading/trailing whitespace
    - Limits length
    - Optionally escapes HTML entities (for content that will be rendered as HTML)
    """
    if not text:
        return ""
    
    # Strip whitespace
    text = text.strip()
    
    # Only escape HTML if explicitly requested (for content rendered as raw HTML)
    # For database storage and API responses, we typically don't need this
    if escape_html:
        text = html.escape(text)
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_username(username: str) -> str:
    """
    Validate username format.
    - 3-30 characters
    - Only letters, numbers, underscores, hyphens
    """
    if not username:
        raise serializers.ValidationError("Username is required.")
    
    username = username.strip().lower()
    
    if len(username) < 3:
        raise serializers.ValidationError("Username must be at least 3 characters.")
    
    if len(username) > 30:
        raise serializers.ValidationError("Username must be at most 30 characters.")
    
    if not re.match(r'^[a-z0-9_\-]+$', username):
        raise serializers.ValidationError(
            "Username can only contain letters, numbers, underscores, and hyphens."
        )
    
    return username


def validate_password(password: str) -> str:
    """
    Validate password strength.
    - At least 8 characters
    - Contains at least one letter and one number
    """
    if not password:
        raise serializers.ValidationError("Password is required.")
    
    if len(password) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters.")
    
    if not re.search(r'[A-Za-z]', password):
        raise serializers.ValidationError("Password must contain at least one letter.")
    
    if not re.search(r'[0-9]', password):
        raise serializers.ValidationError("Password must contain at least one number.")
    
    return password


def validate_name(name: str, field_name: str = "Name", required: bool = True) -> str:
    """
    Validate a person's name.
    - 1-100 characters
    - Only letters, spaces, hyphens, apostrophes
    """
    if not name:
        if required:
            raise serializers.ValidationError(f"{field_name} is required.")
        return ""
    
    name = name.strip()
    
    if len(name) > 100:
        raise serializers.ValidationError(f"{field_name} must be at most 100 characters.")
    
    # Allow letters, spaces, hyphens, apostrophes (for names like O'Brien, Mary-Jane)
    if not re.match(r"^[A-Za-z\s'\-]+$", name):
        raise serializers.ValidationError(
            f"{field_name} can only contain letters, spaces, hyphens, and apostrophes."
        )
    
    return name


def validate_positive_number(value, field_name: str = "Value") -> float:
    """
    Validate that a value is a positive number.
    """
    try:
        num = float(value)
        if num < 0:
            raise serializers.ValidationError(f"{field_name} must be a positive number.")
        return num
    except (ValueError, TypeError):
        raise serializers.ValidationError(f"{field_name} must be a valid number.")
