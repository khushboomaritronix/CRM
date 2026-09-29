from decimal import Decimal, ROUND_HALF_UP

TWOPLACES = Decimal("0.01")


def money(value):
    """Round a Decimal to 2 decimal places for storage in a money field."""
    return Decimal(value).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
