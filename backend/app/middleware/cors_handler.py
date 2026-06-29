from flask_cors import CORS

def init_cors(app):
    # Allow local development and credential sharing (cookies/auth headers)
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )





