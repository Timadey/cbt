from flask import jsonify, current_app, request, session
from flask_login import current_user, login_required
from app.proctoring import bp
from app import db
from app.models import Result
# We will use the livekit python sdk if available, otherwise mock it for now
try:
    from livekit import api
    HAS_LIVEKIT = True
except ImportError:
    HAS_LIVEKIT = False

@bp.route('/token', methods=['GET'])
def get_token():
    room = request.args.get('room')
    identity = request.args.get('identity', 'Anonymous Student')
    name = request.args.get('name', identity)
    
    if not room:
        return jsonify({'error': 'Missing room parameter'}), 400
        
    api_key = current_app.config.get('LIVEKIT_API_KEY')
    api_secret = current_app.config.get('LIVEKIT_API_SECRET')
    
    if not api_key or not api_secret:
        return jsonify({'error': 'LiveKit credentials not configured.'}), 500
        
    if not HAS_LIVEKIT:
        return jsonify({'error': 'LiveKit library not installed.'}), 500

    token = api.AccessToken(api_key, api_secret) \
        .with_identity(identity) \
        .with_name(name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True
        ))
        
    return jsonify({'token': token.to_jwt()})

@bp.route('/alert', methods=['POST'])
def record_alert():
    """Endpoint for students to send proctoring alerts individually"""
    data = request.json
    print(f"Proctoring Alert Received: {data}")
    return jsonify({'status': 'received'})

@bp.route('/summary', methods=['GET'])
@login_required
def get_summary():
    """Endpoint for teacher to fetch proctoring summary for a student"""
    student_id = request.args.get('studentId')
    room_id = request.args.get('roomId') # format: exam-<id>
    
    if not student_id or not room_id:
        return jsonify({'error': 'Missing parameters'}), 400
        
    try:
        qp_id = int(room_id.replace('exam-', ''))
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400
        
    # Attempt to find by ID first, then by name if necessary
    result = Result.query.filter_by(student_id=student_id, question_paper_id=qp_id).first()
    if not result:
        # Fallback search by name if student_id was actually a name
        from app.models import Student
        student = Student.query.filter_by(name=student_id).first()
        if student:
            result = Result.query.filter_by(student_id=student.id, question_paper_id=qp_id).first()

    if result and result.proctoring_logs:
        import json
        logs = json.loads(result.proctoring_logs)
        # Calculate counts
        counts = {}
        for log in logs:
            ltype = log.get('type')
            counts[ltype] = counts.get(ltype, 0) + 1
            
        return jsonify({
            'counts': counts,
            'logs': logs[-50:], # Latest 50
            'riskScore': 0 # Could calculate here if needed
        })
        
    return jsonify({'counts': {}, 'logs': []})

@bp.route('/save-logs', methods=['POST'])
def save_logs():
    """Endpoint for students to save all proctoring logs at the end of the session"""
    data = request.json
    print("saving ful log of data", data)
    question_paper_id = data.get('question_paper_id')
    logs = data.get('logs')
    
    if not question_paper_id or logs is None:
        return jsonify({'error': 'Missing data'}), 400
        
    # Use student_id if provided (for beacon often session is lost)
    student_id = data.get('student_id') or (current_user.id if current_user.is_authenticated else None)
    
    if not student_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    result = Result.query.filter_by(
        student_id=student_id,
        question_paper_id=question_paper_id
    ).first()
    
    if result:
        import json
        result.proctoring_logs = json.dumps(logs)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Proctoring logs saved'})
    return jsonify({'error': 'Result not found'}), 404
    
@bp.route('/enroll', methods=['POST'])
def enroll_candidate():
    """Proxy enrollment request to identify server"""
    server_url = current_app.config.get('ENROLLMENT_SERVER_URL')
    try:
        import requests
        resp = requests.post(f"{server_url}/api/v1/enroll", json=request.json, timeout=10)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/verify-identity', methods=['POST'])
def verify_identity_api():
    """Proxy verification request to identify server"""
    server_url = current_app.config.get('ENROLLMENT_SERVER_URL')
    try:
        import requests
        # Filter request for null frame_id as per user suggestion
        data = request.json
        data['frame_id'] = None
        
        resp = requests.post(f"{server_url}/api/v1/verify", json=data, timeout=10)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/set-verified', methods=['POST'])
def set_verified():
    """Mark identity as verified in session"""
    session['identity_verified'] = True
    return jsonify({'status': 'success'})
