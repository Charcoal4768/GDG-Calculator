import math
import re

from flask import Blueprint, jsonify, request

api = Blueprint("api", __name__)

_ALLOWED_CHARACTERS = re.compile(r"[^0-9.+*/()-]")
_NUMBER = re.compile(r"(?:\d+(?:\.\d*)?|\.\d+)")
_OPERATORS = frozenset("+-*/")


def _clean_expression(expression):
    return _ALLOWED_CHARACTERS.sub("", expression)


def _precedence(operator):
    if operator.startswith("u"):
        return 3
    if operator in "+-":
        return 1
    if operator in "*/":
        return 2
    return 0


def _apply_operator(numbers, operators):
    operator = operators.pop()
    if operator.startswith("u"):
        if not numbers:
            raise ValueError("Invalid expression: not enough operands.")
        number = numbers.pop()
        numbers.append(-number if operator == "u-" else number)
        return

    if len(numbers) < 2:
        raise ValueError("Invalid expression: not enough operands.")

    right = numbers.pop()
    left = numbers.pop()

    if operator == "+":
        result = left + right
    elif operator == "-":
        result = left - right
    elif operator == "*":
        result = left * right
    elif operator == "/":
        if right == 0:
            raise ValueError("Division by zero.")
        result = left / right
    else:
        raise ValueError("Invalid operator.")

    numbers.append(result)


def _evaluate_expression(expression):
    cleaned = _clean_expression(expression)
    if not cleaned:
        raise ValueError("Expression is empty.")

    numbers = []
    operators = []
    position = 0
    expecting_number = True

    while position < len(cleaned):
        if expecting_number:
            character = cleaned[position]
            if character in "+-":
                operators.append("u" + character)
                position += 1
                continue
            if character == "(":
                operators.append(character)
                position += 1
                continue

            match = _NUMBER.match(cleaned, position)
            if match is None:
                raise ValueError("Invalid expression: expected a number.")
            numbers.append(float(match.group()))
            position = match.end()
            while operators and operators[-1].startswith("u"):
                _apply_operator(numbers, operators)
            expecting_number = False
            continue

        operator = cleaned[position]
        if operator == ")":
            while operators and operators[-1] != "(":
                _apply_operator(numbers, operators)
            if not operators:
                raise ValueError("Invalid expression: unmatched closing parenthesis.")
            operators.pop()
            position += 1
            while operators and operators[-1].startswith("u"):
                _apply_operator(numbers, operators)
            continue

        if operator not in _OPERATORS:
            raise ValueError("Invalid expression.")

        while (
            operators
            and operators[-1] != "("
            and _precedence(operators[-1]) >= _precedence(operator)
        ):
            _apply_operator(numbers, operators)

        operators.append(operator)
        position += 1
        expecting_number = True

    if expecting_number:
        raise ValueError("Invalid expression: expected a number after the operator.")

    while operators:
        if operators[-1] == "(":
            raise ValueError("Invalid expression: unmatched opening parenthesis.")
        _apply_operator(numbers, operators)

    if len(numbers) != 1:
        raise ValueError("Invalid expression.")

    result = numbers[0]
    if not math.isfinite(result):
        raise ValueError("Result is outside the supported numeric range.")
    return result


@api.post("/calculate")
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("expression"), str):
        return jsonify(error="Request must contain an expression string."), 400

    try:
        result = _evaluate_expression(data["expression"])
    except ValueError as error:
        return jsonify(error=str(error)), 400

    return jsonify(result=result)
