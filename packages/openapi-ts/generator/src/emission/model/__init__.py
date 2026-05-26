"""Universal template context model for all language emitters.

This package defines open-ended context objects used by Dart, TypeScript,
debug, and future language planners. Language planners inject prepared values;
emission only renders those values through templates.
"""

from emission.model.context import TemplateContext
from emission.model.value import TemplateValue

__all__ = ["TemplateContext", "TemplateValue"]
