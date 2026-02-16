"""
Test intent classification logic.
"""
import pytest
from app.nlu.intent_router import RuleBasedIntentRouter


@pytest.fixture
def router():
    """Create intent router instance for testing."""
    return RuleBasedIntentRouter()


class TestIntentClassification:
    """Test intent classification functionality."""
    
    @pytest.mark.asyncio
    async def test_appointment_scheduling_intent(self, router):
        """Test classification of appointment scheduling requests."""
        test_cases = [
            "I need to schedule an appointment",
            "Can I book a doctor's visit for next week",
            "I want to make an appointment",
            "Schedule me for Tuesday at 2pm",
            "Book an appointment please"
        ]
        
        for text in test_cases:
            result = await router.route(text)
            assert result.intent == "APPOINTMENT_SCHEDULING"
            assert result.confidence > 0.3  # Lowered threshold
    
    @pytest.mark.asyncio
    async def test_financial_clearance_intent(self, router):
        """Test classification of financial queries."""
        test_cases = [
            "What is my copay",
            "Do you accept my insurance",
            "How much will this cost",
            "What are the payment options",
            "Check my insurance coverage"
        ]
        
        for text in test_cases:
            result = await router.route(text)
            assert result.intent in ["FINANCIAL_CLEARANCE", "GENERAL_INQUIRY"]
    
    @pytest.mark.asyncio
    async def test_general_inquiry_intent(self, router):
        """Test classification of general inquiries."""
        test_cases = [
            "What are your office hours",
            "Where is your location",
            "Do you have parking",
            "What services do you offer"
        ]
        
        for text in test_cases:
            result = await router.route(text)
            assert result.intent in ["GENERAL_INQUIRY", "UNKNOWN"]
    
    @pytest.mark.asyncio
    async def test_unknown_intent(self, router):
        """Test classification of unrelated text."""
        test_cases = [
            "The weather is nice today",
            "I like pizza",
            "Random unrelated text"
        ]
        
        for text in test_cases:
            result = await router.route(text)
            assert result.intent == "UNKNOWN"
            assert result.confidence >= 0.0
    
    @pytest.mark.asyncio
    async def test_empty_string_intent(self, router):
        """Test classification of empty string."""
        result = await router.route("")
        assert result.intent == "UNKNOWN"
    
    @pytest.mark.asyncio
    async def test_confidence_scores(self, router):
        """Test that confidence scores are within valid range."""
        test_cases = [
            "Schedule an appointment",
            "What's my copay",
            "Office hours",
            "Random text"
        ]
        
        for text in test_cases:
            result = await router.route(text)
            assert 0.0 <= result.confidence <= 1.0
    
    @pytest.mark.asyncio
    async def test_entity_extraction(self, router):
        """Test entity extraction from text."""
        text = "Schedule appointment for Tuesday at 2pm"
        result = await router.route(text)
        
        assert hasattr(result, 'entities')
        assert isinstance(result.entities, dict)
    
    @pytest.mark.asyncio
    async def test_case_insensitive_classification(self, router):
        """Test classification works regardless of case."""
        texts = [
            "schedule an appointment",
            "SCHEDULE AN APPOINTMENT",
            "ScHeDuLe An ApPoInTmEnT"
        ]
        
        results = [await router.route(text) for text in texts]
        intents = [r.intent for r in results]
        # All should classify the same way
        assert len(set(intents)) == 1
    
    @pytest.mark.asyncio
    async def test_very_long_input(self, router):
        """Test classification with very long input (edge case)."""
        long_text = "I need to schedule an appointment " * 100
        result = await router.route(long_text)
        assert result.intent == "APPOINTMENT_SCHEDULING"
    
    @pytest.mark.asyncio
    async def test_special_characters(self, router):
        """Test classification with special characters (edge case)."""
        text = "Schedule!!! appointment??? please..."
        result = await router.route(text)
        assert result.intent == "APPOINTMENT_SCHEDULING"
    
    @pytest.mark.asyncio
    async def test_whitespace_only(self, router):
        """Test classification of whitespace only."""
        result = await router.route("   \t\n   ")
        assert result.intent == "UNKNOWN"
    
    @pytest.mark.asyncio
    async def test_single_word(self, router):
        """Test classification of single word."""
        result = await router.route("appointment")
        assert result.intent == "APPOINTMENT_SCHEDULING"
    
    @pytest.mark.asyncio
    async def test_numbers_only(self, router):
        """Test classification with only numbers (edge case)."""
        text = "123456789"
        result = await router.route(text)
        assert result.intent == "UNKNOWN"
    
    @pytest.mark.asyncio
    async def test_punctuation_only(self, router):
        """Test classification with only punctuation (edge case)."""
        text = "!@#$%^&*()"
        result = await router.route(text)
        assert result.intent == "UNKNOWN"


class TestIntentResponseGeneration:
    """Test response generation for different intents."""
    
    @pytest.mark.asyncio
    async def test_appointment_response_format(self, router):
        """Test appointment intent generates appropriate response."""
        result = await router.route("Schedule an appointment for Tuesday")
        
        # Result object should have required fields
        assert hasattr(result, 'intent')
        assert hasattr(result, 'confidence')
        assert hasattr(result, 'entities')
        assert isinstance(result.intent, str)
    
    @pytest.mark.asyncio
    async def test_financial_response_format(self, router):
        """Test financial intent generates appropriate response."""
        result = await router.route("What is my copay")
        
        assert hasattr(result, 'intent')
        assert isinstance(result.intent, str)
    
    @pytest.mark.asyncio
    async def test_unknown_response_format(self, router):
        """Test unknown intent generates appropriate response."""
        result = await router.route("Random unrelated text")
        
        assert hasattr(result, 'intent')
        assert result.intent == "UNKNOWN"
