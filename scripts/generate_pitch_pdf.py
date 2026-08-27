import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#166534"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "PROCUREX — Executive Pitch Deck, Presentation Strategy & Platform Manual")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, "SIH 2026 Problem Statement 26032")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, letter[0] - 54, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 32, "Confidential • Ministry of Agriculture & Farmers Welfare / Hackathon Finalist Guide")
        self.drawRightString(letter[0] - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def create_pitch_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#15803D")    # Primary Green
    c_dark = colors.HexColor("#14532D")       # Dark Green
    c_light = colors.HexColor("#DCFCE7")      # Light Green
    c_text = colors.HexColor("#1F2937")       # Text Primary
    c_muted = colors.HexColor("#4B5563")      # Text Muted
    c_amber = colors.HexColor("#D97706")      # Amber
    c_slate_bg = colors.HexColor("#F8FAFC")   # Light Gray
    c_border = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=c_dark
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_text
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_text
    )

    story = []

    # ==========================================
    # COVER / HEADER
    # ==========================================
    story.append(Paragraph("PROCUREX", title_style))
    story.append(Paragraph("National e-Procurement Mandi Management Platform & Real-Time Queue Ecosystem", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceBefore=2, spaceAfter=10))

    # Executive Metadata Box
    meta_data = [
        [
            Paragraph("<b>Target Problem:</b> SIH 2026 PS 26032", table_cell_style),
            Paragraph("<b>Domain:</b> Agri-Tech & Rural Governance", table_cell_style),
            Paragraph("<b>Live URL:</b> <font color='#15803D'>kissan-queue.onrender.com</font>", table_cell_style)
        ],
        [
            Paragraph("<b>Core Stack:</b> React 18, Node.js, MongoDB, Socket.IO", table_cell_style),
            Paragraph("<b>Languages:</b> English, Tamil (தமிழ்), Hindi (हिन्दी)", table_cell_style),
            Paragraph("<b>Channels:</b> Web + 2G SMS / USSD Offline", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[170, 170, 164])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_slate_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 1: EXECUTIVE ELEVATOR PITCH & VALUE PROPOSITION
    # ==========================================
    story.append(Paragraph("1. Executive Pitch & Value Proposition (The Hook)", h1_style))
    story.append(Paragraph(
        "<b>The Ground Reality:</b> Across India's 7,000+ Agricultural Produce Market Committees (APMCs/Mandis), millions of farmers face grueling <b>18 to 48-hour physical waiting lines</b> in tractor queues during peak harvest seasons. Overcrowding leads to grain spoilage, distress selling to exploitative middlemen, traffic gridlock, and administrative delays in MSP calculation.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The ProcureX Solution:</b> ProcureX is a production-grade, government-certified digital procurement platform that completely eliminates physical waiting queues through <b>atomic slot scheduling, live digital token broadcasting, electronic weighbridge integration, automated state grain logistics, and 2G feature phone access</b>.",
        body_style
    ))

    # Key Value Drivers Callout Box
    key_pillars = [
        [
            Paragraph("<b>⚡ 0 Hours Waiting:</b> Pre-booked 2-hr slots prevent Mandi road congestion.", callout_style),
            Paragraph("<b>⚖️ Fraud-Proof MSP:</b> Auto-computed ₹ payout based on net scale & moisture.", callout_style)
        ],
        [
            Paragraph("<b>🚚 Automated Logistics:</b> Weighment auto-dispatches trucks to state silos.", callout_style),
            Paragraph("<b>📶 100% Inclusive:</b> Full SMS and USSD (*999*26032#) for non-smartphone users.", callout_style)
        ]
    ]
    pill_table = Table(key_pillars, colWidths=[252, 252])
    pill_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#86EFAC")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#86EFAC")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(pill_table)
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 2: 4 STAKEHOLDER PORTALS & ARCHITECTURE
    # ==========================================
    story.append(Paragraph("2. Dedicated Role Portals & End-to-End Workflow", h1_style))
    
    portals_data = [
        [Paragraph("Portal Role", table_header_style), Paragraph("Target Users", table_header_style), Paragraph("Core Capabilities & Operational Responsibilities", table_header_style)],
        [
            Paragraph("<b>👨‍🌾 Farmer Portal</b>", table_cell_bold),
            Paragraph("Farmers, FPOs, Village Cooperatives", table_cell_style),
            Paragraph("• 3-Step Slot Booking (Crop, Mandi, 2-Hr Window)<br/>• Live WebSocket Queue Position Tracker & SMS Tokens<br/>• QR-Encoded Official Digital e-Slips & Aadhaar DBT Status", table_cell_style)
        ],
        [
            Paragraph("<b>🏢 Mandi Authority</b>", table_cell_bold),
            Paragraph("Mandi Secretaries, Yard Staff, Weighbridge Operators", table_cell_style),
            Paragraph("• Gate Check-In & Live Call Next Farmer Desk<br/>• Electronic Weighbridge Net Weight & Moisture % Logging<br/>• Automatic MSP Calculation & Digital e-Slip Issuance<br/>• Dynamic Slot Schedule & No-Show Reallocation", table_cell_style)
        ],
        [
            Paragraph("<b>🚚 Logistics Fleet</b>", table_cell_bold),
            Paragraph("State Grain Logistics Cell, Truck Drivers", table_cell_style),
            Paragraph("• Auto-Created Grain Transport Tasks from Mandi Weighments<br/>• Vehicle (HR-05-CD-9988) & Driver Assignment Modal<br/>• Real-time Milestone Tracking (Assigned → In Transit → Delivered)", table_cell_style)
        ],
        [
            Paragraph("<b>🏛️ State Admin</b>", table_cell_bold),
            Paragraph("Ministry Officials, State Agri Directors", table_cell_style),
            Paragraph("• State-wide Procurement Analytics & Crop Distribution Charts<br/>• APMC Mandi Oversight, Capacity Utilization, & Efficiency Ratios<br/>• User Management & Cryptographically Logged Audit Trail", table_cell_style)
        ],
    ]
    p_table = Table(portals_data, colWidths=[90, 110, 304])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 10))

    # Page Break for Pitching Strategy & Hackathon Guide
    story.append(PageBreak())

    # ==========================================
    # SECTION 3: WINNING PITCHING STRATEGY & SCRIPT
    # ==========================================
    story.append(Paragraph("3. Winning Pitching Strategy (The 5-Minute Master Deck)", h1_style))
    story.append(Paragraph("Deliver this structured narrative to win hackathons, panel evaluations, and government stakeholder presentations:", body_style))

    # Step by Step Pitching Structure Table
    pitch_steps = [
        [Paragraph("Time", table_header_style), Paragraph("Pitch Section", table_header_style), Paragraph("Key Narrative & What to Say to Judges", table_header_style)],
        [
            Paragraph("<b>0:00 - 0:45</b>", table_cell_bold),
            Paragraph("<b>1. The Hook & Ground Problem</b>", table_cell_bold),
            Paragraph("<i>'Imagine traveling 40 km with a tractor full of wheat, only to sleep on the road for 2 days in a 2-kilometer Mandi line.'</i> State that this causes ₹5,000 Cr in post-harvest losses annually in India.", table_cell_style)
        ],
        [
            Paragraph("<b>0:45 - 1:30</b>", table_cell_bold),
            Paragraph("<b>2. The ProcureX Solution</b>", table_cell_bold),
            Paragraph("Introduce ProcureX as the unified digital ecosystem that synchronizes farmer slots, gate queues, weighbridge scale sensors, and state transport silos.", table_cell_style)
        ],
        [
            Paragraph("<b>1:30 - 3:30</b>", table_cell_bold),
            Paragraph("<b>3. Live Connected Tech Demo</b>", table_cell_bold),
            Paragraph("Execute the real 4-role loop live: <b>Farmer books slot</b> → <b>Mandi calls token</b> → <b>Weighs produce & issues slip</b> → <b>Logistics automatically gets transport task & assigns fleet</b>. (Shows real data flow!)", table_cell_style)
        ],
        [
            Paragraph("<b>3:30 - 4:15</b>", table_cell_bold),
            Paragraph("<b>4. Technical Depth & Inclusivity</b>", table_cell_bold),
            Paragraph("Highlight atomic concurrency (no double booking), 2G SMS/USSD simulator for feature phones, Socket.IO live sync, and 100% multilingual support (English, Tamil, Hindi).", table_cell_style)
        ],
        [
            Paragraph("<b>4:15 - 5:00</b>", table_cell_bold),
            Paragraph("<b>5. Impact, Scale & Q&A Hook</b>", table_cell_bold),
            Paragraph("Conclude with scalability metrics: 100% cloud deployment on Render + MongoDB Atlas, direct Aadhaar DBT integration readiness, and seamless APMC adoption.", table_cell_style)
        ],
    ]
    pitch_table = Table(pitch_steps, colWidths=[65, 115, 324])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(pitch_table)
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 4: 10 PRO-TIPS FOR PRESENTATION & JURY Q&A
    # ==========================================
    story.append(Paragraph("4. Pro-Tips for Hackathons & Jury Defense (Q&A Secrets)", h1_style))
    
    tips = [
        "<b>Tip 1: Show, Don't Just Tell:</b> Do NOT stay on PowerPoint slides for more than 90 seconds. Jump straight into the live interactive application.",
        "<b>Tip 2: Demonstrate the Non-Smartphone Story:</b> Open the built-in <b>SMS / USSD Simulator (*999*26032#)</b> modal to prove you thought of illiterate and feature phone farmers.",
        "<b>Tip 3: Language Switching as a Wow-Factor:</b> Switch between English, Tamil, and Hindi live in front of the judges using the top-right header language dropdown.",
        "<b>Tip 4: Highlight Zero Hardcoded Data:</b> Open MongoDB / Audit Logs to prove every token, procurement receipt, and truck dispatch is stored in real databases.",
        "<b>Tip 5: Explain No-Show Slot Reallocation:</b> When asked <i>'What if a farmer books and does not show up?'</i> explain that after 3 calls, the slot is automatically released to waitlisted farmers.",
        "<b>Tip 6: Concurrency Defense:</b> When asked <i>'What if 100 farmers book the same slot at 9:00 AM?'</i> state that MongoDB atomic `findOneAndUpdate` with remaining capacity checks prevents overbooking.",
        "<b>Tip 7: Emphasize Automatic Logistics Handover:</b> Emphasize that when Mandi completes weighment, the Logistics dashboard automatically updates via WebSockets without manual phone calls.",
        "<b>Tip 8: Clear Role Separation:</b> Use 4 different browser tabs (or incognito) to show real-time synchronization between the Farmer, Mandi Desk, and Logistics Fleet.",
        "<b>Tip 9: Print e-Slip Receipt Live:</b> Click 'Print e-Receipt' on a completed procurement to showcase the QR-authenticated Government of India voucher.",
        "<b>Tip 10: State Administrator Oversight:</b> Show the Recharts crop distribution graph and immutable audit log to demonstrate government compliance."
    ]

    for tip in tips:
        story.append(Paragraph(f"• {tip}", bullet_style))
    
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # ==========================================
    # SECTION 5: LIVE DEMO CHEAT SHEET & DEFAULT CREDENTIALS
    # ==========================================
    story.append(Paragraph("5. Live Demo Cheat Sheet & Verified Test Credentials", h1_style))
    story.append(Paragraph("Use these pre-configured verified credentials during live presentation or testing:", body_style))

    creds_data = [
        [Paragraph("Role", table_header_style), Paragraph("Name", table_header_style), Paragraph("Login Mobile / Email", table_header_style), Paragraph("Password", table_header_style), Paragraph("Target Route", table_header_style)],
        [
            Paragraph("<b>👨‍🌾 Farmer</b>", table_cell_bold),
            Paragraph("Sardar Gurpreet Singh", table_cell_style),
            Paragraph("<b>9876500001</b><br/>farmer@procurex.gov.in", table_cell_style),
            Paragraph("<code>Password@123</code>", table_cell_style),
            Paragraph("<code>/farmer</code>", table_cell_style)
        ],
        [
            Paragraph("<b>🏢 Mandi Desk</b>", table_cell_bold),
            Paragraph("Shri Om Prakash", table_cell_style),
            Paragraph("<b>9999900002</b><br/>authority@procurex.gov.in", table_cell_style),
            Paragraph("<code>Password@123</code>", table_cell_style),
            Paragraph("<code>/storage</code>", table_cell_style)
        ],
        [
            Paragraph("<b>🚚 Logistics Fleet</b>", table_cell_bold),
            Paragraph("Food Grain Fleet Cell", table_cell_style),
            Paragraph("<b>9999900004</b><br/>logistics@procurex.gov.in", table_cell_style),
            Paragraph("<code>Password@123</code>", table_cell_style),
            Paragraph("<code>/logistics</code>", table_cell_style)
        ],
        [
            Paragraph("<b>🏛️ State Admin</b>", table_cell_bold),
            Paragraph("Dr. Rajiv Malhotra (IAS)", table_cell_style),
            Paragraph("<b>9999900001</b><br/>admin@procurex.gov.in", table_cell_style),
            Paragraph("<code>Admin@123</code>", table_cell_style),
            Paragraph("<code>/admin</code>", table_cell_style)
        ],
    ]
    c_table = Table(creds_data, colWidths=[75, 110, 155, 95, 69])
    c_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(c_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # SECTION 6: TECHNICAL INNOVATION & FUTURE ROADMAP
    # ==========================================
    story.append(Paragraph("6. Architectural Innovation & National Scalability", h1_style))

    tech_points = [
        [
            Paragraph("<b>Atomic Concurrency Engine:</b> MongoDB <code>findOneAndUpdate</code> with condition checks guarantees zero double-booking even under peak seasonal harvest spikes.", table_cell_style),
            Paragraph("<b>Bidirectional WebSockets:</b> Instant socket room broadcasts trigger turn alerts to farmers and new transport task alerts to logistics.", table_cell_style)
        ],
        [
            Paragraph("<b>Direct Benefit Transfer (DBT):</b> Automatic ₹ MSP calculation based on gross scale minus tare weight with moisture grading deductions.", table_cell_style),
            Paragraph("<b>State-Wide Scalability:</b> Microservice-ready REST APIs ready for integration with national e-NAM (National Agriculture Market) and FCI Silos.", table_cell_style)
        ]
    ]
    tech_table = Table(tech_points, colWidths=[252, 252])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_slate_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # Closing Signature Block
    story.append(Paragraph(
        "<b>ProcureX</b> is built with pride for Smart India Hackathon 2026 Problem Statement 26032 to transform agricultural procurement across India. Dedicated to empowering our farmers (<i>Jai Jawan, Jai Kisan</i>).",
        ParagraphStyle('FooterNotice', fontName='Helvetica-Oblique', fontSize=8.5, leading=12, textColor=c_muted, alignment=1)
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else "ProcureX_Pitching_Guide_and_Platform_Manual.pdf"
    create_pitch_pdf(target)
