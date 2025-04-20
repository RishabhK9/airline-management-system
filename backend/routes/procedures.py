from flask import Blueprint, request, jsonify
from db import execute

proc_bp = Blueprint("procedures", __name__, url_prefix="/api/proc")

@proc_bp.route("/<proc_name>", methods=["POST"])
def call_proc(proc_name):
    """
    Expects JSON body { arg1: val1, arg2: val2, … } in the exact order
    declared for that procedure. Returns { success: true } or 400.
    """
    args = request.json or {}
    placeholders = ", ".join(["%s"] * len(args))
    sql = f"CALL {proc_name}({placeholders})"
    try:
        execute(sql, list(args.values()))
        return jsonify(success=True), 200
    except Exception as e:
        return jsonify(error=str(e)), 400 