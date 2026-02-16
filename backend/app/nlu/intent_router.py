"""
Rule-based module that intents recognition for medical front office workflows.

This module implements intent classification using keyword matching,
pattern recognition, and entity extraction for appointment scheduling,
financial clearance, and general inquiries.

Note: This module should also function as a fixture for testing if an MCP is present.
"""

import re
from typing import Dict, Any, Optional
from datetime import datetime
from ..providers.base import IntentRouter, IntentResult


# Intent keywords and patterns for entity extraction
APPOINTMENT_KEYWORDS = {
    'appointment', 'schedule', 'booking', 'book', 'see the doctor',
    'visit', 'consultation', 'checkup', 'check-up', 'meeting', 'arrangement',
    'assignation'
}

FINANCIAL_KEYWORDS = {
    'insurance', 'coverage', 'copay', 'co-pay', 'deductible', 'bill',
    'payment', 'cost', 'price', 'charge', 'fee', 'financial', 'money'
}

GENERAL_KEYWORDS = {
    'hours', 'location', 'address', 'phone', 'contact', 'directions',
    'parking', 'questions', 'information', 'help'
}

# Date-time patterns
TIME_PATTERNS = [
    r'\b(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)\b',
    r'\b(morning|afternoon|evening|noon)\b',
]

DATE_PATTERNS = [
    r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
    r'\b(today|tomorrow|next week|this week)\b',
    r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b',
]


class RuleBasedIntentRouter(IntentRouter):
    """
    Rule-based intent classification class that uses keyword matching and patterns.
    
    This router identifies three primary intents:
    - APPOINTMENT_SCHEDULING: Requests to book/modify appointments
    - FINANCIAL_CLEARANCE: Insurance and payment questions
    - GENERAL_INQUIRY: Hours, location, and other information requests
    
    Example:
        router = RuleBasedIntentRouter()
        result = await router.route("I need an appointment next Tuesday at 2pm")
        # Result: intent=APPOINTMENT_SCHEDULING, entities={'date': 'tuesday', 'time': '2pm'}
    """
    
    def __init__(self, confidence_threshold: float = 0.6):
        """        
        Args:
            confidence_threshold: Minimum confidence for intent classification
        """
        self.confidence_threshold = confidence_threshold
    
    async def route(self, text: str) -> IntentResult:
        """
        Method that Classifies intent from user text. 

        This has to be anchored to the frontend application or the MCP.
        
        Args:
            text: User input text (transcribed speech)
            
        Returns:
            IntentResult with classified intent and extracted entities
        """
        text_lower = text.lower()
        
        appointment_score = self._score_intent(text_lower, APPOINTMENT_KEYWORDS)
        financial_score = self._score_intent(text_lower, FINANCIAL_KEYWORDS)
        general_score = self._score_intent(text_lower, GENERAL_KEYWORDS)
        
        max_score = max(appointment_score, financial_score, general_score)
        
        if max_score == 0:
            return IntentResult(
                intent="UNKNOWN",
                confidence=0.0,
                entities={},
                handoff_recommended=True,
                reasoning="No keywords matched any known intent"
            )
        
        if appointment_score == max_score:
            intent = "APPOINTMENT_SCHEDULING"
        elif financial_score == max_score:
            intent = "FINANCIAL_CLEARANCE"
        else:
            intent = "GENERAL_INQUIRY"
        
        # Normalize confidence score, this should detect accents as well (0-1)
        confidence = min(max_score / 3.0, 1.0)  # Max 3 keywords for full confidence
        
        # Extract entities such as keywords or timestamps
        entities = self._extract_entities(text_lower, intent)
        
        # Recommend this control var if confidence is low
        handoff_recommended = confidence < self.confidence_threshold
        
        reasoning = f"Matched {int(max_score)} keywords for {intent}"
        
        return IntentResult(
            intent=intent,
            confidence=confidence,
            entities=entities,
            handoff_recommended=handoff_recommended,
            reasoning=reasoning
        )
    
    def _score_intent(self, text: str, keywords: set) -> int:
        """
        This helper method counts all keyword matches in text.
        
        Args:
            text: Lowercase input text
            keywords: Set of keywords to match
            
        Returns:
            Number of matched keywords
        """
        return sum(1 for keyword in keywords if keyword in text)
    
    def _extract_entities(self, text: str, intent: str) -> Dict[str, Any]:
        """
        This method extracts entities relevant to the identified intent.

        TODO: MCP should override manual if branches.
        
        Args:
            text: Lowercase input text
            intent: Identified intent
            
        Returns:
            Dictionary of extracted entities
        """
        entities: Dict[str, Any] = {}
        
        if intent == "APPOINTMENT_SCHEDULING":
            time_entity = self._extract_time(text)
            if time_entity:
                entities['time'] = time_entity
            
            date_entity = self._extract_date(text)
            if date_entity:
                entities['date'] = date_entity
            
            if 'checkup' in text or 'check-up' in text:
                entities['appointment_type'] = 'checkup'
            elif 'consultation' in text:
                entities['appointment_type'] = 'consultation'
        
        elif intent == "FINANCIAL_CLEARANCE":
            if 'medicare' in text:
                entities['insurance_type'] = 'medicare'
            elif 'medicaid' in text:
                entities['insurance_type'] = 'medicaid'
            elif 'private' in text or 'insurance' in text:
                entities['insurance_type'] = 'private'
            
            if 'copay' in text or 'co-pay' in text:
                entities['query_type'] = 'copay'
            elif 'deductible' in text:
                entities['query_type'] = 'deductible'
            elif 'bill' in text or 'payment' in text:
                entities['query_type'] = 'billing'
        
        elif intent == "GENERAL_INQUIRY":
            if 'hours' in text or 'open' in text:
                entities['inquiry_type'] = 'hours'
            elif 'location' in text or 'address' in text or 'directions' in text:
                entities['inquiry_type'] = 'location'
            elif 'phone' in text or 'contact' in text:
                entities['inquiry_type'] = 'contact'
        
        return entities
    
    def _extract_time(self, text: str) -> Optional[str]:
        """
        Extract time references from text.
        """
        for pattern in TIME_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    def _extract_date(self, text: str) -> Optional[str]:
        """
        Extract date references from text.
        """
        for pattern in DATE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    async def health_check(self) -> bool:
        """
        Checks if the intent router is operational.
        
        Returns:
            Always True for rule-based router
        """
        return True


def generate_response(intent_result: IntentResult) -> str:
    """
    This helper generates a natural language response based on intent classification.
    
    Args:
        intent_result: Classified intent with entities
        
    Returns:
        Human-friendly response text
        
    Example:
        >>> result = IntentResult(intent="APPOINTMENT_SCHEDULING", ...)
        >>> generate_response(result)
        "I can help you schedule an appointment..."
    """
    intent = intent_result.intent
    entities = intent_result.entities
    
    if intent == "APPOINTMENT_SCHEDULING":
        time_str = entities.get('time', '')
        date_str = entities.get('date', '')
        
        if time_str and date_str:
            return f"I can help you schedule an appointment for {date_str} at {time_str}. Let me check our availability and get you booked."
        elif date_str:
            return f"I can help you schedule an appointment for {date_str}. What time works best for you?"
        else:
            return "I can help you schedule an appointment. What day and time would work best for you?"
    
    elif intent == "FINANCIAL_CLEARANCE":
        query_type = entities.get('query_type', '')
        insurance_type = entities.get('insurance_type', '')
        
        if query_type == 'copay':
            return "I can help you understand your copay. Let me look up your insurance information and provide specific details."
        elif query_type == 'deductible':
            return "I can help you with deductible information. Let me check your coverage details."
        elif insurance_type:
            return f"I can help you with your {insurance_type} coverage questions. What specific information do you need?"
        else:
            return "I can help you with insurance and billing questions. What would you like to know?"
    
    elif intent == "GENERAL_INQUIRY":
        inquiry_type = entities.get('inquiry_type', '')
        
        if inquiry_type == 'hours':
            return "Our office hours are Monday through Friday, 8 AM to 5 PM. We're closed on weekends and major holidays."
        elif inquiry_type == 'location':
            return "We're located at 123 Medical Plaza Drive, Suite 100. There's ample parking available in the adjacent lot."
        elif inquiry_type == 'contact':
            return "You can reach us at 555-0100. For urgent matters, please call our after-hours line."
        else:
            return "I'm here to help answer your questions. What information can I provide?"
    
    else:
        return "I'm here to help. Could you please clarify what you need assistance with? I can help with appointments, billing, or general information."
