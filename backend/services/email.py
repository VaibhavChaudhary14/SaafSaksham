import os
import resend
from backend.core.config import settings

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_report_confirmation(email: str, report_id: str, status: str):
    try:
        if not email:
            return
            
        params = {
            "from": "SaafSaksham <onboarding@resend.dev>",
            "to": [email],
            "subject": f"Report Received: {report_id}",
            "html": f"""
            <h1>Report Update</h1>
            <p>Your report ({report_id}) has been received.</p>
            <p><strong>Status:</strong> {status}</p>
            <p>Our AI is currently processing it. Thank you for your contribution!</p>
            """,
        }
        
        email_id = resend.Emails.send(params)
        print(f"Email sent: {email_id}")
        return email_id
        
    except Exception as e:
        print(f"Failed to send email: {e}")
