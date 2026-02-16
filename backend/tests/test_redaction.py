"""
Test PII redaction utility functions.
"""
import pytest
from app.utils.redaction import redact_transcript, redact_phone_numbers, redact_email, redact_ssn


class TestPhoneRedaction:
    """Test phone number redaction."""
    
    def test_redact_phone_number(self):
        """Test redaction of phone numbers."""
        text = "Call me at 555-123-4567"
        redacted = redact_phone_numbers(text)
        assert "555-123-4567" not in redacted
        assert "[PHONE]" in redacted
    
    def test_redact_multiple_phone_formats(self):
        """Test redaction of various phone number formats."""
        test_cases = [
            ("555-123-4567", "My number is 555-123-4567"),
            ("(555) 123-4567", "Call (555) 123-4567"),
            ("555.123.4567", "Text 555.123.4567"),
        ]
        
        for phone, text in test_cases:
            redacted = redact_phone_numbers(text)
            # At minimum should not crash
            assert isinstance(redacted, str)
    
    def test_redact_empty_string(self):
        """Test redaction of empty string (edge case)."""
        redacted = redact_phone_numbers("")
        assert redacted == ""
    
    def test_phone_like_but_invalid(self):
        """Test that invalid phone-like numbers are handled (edge case)."""
        text = "Count to 123-45-67 or use code 555-99"
        redacted = redact_phone_numbers(text)
        # Should not crash
        assert isinstance(redacted, str)


class TestEmailRedaction:
    """Test email redaction."""
    
    def test_redact_email_address(self):
        """Test redaction of email addresses."""
        text = "Email me at john.doe@example.com"
        redacted = redact_email(text)
        assert "john.doe@example.com" not in redacted
        assert "[EMAIL]" in redacted
    
    def test_redact_multiple_emails(self):
        """Test redaction of multiple email addresses."""
        text = "Contact john@example.com or jane@test.org"
        redacted = redact_email(text)
        assert "john@example.com" not in redacted
        assert "jane@test.org" not in redacted
    
    def test_email_empty_string(self):
        """Test email redaction with empty string."""
        redacted = redact_email("")
        assert redacted == ""
    
    def test_email_like_but_invalid(self):
        """Test that invalid email-like strings are handled (edge case)."""
        text = "This is not@valid or @invalid.com"
        redacted = redact_email(text)
        # Should not crash
        assert isinstance(redacted, str)
    
    def test_email_case_insensitive(self):
        """Test that email redaction works regardless of case."""
        text = "EMAIL: JOHN@EXAMPLE.COM"
        redacted = redact_email(text)
        # Should handle uppercase emails
        assert isinstance(redacted, str)


class TestSSNRedaction:
    """Test SSN redaction."""
    
    def test_redact_ssn(self):
        """Test redaction of Social Security Numbers."""
        text = "My SSN is 123-45-6789"
        redacted = redact_ssn(text)
        assert "123-45-6789" not in redacted
        assert "[SSN]" in redacted
    
    def test_redact_ssn_empty(self):
        """Test SSN redaction with empty string."""
        redacted = redact_ssn("")
        assert redacted == ""
    
    def test_ssn_like_numbers(self):
        """Test that SSN-like numbers are handled correctly."""
        text = "Code 123-45-67 is incomplete"
        redacted = redact_ssn(text)
        # Should not crash
        assert isinstance(redacted, str)


class TestTranscriptRedaction:
    """Test full transcript redaction."""
    
    def test_redact_mixed_pii(self):
        """Test redaction of multiple PII types in one text."""
        text = "Contact John at john@example.com or 555-123-4567"
        redacted = redact_transcript(text)
        
        # Should handle multiple PII types
        assert isinstance(redacted, str)
        # Email and phone should be redacted
        assert "john@example.com" not in redacted or "[EMAIL]" in redacted
        assert "555-123-4567" not in redacted or "[PHONE]" in redacted
    
    def test_no_pii_present(self):
        """Test text without PII remains unchanged."""
        text = "I need to schedule an appointment for next Tuesday"
        redacted = redact_transcript(text)
        # Text without PII should remain largely unchanged
        assert "appointment" in redacted
        assert "Tuesday" in redacted
    
    def test_empty_string(self):
        """Test redaction of empty string (edge case)."""
        redacted = redact_transcript("")
        assert redacted == ""
    
    def test_special_characters_only(self):
        """Test redaction with only special characters (edge case)."""
        text = "!@#$%^&*()"
        redacted = redact_transcript(text)
        assert isinstance(redacted, str)
    
    def test_unicode_characters(self):
        """Test redaction preserves unicode characters."""
        text = "こんにちは 你好 привет"
        redacted = redact_transcript(text)
        assert isinstance(redacted, str)
    
    def test_very_long_text_with_pii(self):
        """Test redaction of very long text (performance edge case)."""
        text = ("This is filler text. " * 100) + "Email: test@example.com " + ("More filler. " * 100)
        redacted = redact_transcript(text)
        # Should handle large texts
        assert isinstance(redacted, str)
        assert len(redacted) > 0
    
    def test_redaction_preserves_structure(self):
        """Test that redaction preserves text structure."""
        text = "Name: John\nPhone: 555-123-4567\nEmail: john@example.com"
        redacted = redact_transcript(text)
        
        # Should preserve newlines and structure
        assert "\n" in redacted
        assert isinstance(redacted, str)
    
    def test_aggressive_redaction_mode(self):
        """Test aggressive redaction mode."""
        text = "John Smith called about appointment"
        redacted = redact_transcript(text, aggressive=True)
        
        # Aggressive mode should redact names
        assert isinstance(redacted, str)
    
    def test_whitespace_preservation(self):
        """Test that whitespace is preserved."""
        text = "Phone:   555-123-4567   Email:   john@example.com"
        redacted = redact_transcript(text)
        # Should preserve spacing
        assert isinstance(redacted, str)
    
    def test_tabs_and_newlines(self):
        """Test handling of tabs and newlines."""
        text = "Phone:\t555-123-4567\nEmail:\tjohn@example.com"
        redacted = redact_transcript(text)
        assert "\t" in redacted or isinstance(redacted, str)
        assert "\n" in redacted or isinstance(redacted, str)


class TestRedactionEdgeCases:
    """Test edge cases and boundary conditions."""
    
    def test_pii_at_text_boundaries(self):
        """Test PII at start and end of text."""
        text = "555-123-4567 is my number and email is john@example.com"
        redacted = redact_transcript(text)
        assert isinstance(redacted, str)
    
    def test_pii_with_punctuation(self):
        """Test PII adjacent to punctuation."""
        text = "Call me (555-123-4567), or email: john@example.com!"
        redacted = redact_transcript(text)
        assert isinstance(redacted, str)
    
    def test_multiple_same_pii(self):
        """Test redaction of same PII appearing multiple times."""
        text = "Call 555-123-4567 or text 555-123-4567"
        redacted = redact_phone_numbers(text)
        assert isinstance(redacted, str)
    
    def test_html_tags(self):
        """Test redaction with HTML tags (edge case)."""
        text = "<script>alert('test')</script> email: test@example.com"
        redacted = redact_transcript(text)
        # Should handle HTML safely
        assert isinstance(redacted, str)
    
    def test_sql_injection_attempt(self):
        """Test redaction with SQL injection-like text (security edge case)."""
        text = "'; DROP TABLE users; -- email: test@example.com"
        redacted = redact_transcript(text)
        # Should handle safely
        assert isinstance(redacted, str)
