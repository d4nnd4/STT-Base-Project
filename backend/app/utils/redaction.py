"""
Privacy-focused text redaction utilities.

This module provides functions to redact personally identifiable information
(PII) from transcripts before logging, supporting HIPAA-minded design.

Note: This feauture is turned off, but to use it, please treat these elements
as helpers within the codebase.
"""

import re
from typing import List, Tuple


# Regex patterns for common PII
PHONE_PATTERN = re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b')
SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
DATE_PATTERN = re.compile(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b')

# Common first names (abbreviated list for demo, this can be scraped with the MCP implementation)
COMMON_NAMES = {
    'john', 'mary', 'james', 'patricia', 'robert', 'jennifer', 'michael', 
    'linda', 'william', 'elizabeth', 'david', 'barbara', 'richard', 'susan',
    'joseph', 'jessica', 'thomas', 'sarah', 'charles', 'karen'
}


def redact_phone_numbers(text: str) -> str:
    """
    Redact phone numbers from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with phone numbers replaced by [PHONE]
        
    Example:
        >>> redact_phone_numbers("Call me at 555-123-4567")
        'Call me at [PHONE]'
    """
    return PHONE_PATTERN.sub('[PHONE]', text)


def redact_ssn(text: str) -> str:
    """
    Redact Social Security Numbers from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with SSNs replaced by [SSN]
    """
    return SSN_PATTERN.sub('[SSN]', text)


def redact_email(text: str) -> str:
    """
    Redact email addresses from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with emails replaced by [EMAIL]
    """
    return EMAIL_PATTERN.sub('[EMAIL]', text)


def redact_names(text: str) -> str:
    """
    Redact common first names from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with common names replaced by [NAME]
        
    Note:
        This is a simple implementation using a small name list.
        Production systems should use NER (Named Entity Recognition).
    """
    words = text.split()
    redacted_words = []
    
    for word in words:
        clean_word = word.strip('.,!?;:').lower()
        if clean_word in COMMON_NAMES:
            redacted_words.append('[NAME]')
        else:
            redacted_words.append(word)
    
    return ' '.join(redacted_words)


def redact_transcript(text: str, aggressive: bool = False) -> str:
    """
    Apply all redaction rules to a transcript.
    
    Args:
        text: Input transcript text
        aggressive: If True, also redacts names and dates
        
    Returns:
        Redacted transcript
        
    Example:
        >>> redact_transcript("Hi, I'm John. My number is 555-1234.", aggressive=True)
        "Hi, I'm [NAME]. My number is [PHONE]."
    """
    result = text
    
    result = redact_phone_numbers(result)
    result = redact_ssn(result)
    result = redact_email(result)
    
    if aggressive:
        result = redact_names(result)
        result = DATE_PATTERN.sub('[DATE]', result)
    
    return result


def get_redacted_entities(text: str) -> List[Tuple[str, str]]:
    """
    Extract redacted entities for logging/auditing.
    
    Args:
        text: Input text
        
    Returns:
        List of (entity_type, redacted_value) tuples
        
    Example:
        >>> get_redacted_entities("Call 555-1234 or email me@example.com")
        [('phone', '555-1234'), ('email', 'me@example.com')]
    """
    entities = []
    
    for match in PHONE_PATTERN.finditer(text):
        entities.append(('phone', match.group()))
    
    for match in EMAIL_PATTERN.finditer(text):
        entities.append(('email', match.group()))
    
    for match in SSN_PATTERN.finditer(text):
        entities.append(('ssn', match.group()))
    
    return entities
