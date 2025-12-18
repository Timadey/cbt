from flask import jsonify, current_app, request
from flask_login import current_user, login_required
from app.proctoring import bp
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
    
    if not room:
        return jsonify({'error': 'Missing room parameter'}), 400
        
    api_key = current_app.config.get('LIVEKIT_API_KEY')
    api_secret = current_app.config.get('LIVEKIT_API_SECRET')
    
    if not api_key or not api_secret:
        # For development/demo purposes without credentials, return a dummy token or error
        return jsonify({'error': 'LiveKit credentials not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.'}), 500
        
    if not HAS_LIVEKIT:
        return jsonify({'error': 'LiveKit library not installed.'}), 500

    token = api.AccessToken(api_key, api_secret) \
        .with_identity(identity) \
        .with_name(identity) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True
        ))
        
    return jsonify({'token': token.to_jwt()})

@bp.route('/status', methods=['POST'])
def update_status():
    """Endpoint for students to send proctoring alerts/status updates"""
    data = request.json
    # Logic to record alert in database or notify admin via LiveKit data channel (handled in frontend mostly)
    print(f"Proctoring Alert: {data}")
    return jsonify({'status': 'received'})
