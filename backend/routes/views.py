from flask import Blueprint, jsonify
from db import query

views_bp = Blueprint("views", __name__, url_prefix="/api/view")

@views_bp.route("/tables", methods=["GET"])
def get_tables():
    """
    Returns a list of all tables in the database.
    """
    tables = [
        'airline',
        'airplane',
        'airport',
        'flight',
        'leg',
        'location',
        'passenger',
        'passenger_vacations',
        'person',
        'pilot',
        'pilot_licenses',
        'route',
        'route_path'
    ]
    return jsonify([{"Tables_in_flight_tracking": table} for table in tables])

@views_bp.route("/<view_name>", methods=["GET"])
def get_view(view_name):
    """
    Returns JSON array of the rows in view `<view_name>`.
    """
    try:
        rows = query(f"SELECT * FROM {view_name}")
        return jsonify(rows)
    except Exception as e:
        return jsonify(error=str(e)), 400 